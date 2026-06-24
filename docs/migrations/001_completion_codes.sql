-- Migration 001 — Completion : passage aux codes stables + nouvelles valeurs
-- Ancien : 'Loose','CIB','Sealed'
-- Nouveau : 'loose','cib','box_game','box_notice','game_notice','notice','box','sealed'

-- 1. Retirer l'ancienne contrainte
alter table collection drop constraint if exists collection_completion_check;

-- 2. Migrer les valeurs existantes vers les codes
update collection set completion = 'loose'  where completion = 'Loose';
update collection set completion = 'cib'    where completion = 'CIB';
update collection set completion = 'sealed' where completion = 'Sealed';

-- 3. Ajouter la nouvelle contrainte
alter table collection add constraint collection_completion_check
  check (completion in ('loose','cib','box_game','box_notice','game_notice','notice','box','sealed'));
