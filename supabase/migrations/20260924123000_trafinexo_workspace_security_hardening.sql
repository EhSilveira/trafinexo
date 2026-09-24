-- TrafiNexo workspace security hardening.
-- Sensitive configuration is readable by workspace members, writable only by owner/admin.
-- Cross-workspace references are rejected at write time.

create or replace function private.traf_assert_related_workspace(
  target_table regclass,
  target_id uuid,
  target_workspace_id uuid,
  relation_label text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare ok boolean;
begin
  if target_id is null then return; end if;
  execute format(
    'select exists(select 1 from %s where id=$1 and workspace_id=$2)',
    target_table
  ) into ok using target_id,target_workspace_id;
  if not coalesce(ok,false) then
    raise exception '% belongs to another workspace', relation_label;
  end if;
end;
$$;

revoke all on function private.traf_assert_related_workspace(regclass,uuid,uuid,text)
from public,anon,authenticated;

create or replace function private.traf_validate_workspace_relations()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  case tg_table_name
    when 'traf_integrations' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
    when 'traf_ad_accounts' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
      perform private.traf_assert_related_workspace('public.traf_integrations'::regclass,new.integration_id,new.workspace_id,'integration');
    when 'traf_social_accounts' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
    when 'traf_agent_configs' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
    when 'traf_campaigns' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
      perform private.traf_assert_related_workspace('public.traf_integrations'::regclass,new.integration_id,new.workspace_id,'integration');
    when 'traf_projects' then
      perform private.traf_assert_related_workspace('public.traf_clients'::regclass,new.client_id,new.workspace_id,'client');
  end case;
  return new;
end;
$$;

revoke all on function private.traf_validate_workspace_relations()
from public,anon,authenticated;

drop trigger if exists trg_traf_integrations_workspace on public.traf_integrations;
create trigger trg_traf_integrations_workspace
before insert or update of workspace_id,client_id
on public.traf_integrations for each row execute function private.traf_validate_workspace_relations();

drop trigger if exists trg_traf_ad_accounts_workspace on public.traf_ad_accounts;
create trigger trg_traf_ad_accounts_workspace
before insert or update of workspace_id,client_id,integration_id
on public.traf_ad_accounts for each row execute function private.traf_validate_workspace_relations();

drop trigger if exists trg_traf_social_accounts_workspace on public.traf_social_accounts;
create trigger trg_traf_social_accounts_workspace
before insert or update of workspace_id,client_id
on public.traf_social_accounts for each row execute function private.traf_validate_workspace_relations();

drop trigger if exists trg_traf_agent_configs_workspace on public.traf_agent_configs;
create trigger trg_traf_agent_configs_workspace
before insert or update of workspace_id,client_id
on public.traf_agent_configs for each row execute function private.traf_validate_workspace_relations();

drop trigger if exists trg_traf_campaigns_workspace on public.traf_campaigns;
create trigger trg_traf_campaigns_workspace
before insert or update of workspace_id,client_id,integration_id
on public.traf_campaigns for each row execute function private.traf_validate_workspace_relations();

drop trigger if exists trg_traf_projects_workspace on public.traf_projects;
create trigger trg_traf_projects_workspace
before insert or update of workspace_id,client_id
on public.traf_projects for each row execute function private.traf_validate_workspace_relations();

drop policy if exists traf_integrations_member_all on public.traf_integrations;
drop policy if exists traf_integrations_member_select on public.traf_integrations;
drop policy if exists traf_integrations_admin_insert on public.traf_integrations;
drop policy if exists traf_integrations_admin_update on public.traf_integrations;
drop policy if exists traf_integrations_admin_delete on public.traf_integrations;
create policy traf_integrations_member_select on public.traf_integrations
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_integrations_admin_insert on public.traf_integrations
for insert to authenticated with check (private.traf_is_admin(workspace_id));
create policy traf_integrations_admin_update on public.traf_integrations
for update to authenticated using (private.traf_is_admin(workspace_id)) with check (private.traf_is_admin(workspace_id));
create policy traf_integrations_admin_delete on public.traf_integrations
for delete to authenticated using (private.traf_is_admin(workspace_id));

drop policy if exists traf_ad_accounts_member_all on public.traf_ad_accounts;
drop policy if exists traf_ad_accounts_member_select on public.traf_ad_accounts;
drop policy if exists traf_ad_accounts_admin_insert on public.traf_ad_accounts;
drop policy if exists traf_ad_accounts_admin_update on public.traf_ad_accounts;
drop policy if exists traf_ad_accounts_admin_delete on public.traf_ad_accounts;
create policy traf_ad_accounts_member_select on public.traf_ad_accounts
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_ad_accounts_admin_insert on public.traf_ad_accounts
for insert to authenticated with check (private.traf_is_admin(workspace_id));
create policy traf_ad_accounts_admin_update on public.traf_ad_accounts
for update to authenticated using (private.traf_is_admin(workspace_id)) with check (private.traf_is_admin(workspace_id));
create policy traf_ad_accounts_admin_delete on public.traf_ad_accounts
for delete to authenticated using (private.traf_is_admin(workspace_id));

drop policy if exists traf_social_accounts_member_all on public.traf_social_accounts;
drop policy if exists traf_social_accounts_member_select on public.traf_social_accounts;
drop policy if exists traf_social_accounts_admin_insert on public.traf_social_accounts;
drop policy if exists traf_social_accounts_admin_update on public.traf_social_accounts;
drop policy if exists traf_social_accounts_admin_delete on public.traf_social_accounts;
create policy traf_social_accounts_member_select on public.traf_social_accounts
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_social_accounts_admin_insert on public.traf_social_accounts
for insert to authenticated with check (private.traf_is_admin(workspace_id));
create policy traf_social_accounts_admin_update on public.traf_social_accounts
for update to authenticated using (private.traf_is_admin(workspace_id)) with check (private.traf_is_admin(workspace_id));
create policy traf_social_accounts_admin_delete on public.traf_social_accounts
for delete to authenticated using (private.traf_is_admin(workspace_id));

drop policy if exists traf_agent_configs_member on public.traf_agent_configs;
drop policy if exists traf_agent_configs_member_select on public.traf_agent_configs;
drop policy if exists traf_agent_configs_admin_insert on public.traf_agent_configs;
drop policy if exists traf_agent_configs_admin_update on public.traf_agent_configs;
drop policy if exists traf_agent_configs_admin_delete on public.traf_agent_configs;
create policy traf_agent_configs_member_select on public.traf_agent_configs
for select to authenticated using (private.traf_is_member(workspace_id));
create policy traf_agent_configs_admin_insert on public.traf_agent_configs
for insert to authenticated with check (private.traf_is_admin(workspace_id));
create policy traf_agent_configs_admin_update on public.traf_agent_configs
for update to authenticated using (private.traf_is_admin(workspace_id)) with check (private.traf_is_admin(workspace_id));
create policy traf_agent_configs_admin_delete on public.traf_agent_configs
for delete to authenticated using (private.traf_is_admin(workspace_id));

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
