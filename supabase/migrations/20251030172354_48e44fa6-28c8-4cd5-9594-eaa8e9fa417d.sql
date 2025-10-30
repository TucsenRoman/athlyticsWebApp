-- Add type and options columns to ledger_headers table
ALTER TABLE public.ledger_headers
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS options TEXT[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.ledger_headers.type IS 'Input validation type: text, number, date, select, checkbox, email, phone, percentage, read-only';
COMMENT ON COLUMN public.ledger_headers.options IS 'Options for select/dropdown type headers';