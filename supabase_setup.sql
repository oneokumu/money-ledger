create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('in','out')),
  amount numeric not null,
  cost numeric not null default 0,
  party text not null,
  tag text not null,
  date date not null,
  note text default '',
  ref text not null,
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "select own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "delete own transactions" on transactions
  for delete using (auth.uid() = user_id);
