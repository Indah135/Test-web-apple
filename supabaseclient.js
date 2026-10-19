import { createClient } from '@supabase/supabase-js';

// Mengambil variabel lingkungan menggunakan sistem env milik Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Gagal menginisialisasi Supabase client:', error);
  }
} else {
  console.warn(
    'Peringatan: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di environment variables.\n' +
    'Pastikan file .env Anda memiliki awalan VITE_ (contoh: VITE_SUPABASE_URL).'
  );
}

export const supabase = supabaseInstance;
