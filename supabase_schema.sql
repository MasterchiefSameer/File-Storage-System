-- Run this in the Supabase SQL Editor

-- 1. Create the files table
create table public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  original_name text not null,
  size bigint not null,
  mime_type text not null,
  is_public boolean default false not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) on the files table
alter table public.files enable row level security;

-- 3. Create Policies for the files table
-- Policy: Users can insert their own files
create policy "Users can upload their own files" on public.files
  for insert with check (auth.uid() = user_id);

-- Policy: Users can view their own files OR anyone can view public files
create policy "Users can view own or public files" on public.files
  for select using (auth.uid() = user_id or is_public = true);

-- Policy: Users can update their own files (e.g., toggle is_public)
create policy "Users can update their own files" on public.files
  for update using (auth.uid() = user_id);

-- Policy: Users can delete their own files
create policy "Users can delete their own files" on public.files
  for delete using (auth.uid() = user_id);

-- 4. Set up the Storage Bucket (Assuming you create a bucket named 'uploads')
-- You must manually create a bucket named "uploads" in the Storage section of Supabase dashboard and make it PUBLIC if you want public shareable links directly, OR keep it private and use signed URLs/download policies.
-- Let's assume the bucket is created manually. Here are the RLS policies for the storage.objects table:

-- STORAGE POLICY

-- Storage Policy: Users can upload files to the 'uploads' bucket
create policy "Allow authenticated uploads" on storage.objects
  for insert with check (
    bucket_id = 'uploads' and auth.role() = 'authenticated'
  );

-- Storage Policy: Users can update their own files
create policy "Allow users to update own files" on storage.objects
  for update using (
    bucket_id = 'uploads' and auth.uid() = owner
  );

-- Storage Policy: Users can view their own files, or anyone can view public files
-- We will handle visibility at the application layer or use Supabase Signed URLs for private files. For simplicity, we can let anyone read from the bucket, but only via our application which checks the `public.files` table. But the most secure way is:
create policy "Allow read access to own files" on storage.objects
  for select using (
    bucket_id = 'uploads' and auth.uid() = owner
  );

-- Storage Policy: Users can delete their own files
create policy "Allow delete own files" on storage.objects
  for delete using (
    bucket_id = 'uploads' and auth.uid() = owner
  );
