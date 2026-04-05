-- 카페 사진을 위한 버킷(Bucket) 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('cafe_images', 'cafe_images', true);

-- 누구나 사진을 업로드하고 볼 수 있게 정책(Policy) 추가
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'cafe_images');
CREATE POLICY "Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cafe_images');

-- records DB 테이블에 atmosphere_images 정보 저장 공간 추가
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS atmosphere_images text[] DEFAULT '{}'::text[];
