-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'media' );

drop policy if exists "Authenticated Users can upload media" on storage.objects;
create policy "Authenticated Users can upload media"
on storage.objects for insert
with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

drop policy if exists "Users can update their own media" on storage.objects;
create policy "Users can update their own media"
on storage.objects for update
using ( bucket_id = 'media' and auth.uid() = owner )
with check ( bucket_id = 'media' and auth.uid() = owner );

drop policy if exists "Users can delete their own media" on storage.objects;
create policy "Users can delete their own media"
on storage.objects for delete
using ( bucket_id = 'media' and auth.uid() = owner );
