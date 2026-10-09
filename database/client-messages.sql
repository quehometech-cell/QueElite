-- Private one-to-one client/coach conversations.
-- Requires the existing private.coach_can_access_client(uuid) authorization helper.
create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 3000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists client_messages_conversation_created_idx
  on public.client_messages (client_id, created_at);

alter table public.client_messages enable row level security;
revoke all on public.client_messages from anon;
grant select, insert on public.client_messages to authenticated;
revoke update, delete on public.client_messages from authenticated;
grant update (read_at) on public.client_messages to authenticated;

drop policy if exists "conversation participants read messages" on public.client_messages;
create policy "conversation participants read messages"
  on public.client_messages for select to authenticated
  using (
    client_id = (select auth.uid())
    or private.coach_can_access_client(client_id)
  );

drop policy if exists "conversation participants send messages" on public.client_messages;
create policy "conversation participants send messages"
  on public.client_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and read_at is null
    and (
      client_id = (select auth.uid())
      or private.coach_can_access_client(client_id)
    )
  );

drop policy if exists "recipients mark messages read" on public.client_messages;
create policy "recipients mark messages read"
  on public.client_messages for update to authenticated
  using (
    sender_id <> (select auth.uid())
    and (
      client_id = (select auth.uid())
      or private.coach_can_access_client(client_id)
    )
  )
  with check (
    sender_id <> (select auth.uid())
    and (
      client_id = (select auth.uid())
      or private.coach_can_access_client(client_id)
    )
  );

-- Enable live message updates when Realtime is available. Polling in the UI is
-- retained as a fallback for browsers where a Realtime connection is unavailable.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'client_messages'
     ) then
    alter publication supabase_realtime add table public.client_messages;
  end if;
end $$;
