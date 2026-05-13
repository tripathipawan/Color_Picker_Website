CREATE POLICY "Users can update their own saved palettes"
ON public.saved_palettes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);