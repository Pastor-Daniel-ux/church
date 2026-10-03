-- Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table profiles(id uuid primary key default gen_random_uuid(),user_id uuid unique references auth.users on delete cascade,full_name text,email text,role text not null default 'user' check(role in('user','admin')),avatar_url text,created_at timestamptz default now());
create table sermons(id uuid primary key default gen_random_uuid(),title text not null,description text,speaker text,scripture text,sermon_date date,video_url text,audio_url text,thumbnail_url text,category text,published boolean default true,created_at timestamptz default now());
create table events(id uuid primary key default gen_random_uuid(),title text not null,description text,event_date date not null,start_time time,end_time time,location text,image_url text,registration_url text,published boolean default true,created_at timestamptz default now());
create table ministries(id uuid primary key default gen_random_uuid(),name text not null,description text,image_url text,meeting_time text,contact_email text,published boolean default true,created_at timestamptz default now());
create table leaders(id uuid primary key default gen_random_uuid(),name text not null,position text,biography text,image_url text,social_links jsonb default '{}',published boolean default true,created_at timestamptz default now());
create table prayer_requests(id uuid primary key default gen_random_uuid(),name text,email text,request text not null,anonymous boolean default false,status text not null default 'New' check(status in('New','In progress','Prayed for')),created_at timestamptz default now());
create table contact_messages(id uuid primary key default gen_random_uuid(),name text not null,email text not null,phone text,message text not null,created_at timestamptz default now());
create table donations(id uuid primary key default gen_random_uuid(),donor_name text,donor_email text,amount numeric(12,2) not null check(amount>0),fund text,provider text,provider_ref text,status text default 'pending',created_at timestamptz default now()); -- NO card data
create table church_settings(id int primary key default 1 check(id=1),church_name text default 'Grace Community Church',tagline text default 'A place to belong',address text,phone text,email text,service_times text default 'Sunday 9:00 AM & 11:00 AM',social_links jsonb default '{}',logo_url text,hero_url text,welcome_message text,verse text,mission text,vision text,history text,faith text,parking text,expect text,kids text,map_embed_url text,updated_at timestamptz default now());
insert into church_settings(id) values(1);

create or replace function is_admin() returns boolean language sql security definer set search_path=public stable as
$$select exists(select 1 from profiles where user_id=auth.uid() and role='admin')$$;
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as
$$begin insert into profiles(user_id,email,full_name) values(new.id,new.email,new.raw_user_meta_data->>'full_name');return new;end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- RLS
do $$ declare t text; begin
 foreach t in array array['profiles','sermons','events','ministries','leaders','prayer_requests','contact_messages','donations','church_settings'] loop
  execute format('alter table %I enable row level security',t); end loop;
 foreach t in array array['sermons','events','ministries','leaders'] loop
  execute format('create policy "public read published" on %I for select using (published or is_admin())',t);
  execute format('create policy "admin write" on %I for all using (is_admin()) with check (is_admin())',t); end loop;
end $$;
create policy "public read settings" on church_settings for select using (true);
create policy "admin write settings" on church_settings for all using (is_admin()) with check (is_admin());
create policy "anyone submits prayer" on prayer_requests for insert with check (status='New');
create policy "admin manage prayer" on prayer_requests for all using (is_admin()) with check (is_admin());
create policy "anyone submits contact" on contact_messages for insert with check (true);
create policy "admin manage contact" on contact_messages for all using (is_admin()) with check (is_admin());
create policy "anyone records pledge" on donations for insert with check (status='pending');
create policy "admin manage donations" on donations for all using (is_admin()) with check (is_admin());
create policy "read own profile" on profiles for select using (user_id=auth.uid() or is_admin());
create policy "admin manage profiles" on profiles for all using (is_admin()) with check (is_admin());
-- No update policy for non-admins on profiles, so users cannot self-promote.

-- Storage
insert into storage.buckets(id,name,public) values('church-assets','church-assets',true),('sermon-images','sermon-images',true),('leader-images','leader-images',true),('event-images','event-images',true),('ministry-images','ministry-images',true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id in('church-assets','sermon-images','leader-images','event-images','ministry-images'));
create policy "admin upload" on storage.objects for insert with check (is_admin() and bucket_id in('church-assets','sermon-images','leader-images','event-images','ministry-images'));
create policy "admin update" on storage.objects for update using (is_admin());
create policy "admin delete" on storage.objects for delete using (is_admin());
-- After creating your admin user in Auth > Users:
-- update profiles set role='admin' where email='you@example.com';
