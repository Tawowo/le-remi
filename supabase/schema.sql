-- =====================================================================
-- LE RÉMI — Schéma du mode en ligne (Supabase)
-- À coller tel quel dans : Supabase → SQL Editor → New query → Run.
-- Correspond exactement au code : src/lib/online/schema.ts & rooms.ts
--   table   : public.rooms
--   colonnes: code, host_id, status, config, players, state,
--             created_at, updated_at
-- Aucune donnée sensible (pseudos uniquement, pas de comptes).
-- =====================================================================

-- 1) Table des salons / parties
create table if not exists public.rooms (
  code        text primary key,                    -- code à 5 lettres (MAJUSCULES)
  host_id     text not null,                       -- id client de l'hôte (uuid généré)
  status      text not null default 'lobby'
              check (status in ('lobby','playing','finished')),
  config      jsonb not null default '{}'::jsonb,  -- { hostName, target, maxPlayers }
  players     jsonb not null default '[]'::jsonb,  -- roster du salon [{id,name,isBot,color}]
  state       jsonb,                               -- snapshot PUBLIC (reconnexion) ; jamais les mains adverses
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) Index (nettoyage des salons abandonnés par date d'activité)
create index if not exists rooms_updated_at_idx on public.rooms (updated_at);

-- 3) Mise à jour automatique de updated_at à chaque écriture
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_touch_updated_at on public.rooms;
create trigger rooms_touch_updated_at
  before update on public.rooms
  for each row execute function public.touch_updated_at();

-- 4) Row Level Security
--    Pas de comptes : on autorise le rôle anon à lire/créer/mettre à jour un
--    salon (partie entre amis par code). La suppression est réservée aux
--    salons expirés (> 24 h sans activité).
alter table public.rooms enable row level security;

drop policy if exists rooms_select on public.rooms;
create policy rooms_select on public.rooms
  for select
  to anon, authenticated
  using (true);

drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists rooms_delete_stale on public.rooms;
create policy rooms_delete_stale on public.rooms
  for delete
  to anon, authenticated
  using (updated_at < now() - interval '24 hours');

-- 5) Realtime
--    Payload complet des lignes sur UPDATE (utile pour la reconnexion).
alter table public.rooms replica identity full;

--    Active les Postgres Changes sur la table (abonnement aux màj du salon).
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end;
$$;

-- Fait. La synchronisation en jeu utilise en plus les canaux Realtime
-- « broadcast » + « presence » nommés remi-room-<CODE> (aucune table requise).
