
CREATE TABLE public.palette_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.palette_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON public.palette_folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON public.palette_folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON public.palette_folders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON public.palette_folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.saved_palettes ADD COLUMN folder_id uuid REFERENCES public.palette_folders(id) ON DELETE SET NULL;
