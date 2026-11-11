# GIU access hardening

Applied to GIU Tracking System on 11 November 2026 as Supabase migration
`20261111105932_giu_access_hardening`.

## Source and deployment baseline

The working branch is `codex/giu-access-hardening`, based on `1d5922543b8c564c01d92a97131d3eb0f14ada53`.
Render service `srv-d8bah2m7r5hc73amc70g` serves that commit as a static site
with publish path `.`. Auto-deploy is enabled for commits on `main`.
The observed live deploy is `dep-da6nrk15efls73d15r80`.

## Changes

- Request reads require admin/GIU, or NRL with a matching lab.
- Self-registration requires the caller's own ID, pending role, and the existing
  `Pending assignment` lab value. Admin approval continues through its existing policy.
- Request-ID reservation rejects missing sessions and nonstaff profiles before writing.
  Anonymous and PUBLIC execution grants are removed. The existing RPC signature and
  ID allocation behavior are preserved.

The allocation and request insert still occur in separate transactions. Concurrency
improvements remain a separate change.

## Verification

`node --check app.js` and `node --check tests/access-hardening.mjs` passed.

Generate candidate validation SQL with `node tests/access-hardening.mjs`.
Generate deployed-definition validation SQL with `node tests/access-hardening.mjs --live`.
Execute the complete output in one database connection through the GIU SQL tool.
The script copies table/function/policy definitions into a random test schema,
inserts synthetic records, tests database roles, and rolls the transaction back.
Any assertion failure raises an error. An error leaves the transaction aborted;
issue ROLLBACK before reusing a persistent connection.
The test does not copy production rows. Foreign keys, triggers, and browser Auth
flows are outside this focused authorization test.

Both candidate and deployed-definition checks passed. Before applying the patch,
`--baseline` reproduced the pending-profile visibility and anonymous RPC defects
against the prior definitions. That mode is intended for the vulnerable baseline.

Coverage includes pending, NRL matching and other labs, GIU, admin, missing profiles,
missing subjects, anonymous callers, self-registration, prohibited role/lab assignment,
admin approval, GIU creation/editing, and admin deletion.
All synthetic schemas were removed by rollback.

## Preservation and recovery

A verified Git bundle and a private application-data export were saved outside this
source checkout in the user's GIU project workspace. That workspace ignores both
the private-backups directory and bundle files. Keep personal records out of this
public repository.

The export contains 8 requests, 6 profiles, 1 counter, and pre-change policy/function
definitions. Post-change comparison verified every exported application row unchanged.
It excludes Auth credentials, browser storage, and a complete PostgreSQL schema dump.
A full disaster-recovery restore has not been rehearsed.

For an access regression, inspect the rejected role and lab before changing policies.
The private export retains the prior definitions for a targeted, reviewed recovery.
Restoring the former policies would reopen the reported vulnerabilities.
Application rollback in Render does not undo this database migration.

## Remaining work

Inventory staff browser profiles and origins, export browser-only requests and requester
caches, and reconcile them with the shared database before removing compatibility code.
Review concurrent editing and audit history next. Frontend modernization and browser
workflow testing are still pending.

The Supabase advisor still reports the existing trigger search path, helper RPC grants,
and disabled leaked-password protection. Counter-table RLS has no direct policies because
the existing privileged RPC handles allocation. Review these separately with their callers.
