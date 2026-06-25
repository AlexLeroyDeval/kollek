-- Migration 004 — Nombre d'exemplaires d'une entrée de collection
-- Défaut 1 (cas le plus courant). Le type integer interdit les décimales ;
-- la contrainte interdit 0 et les valeurs négatives.

alter table collection add column if not exists quantity integer not null default 1;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'collection_quantity_positive') then
    alter table collection add constraint collection_quantity_positive check (quantity >= 1);
  end if;
end $$;
