-- Create a new storage bucket for media
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Set up RLS policies for the media bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'media' );

create policy "Authenticated Users can upload media"
on storage.objects for insert
with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

create policy "Users can update their own media"
on storage.objects for update
using ( bucket_id = 'media' and auth.uid() = owner )
with check ( bucket_id = 'media' and auth.uid() = owner );

create policy "Users can delete their own media"
on storage.objects for delete
using ( bucket_id = 'media' and auth.uid() = owner );
