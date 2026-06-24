-- Migration 003 — Multi-utilisateur : user_id + RLS par utilisateur
-- collection & wishlist deviennent privées (chacun les siennes).
-- Le catalogue (platform, game, genre, publisher, game_company) reste partagé
-- entre utilisateurs connectés. market_price en lecture seule.

-- 1. Colonnes propriétaire (default auth.uid() → rempli automatiquement à l'insert)
alter table collection add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table wishlist   add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- 2. Supprimer les anciennes policies "allow all"
drop policy if exists "allow all" on collection;
drop policy if exists "allow all" on wishlist;
drop policy if exists "allow all" on platform;
drop policy if exists "allow all" on game;
drop policy if exists "allow all" on genre;
drop policy if exists "allow all" on publisher;
drop policy if exists "allow all" on game_company;
drop policy if exists "allow all" on market_price;

-- 3. Collection & wishlist : chacun ne voit/modifie que ses lignes
create policy "own collection" on collection for all
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on wishlist for all
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4. Catalogue partagé entre utilisateurs connectés
create policy "catalog rw" on platform     for all to authenticated using (true) with check (true);
create policy "catalog rw" on game         for all to authenticated using (true) with check (true);
create policy "catalog rw" on genre        for all to authenticated using (true) with check (true);
create policy "catalog rw" on publisher    for all to authenticated using (true) with check (true);
create policy "catalog rw" on game_company for all to authenticated using (true) with check (true);
create policy "market read" on market_price for select to authenticated using (true);

-- 5. (À FAIRE après ta 1re connexion) rattacher tes jeux existants à ton compte :
-- update collection set user_id = '<ton-user-id>' where user_id is null;
-- (ton user-id se trouve dans Supabase → Authentication → Users)
