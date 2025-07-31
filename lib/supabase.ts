
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fofaqsowmxvwjqnphsgq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZmFxc293bXh2d2pxbnBoc2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njk2NjgsImV4cCI6MjA2OTU0NTY2OH0.4ltXloprgcF_qQjU1FjhMgsJy5spwZQxf8W1xWz5PSg'

export const supabase = createClient(supabaseUrl, supabaseKey)
