-- Migration 005 — Une ligne par exemplaire (abandon de quantity)
-- Les exemplaires d'un même jeu ne sont pas interchangeables : état, completion,
-- statut vendu et prix peuvent différer. On éclate donc chaque entrée quantity > 1
-- en lignes individuelles identiques, puis on supprime la colonne.

-- 1. Créer (quantity - 1) copies identiques pour chaque entrée multiple
insert into collection (
  user_id, game_id, condition, completion, edition,
  purchase_price, purchase_date, is_sold, sale_price, sale_date, notes, added_at
)
select
  c.user_id, c.game_id, c.condition, c.completion, c.edition,
  c.purchase_price, c.purchase_date, c.is_sold, c.sale_price, c.sale_date, c.notes, c.added_at
from collection c
cross join lateral generate_series(1, c.quantity - 1)
where c.quantity > 1;

-- 2. Supprimer la contrainte puis la colonne
alter table collection drop constraint if exists collection_quantity_positive;
alter table collection drop column if exists quantity;
