-- TrafiNexo workspace isolation hardening.

create schema if not exists private;

create or replace function private.traf_can_manage(p_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path='public','private'
as $$
  select exists(
    select 1
    from public.traf_workspace_members m
    where m.workspace_id=p_workspace
      and m.user_id=auth.uid()
      and m.role in ('owner','admin','manager')
  );
$$;

revoke all on function private.traf_can_manage(uuid) from public,anon;
grant execute on function private.traf_can_manage(uuid) to authenticated;

create or replace function private.traf_validate_fk_workspace()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  target_id_text text;
  ok boolean;
begin
  target_id_text:=to_jsonb(new)->>tg_argv[0];
  if target_id_text is null or target_id_text='' then return new; end if;

  execute format(
    'select exists(select 1 from public.%I where id=$1 and workspace_id=$2)',
    tg_argv[1]
  )
  into ok
  using target_id_text::uuid,new.workspace_id;

  if not coalesce(ok,false) then
    raise exception '% references a record from another workspace',tg_argv[0];
  end if;

  return new;
end;
$$;

revoke all on function private.traf_validate_fk_workspace()
from public,anon,authenticated;

do $$
declare
  r record;
  trig_name text;
begin
  for r in
    with fk as (
      select distinct
        c.conname,
        child.relname as child_table,
        a_child.attname as child_column,
        parent.relname as parent_table,
        a_parent.attname as parent_column
      from pg_constraint c
      join pg_class child on child.oid=c.conrelid
      join pg_namespace nc on nc.oid=child.relnamespace
      join pg_class parent on parent.oid=c.confrelid
      join pg_namespace np on np.oid=parent.relnamespace
      join lateral unnest(c.conkey) with ordinality ck(attnum,ord) on true
      join lateral unnest(c.confkey) with ordinality pk(attnum,ord) on pk.ord=ck.ord
      join pg_attribute a_child on a_child.attrelid=child.oid and a_child.attnum=ck.attnum
      join pg_attribute a_parent on a_parent.attrelid=parent.oid and a_parent.attnum=pk.attnum
      where c.contype='f'
        and nc.nspname='public'
        and np.nspname='public'
        and child.relname like 'traf_%'
        and parent.relname like 'traf_%'
    )
    select *
    from fk
    where parent_column='id'
      and exists(
        select 1 from information_schema.columns x
        where x.table_schema='public'
          and x.table_name=fk.child_table
          and x.column_name='workspace_id'
      )
      and exists(
        select 1 from information_schema.columns x
        where x.table_schema='public'
          and x.table_name=fk.parent_table
          and x.column_name='workspace_id'
      )
  loop
    trig_name:='trg_traf_tenant_'||substr(md5(r.conname),1,16);
    execute format('drop trigger if exists %I on public.%I',trig_name,r.child_table);
    execute format(
      'create trigger %I before insert or update of workspace_id,%I on public.%I for each row execute function private.traf_validate_fk_workspace(%L,%L)',
      trig_name,r.child_column,r.child_table,r.child_column,r.parent_table
    );
  end loop;
end $$;

create or replace function private.traf_protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare owner_count integer;
begin
  if old.role<>'owner' then return coalesce(new,old); end if;
  if tg_op='UPDATE' and new.role='owner' then return new; end if;

  select count(*) into owner_count
  from public.traf_workspace_members
  where workspace_id=old.workspace_id and role='owner';

  if owner_count<=1 then
    raise exception 'workspace must keep at least one owner';
  end if;

  return coalesce(new,old);
end;
$$;

revoke all on function private.traf_protect_last_owner()
from public,anon,authenticated;

drop trigger if exists trg_traf_protect_last_owner on public.traf_workspace_members;
create trigger trg_traf_protect_last_owner
before delete or update of role
on public.traf_workspace_members
for each row execute function private.traf_protect_last_owner();

create or replace function private.traf_protect_workspace_owner()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    if auth.uid() is not null and auth.uid()<>old.owner_id then
      raise exception 'only the current owner can transfer workspace ownership';
    end if;

    if not exists(
      select 1 from public.traf_workspace_members m
      where m.workspace_id=old.id
        and m.user_id=new.owner_id
        and m.role='owner'
    ) then
      raise exception 'new workspace owner must already have owner role';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.traf_protect_workspace_owner()
from public,anon,authenticated;

drop trigger if exists trg_traf_protect_workspace_owner on public.traf_workspaces;
create trigger trg_traf_protect_workspace_owner
before update of owner_id
on public.traf_workspaces
for each row execute function private.traf_protect_workspace_owner();

drop policy if exists traf_integrations_member_all on public.traf_integrations;
create policy traf_integrations_member_select on public.traf_integrations
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_integrations_manager_insert on public.traf_integrations
for insert to authenticated with check (private.traf_can_manage(workspace_id));
create policy traf_integrations_manager_update on public.traf_integrations
for update to authenticated using (private.traf_can_manage(workspace_id))
with check (private.traf_can_manage(workspace_id));
create policy traf_integrations_manager_delete on public.traf_integrations
for delete to authenticated using (private.traf_can_manage(workspace_id));

drop policy if exists traf_ad_accounts_member_all on public.traf_ad_accounts;
create policy traf_ad_accounts_member_select on public.traf_ad_accounts
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_ad_accounts_manager_insert on public.traf_ad_accounts
for insert to authenticated with check (private.traf_can_manage(workspace_id));
create policy traf_ad_accounts_manager_update on public.traf_ad_accounts
for update to authenticated using (private.traf_can_manage(workspace_id))
with check (private.traf_can_manage(workspace_id));
create policy traf_ad_accounts_manager_delete on public.traf_ad_accounts
for delete to authenticated using (private.traf_can_manage(workspace_id));

drop policy if exists traf_social_accounts_member_all on public.traf_social_accounts;
create policy traf_social_accounts_member_select on public.traf_social_accounts
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_social_accounts_manager_insert on public.traf_social_accounts
for insert to authenticated with check (private.traf_can_manage(workspace_id));
create policy traf_social_accounts_manager_update on public.traf_social_accounts
for update to authenticated using (private.traf_can_manage(workspace_id))
with check (private.traf_can_manage(workspace_id));
create policy traf_social_accounts_manager_delete on public.traf_social_accounts
for delete to authenticated using (private.traf_can_manage(workspace_id));

drop policy if exists traf_agent_configs_member on public.traf_agent_configs;
create policy traf_agent_configs_member_select on public.traf_agent_configs
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_agent_configs_manager_insert on public.traf_agent_configs
for insert to authenticated with check (private.traf_can_manage(workspace_id));
create policy traf_agent_configs_manager_update on public.traf_agent_configs
for update to authenticated using (private.traf_can_manage(workspace_id))
with check (private.traf_can_manage(workspace_id));
create policy traf_agent_configs_manager_delete on public.traf_agent_configs
for delete to authenticated using (private.traf_can_manage(workspace_id));

drop policy if exists traf_portal_member_all on public.traf_client_portal_settings;
create policy traf_portal_member_select on public.traf_client_portal_settings
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_portal_manager_insert on public.traf_client_portal_settings
for insert to authenticated with check (private.traf_can_manage(workspace_id));
create policy traf_portal_manager_update on public.traf_client_portal_settings
for update to authenticated using (private.traf_can_manage(workspace_id))
with check (private.traf_can_manage(workspace_id));
create policy traf_portal_manager_delete on public.traf_client_portal_settings
for delete to authenticated using (private.traf_can_manage(workspace_id));
