CREATE TABLE public.harmony_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  base_color TEXT NOT NULL,
  harmony_type TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.harmony_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own harmony history"
ON public.harmony_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own harmony history"
ON public.harmony_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own harmony history"
ON public.harmony_history FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_harmony_history_user_created ON public.harmony_history (user_id, created_at DESC);