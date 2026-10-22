-- ============================================================
-- FTTS Plan Dashboard - Supabase Schema for WE Records
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fzdmdvgmorzifysygkhp/sql/new
-- ============================================================

CREATE TABLE IF NOT EXISTS public.we_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "site code" TEXT NOT NULL,
    "Exc Sectores" TEXT DEFAULT '',
    "Sectores" TEXT DEFAULT '',
    "Exc sector" TEXT DEFAULT '',
    "Sectore" TEXT DEFAULT '',
    "Exc Zone" TEXT DEFAULT '',
    "Zone" TEXT DEFAULT '',
    "السنترال" TEXT DEFAULT '',
    "اداره التنفيذ المختصه" TEXT DEFAULT '',
    "Type" TEXT DEFAULT '',
    "التصنيف" TEXT DEFAULT '',
    "اسباب التعذر" TEXT DEFAULT '',
    "الجهة المطلوب الدعم منها" TEXT DEFAULT '',
    "خطة" TEXT DEFAULT '',
    "مواقع تم اضافتها بتاريخ2" TEXT DEFAULT '',
    "Site Status" TEXT DEFAULT '',
    "التاريخ المتوقع للانتهاء" TEXT DEFAULT '',
    "التاريخ الفعلى للانتهاء" TEXT DEFAULT '',
    "NLongitude" TEXT DEFAULT '',
    "NLatitude" TEXT DEFAULT '',
    "المسافة كم" TEXT DEFAULT '',
    "تكلفة التوصيل بدون مسار تراسلى بالجنيه" TEXT DEFAULT '',
    "تكلفة التوصيل على المسار التراسلى بالجنيه" TEXT DEFAULT '',
    "المستند" TEXT DEFAULT '',
    "المسئولية" TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'user'
);

-- Index on site code for fast lookup
CREATE INDEX IF NOT EXISTS idx_we_records_site_code ON public.we_records("site code");

-- Enable Row Level Security (RLS)
ALTER TABLE public.we_records ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access with the publishable/anon key
DROP POLICY IF EXISTS "Allow public read" ON public.we_records;
CREATE POLICY "Allow public read" ON public.we_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.we_records;
CREATE POLICY "Allow public insert" ON public.we_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.we_records;
CREATE POLICY "Allow public update" ON public.we_records FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.we_records;
CREATE POLICY "Allow public delete" ON public.we_records FOR DELETE USING (true);
