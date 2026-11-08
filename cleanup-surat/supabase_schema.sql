create table volunteers(id uuid primary key default gen_random_uuid(),name text not null,email text not null,phone text,city text,area text,age int,occupation text,skills text,availability text,message text,created_at timestamptz default now());
create table events(id uuid primary key default gen_random_uuid(),title text not null,description text,date timestamptz not null,location text,image_url text,created_at timestamptz default now());
create table organizations(id uuid primary key default gen_random_uuid(),organization_name text not null,contact_person text,email text not null,phone text,address text,organization_type text,website text,message text,created_at timestamptz default now());
create table adoptions(id uuid primary key default gen_random_uuid(),name text not null,organization text,email text not null,phone text,spot text,reason text,created_at timestamptz default now());
create table reports(id uuid primary key default gen_random_uuid(),name text,email text,phone text,area text,location text,description text,image_url text,waste_type text,urgency text,created_at timestamptz default now());
create table contacts(id uuid primary key default gen_random_uuid(),name text,email text not null,subject text,message text,created_at timestamptz default now());
create table newsletter(id uuid primary key default gen_random_uuid(),email text unique not null,created_at timestamptz default now());

-- Row Level Security: public may INSERT only; events are publicly readable.
do $$ declare t text; begin
 foreach t in array array['volunteers','organizations','adoptions','reports','contacts','newsletter','events'] loop
  execute format('alter table %I enable row level security',t);
 end loop;
 foreach t in array array['volunteers','organizations','adoptions','reports','contacts','newsletter'] loop
  execute format('create policy "anon insert" on %I for insert to anon with check (true)',t);
 end loop;
end $$;
create policy "public read events" on events for select to anon using (true);

-- Storage: gallery/{events|before|after|volunteers}/ (you upload), reports/ (public uploads)
insert into storage.buckets(id,name,public) values('gallery','gallery',true),('reports','reports',true) on conflict do nothing;
create policy "gallery read" on storage.objects for select using (bucket_id='gallery');
create policy "reports upload" on storage.objects for insert to anon with check (bucket_id='reports');
