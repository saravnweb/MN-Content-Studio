-- Add city column to profiles table
alter table public.profiles add column if not exists city text;
