
CREATE TABLE public.saved_palettes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved palettes"
  ON public.saved_palettes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved palettes"
  ON public.saved_palettes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved palettes"
  ON public.saved_palettes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
