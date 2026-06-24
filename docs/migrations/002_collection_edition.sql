-- Migration 002 — Édition de l'exemplaire (Platinum, Greatest Hits, GOTY, etc.)
-- Texte libre (pas de contrainte) : on autorise les éditions rares/régionales.
-- NULL = édition standard.

alter table collection add column if not exists edition text;
