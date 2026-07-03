import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// GET /api/invoices - Fetch all invoices (with their items) from Supabase
export async function GET() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=*,invoice_items(*)&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Cache-Control': 'no-store'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/invoices - Save a new invoice and its items to Supabase
export async function POST(request) {
  try {
    const body = await request.json();
    const { noInvoice, tanggal, namaPembeli, items, ongkir, dp } = body;

    if (!noInvoice || !tanggal || !namaPembeli) {
      return NextResponse.json({ success: false, error: 'Informasi invoice tidak lengkap.' }, { status: 400 });
    }

    // 1. Insert data utama ke tabel 'invoices'
    const invoiceResponse = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Meminta Supabase mengembalikan data yang baru di-insert (termasuk ID)
      },
      body: JSON.stringify({
        no_invoice: noInvoice,
        tanggal: tanggal,
        nama_pembeli: namaPembeli,
        ongkir: parseFloat(ongkir) || 0,
        dp: parseFloat(dp) || 0
      })
    });

    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      throw new Error(`Gagal menyimpan data invoice: ${errorText}`);
    }

    const insertedInvoices = await invoiceResponse.json();
    const invoiceId = insertedInvoices[0]?.id;

    if (!invoiceId) {
      throw new Error('ID Invoice tidak ditemukan setelah insert.');
    }

    // 2. Insert detail pesanan ke tabel 'invoice_items'
    const itemsData = items.map(item => ({
      invoice_id: invoiceId,
      deskripsi: item.deskripsi || '',
      harga: parseFloat(item.harga) || 0,
      kuantitas: parseInt(item.kuantitas, 10) || 1,
      total: (parseFloat(item.harga) || 0) * (parseInt(item.kuantitas, 10) || 1)
    }));

    const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/invoice_items`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemsData)
    });

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text();
      throw new Error(`Gagal menyimpan item invoice: ${errorText}`);
    }

    return NextResponse.json({ success: true, message: 'Invoice dan item berhasil disimpan!', invoiceId });
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
