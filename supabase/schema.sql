-- InfoHub schema
create schema if not exists infohub;

create table infohub.articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  slug text unique not null,
  category text not null,
  summary text,
  body text,
  tags text[] default '{}',
  published boolean default false,
  author_id uuid references auth.users(id)
);

alter table infohub.articles enable row level security;

create policy "Public can read published articles"
  on infohub.articles for select
  using (published = true);

create policy "Authors manage own articles"
  on infohub.articles for all
  using (auth.uid() = author_id);
