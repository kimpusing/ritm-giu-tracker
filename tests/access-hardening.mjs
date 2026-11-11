import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const schema = 'giu_access_test_' + randomBytes(6).toString('hex');
const baseline = process.argv.includes('--baseline');
const live = process.argv.includes('--live');
const patch = readFileSync(new URL('../database/access-hardening.sql', import.meta.url), 'utf8')
  .replace(/^\uFEFF/, '')
  .replace(/^begin;$/m, '')
  .replace(/^commit;$/m, '')
  .replaceAll('public.', schema + '.');
const uid = number => '00000000-0000-4000-8000-' + String(number).padStart(12, '0');
const actor = number => "select set_config('request.jwt.claim.sub', '" + (number ? uid(number) : '') + "', true);";
const expect = (condition, label) =>
  "do $test$ begin if (" + condition + ") is not true then raise exception 'FAIL " + label + "'; end if; end $test$;";
const denied = (statement, label) =>
  "do $test$ begin begin " + statement + "; raise exception 'FAIL " + label +
  "'; exception when insufficient_privilege then null; end; end $test$;";
const request = (id, lab) =>
  "insert into " + schema + ".giu_requests(display_id,lab,program,project,stage,status,priority,assignee,received,target) values ('" +
  id + "','" + lab + "','Test','Synthetic fixture','Request received','In progress','Routine','Test',current_date,current_date)";
const profile = (number, role, lab) =>
  "insert into " + schema + ".profiles(id,role,lab) values ('" + uid(number) + "','" + role + "','" + lab + "')";

const statements = [
  'begin;',
  "set local statement_timeout = '20s';",
  'create schema ' + schema + ';',
  'grant usage on schema ' + schema + ' to anon, authenticated;',
  ...['profiles', 'giu_requests', 'giu_request_id_counters'].map(table =>
    'create table ' + schema + '.' + table + ' (like public.' + table + ' including all);' +
    'alter table ' + schema + '.' + table + ' enable row level security;' +
    'grant select, insert, update, delete on ' + schema + '.' + table + ' to anon, authenticated;'),
  // Clone schema definitions only. No production row is copied.
  "do $setup$ declare fn record; pol record; definition text; begin " +
  "for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace " +
  "where n.nspname='public' and p.proname in ('current_profile_role','current_profile_lab','reserve_giu_display_id') loop " +
  "definition := replace(pg_get_functiondef(fn.oid), 'public.', '" + schema + ".'); " +
  "definition := replace(definition, 'SET search_path TO ''public''', 'SET search_path TO ''" + schema + "'''); " +
  "execute definition; end loop; " +
  "for pol in select * from pg_policies where schemaname='public' and tablename in ('profiles','giu_requests','giu_request_id_counters') loop " +
  "execute format('create policy %I on %I.%I as %s for %s to %s %s %s',pol.policyname,'" + schema +
  "',pol.tablename,pol.permissive,pol.cmd,array_to_string(pol.roles,',')," +
  "case when pol.qual is null then '' else 'using (' || replace(replace(pol.qual,'public.',''),'current_profile_', '" + schema + ".current_profile_') || ')' end," +
  "case when pol.with_check is null then '' else 'with check (' || replace(replace(pol.with_check,'public.',''),'current_profile_', '" + schema + ".current_profile_') || ')' end); end loop; end $setup$;",
  profile(1, 'pending', 'Lab A') + ';',
  profile(2, 'nrl', 'Lab A') + ';',
  profile(3, 'giu', 'GIU') + ';',
  profile(4, 'admin', 'GIU') + ';',
  profile(5, 'nrl', 'Lab C') + ';',
  request('GIU-2026-001', 'Lab A') + ';',
  request('GIU-2026-002', 'Lab B') + ';'
];

// Preserve the live RPC's effective grants when validating the deployed policy.
statements.push(
  "revoke execute on function " + schema + ".reserve_giu_display_id(integer) from public, anon, authenticated;",
  "do $grants$ begin " +
  "if has_function_privilege('anon','public.reserve_giu_display_id(integer)','execute') then " +
  "execute 'grant execute on function " + schema + ".reserve_giu_display_id(integer) to anon'; end if; " +
  "if has_function_privilege('authenticated','public.reserve_giu_display_id(integer)','execute') then " +
  "execute 'grant execute on function " + schema + ".reserve_giu_display_id(integer) to authenticated'; end if; end $grants$;"
);
if (!baseline && !live) statements.push(patch);
statements.push('set local role authenticated;', actor(1));
statements.push(expect('(select count(*) from ' + schema + '.giu_requests) = ' + (baseline ? 1 : 0), 'pending visibility'));

if (baseline) {
  statements.push('reset role;', 'set local role anon;', actor(null));
  statements.push(expect(schema + ".reserve_giu_display_id(2026) = 'GIU-2026-003'", 'baseline anonymous RPC'));
} else {
  for (const [number, count] of [[2, 1], [3, 2], [4, 2], [5, 0], [6, 0]]) {
    statements.push(actor(number), expect('(select count(*) from ' + schema + '.giu_requests) = ' + count, 'role visibility ' + number));
  }
  for (const number of [1, 2, 5, 6]) {
    statements.push(actor(number), denied('perform ' + schema + '.reserve_giu_display_id(2026)', 'RPC denied ' + number));
  }
  // A real authenticated session with no subject must fail closed too.
  statements.push(actor(null), denied('perform ' + schema + '.reserve_giu_display_id(2026)', 'RPC missing subject'));
  for (const number of [3, 4]) {
    statements.push(actor(number), expect(schema + ".reserve_giu_display_id(2026) = 'GIU-2026-003'", 'staff RPC ' + number));
  }
  statements.push(actor(6));
  statements.push(denied(profile(6, 'pending', 'Lab A'), 'self assigned lab'));
  statements.push(denied(profile(6, 'admin', 'Pending assignment'), 'self assigned role'));
  statements.push(denied(profile(7, 'pending', 'Pending assignment'), 'other user profile'));
  statements.push(profile(6, 'pending', 'Pending assignment') + ';');
  statements.push(expect('(select count(*) from ' + schema + '.profiles) = 1', 'self registration'));
  statements.push(denied(request('GIU-2026-010', 'Lab A'), 'pending create request'));
  statements.push(actor(2), denied(request('GIU-2026-010', 'Lab A'), 'NRL create request'));
  statements.push(actor(3), request('GIU-2026-003', 'Lab A') + ';');
  statements.push("update " + schema + ".giu_requests set notes='GIU edit' where display_id='GIU-2026-003';");
  statements.push(expect("(select notes from " + schema + ".giu_requests where display_id='GIU-2026-003') = 'GIU edit'", 'GIU edit'));
  statements.push(actor(4));
  statements.push("update " + schema + ".profiles set role='nrl', lab='Lab A' where id='" + uid(6) + "';");
  statements.push(actor(6), expect('(select count(*) from ' + schema + '.giu_requests) = 2', 'admin approval'));
  statements.push(actor(4), "delete from " + schema + ".giu_requests where display_id='GIU-2026-003';");
  statements.push(expect('(select count(*) from ' + schema + '.giu_requests) = 2', 'admin delete'));
  statements.push('reset role;', 'set local role anon;', actor(null));
  statements.push(expect('(select count(*) from ' + schema + '.giu_requests) = 0', 'anonymous visibility'));
  statements.push(denied('perform ' + schema + '.reserve_giu_display_id(2026)', 'anonymous RPC'));
}
statements.push('reset role;', "select '" + (baseline ? 'baseline vulnerabilities reproduced' : 'access hardening checks passed') + "' as result;", 'rollback;');
console.log(statements.join('\n'));
