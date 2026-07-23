import { getSupabaseClient } from '@lib/supabase';

export async function getSetting(key: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as { value: string })?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
}
