import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
// Menggunakan Service Role Key yang aman untuk bypass RLS (Row Level Security) agar password tidak bisa di-read secara publik
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // Ambil data user yang memiliki username yang cocok dari Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-store'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal memverifikasi user: ${errorText}`);
    }

    const users = await response.json();
    const user = users[0];

    // Validasi apakah user ditemukan dan password cocok
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Username atau password salah.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Login berhasil!' });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem, silakan coba lagi.' }, { status: 500 });
  }
}
