-- Execute no SQL Editor do seu projeto Supabase.
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- O servidor usa a service role key somente no backend e valida a sessão do usuário.
-- Não exponha SUPABASE_SERVICE_ROLE_KEY no frontend nem no repositório.
-- A tabela não precisa de policies para o cliente público porque as operações são feitas pelo servidor.
