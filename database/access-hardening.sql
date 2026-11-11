-- Apply as one transaction after the access tests pass.
begin;

alter policy "Role based request visibility" on public.giu_requests
using (
  public.current_profile_role() in ('admin', 'giu')
  or (
    public.current_profile_role() = 'nrl'
    and public.current_profile_lab() = lab
  )
);

alter policy "Users can create pending profile" on public.profiles
with check (
  id = auth.uid()
  and role = 'pending'
  and lab = 'Pending assignment'
);

CREATE OR REPLACE FUNCTION public.reserve_giu_display_id(target_year integer DEFAULT (EXTRACT(year FROM now()))::integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  next_number integer;
begin
  if auth.uid() is null
     or coalesce(public.current_profile_role() not in ('admin', 'giu'), true) then
    raise exception 'Only GIU staff and administrators can reserve request IDs.'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(target_year);

  with used_numbers as (
    select substring(display_id from '^GIU-[0-9]{4}-([0-9]+)$')::integer as number
    from public.giu_requests
    where display_id ~ ('^GIU-' || target_year || '-[0-9]+$')
  ),
  search_limit as (
    select greatest(coalesce(max(number), 0) + 1, 999) as max_number
    from used_numbers
  )
  select candidate.number into next_number
  from generate_series(1, (select max_number from search_limit)) as candidate(number)
  where not exists (
    select 1 from used_numbers where used_numbers.number = candidate.number
  )
  order by candidate.number
  limit 1;

  insert into public.giu_request_id_counters (year, last_number)
  values (target_year, next_number)
  on conflict (year) do update
  set last_number = excluded.last_number;

  return 'GIU-' || target_year || '-' || lpad(next_number::text, 3, '0');
end;
$function$
;

revoke execute on function public.reserve_giu_display_id(integer) from public, anon;
grant execute on function public.reserve_giu_display_id(integer) to authenticated;

commit;
