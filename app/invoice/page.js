'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './invoice.module.css';
import SidebarLayout from '../../components/SidebarLayout';

// ─── KONFIGURASI TOKO ───────────────────────────
const SHOP = {
  nama: 'RiaFlorist',
};
// ───────────────────────────────────────────────

const EMPTY_ITEM = { deskripsi: '', harga: '', kuantitas: 1 };

function toRupiah(n) {
  const num = parseFloat(String(n).replace(/[^\d.-]/g, ''));
  if (!num && num !== 0) return '';
  return num.toLocaleString('id-ID');
}

function parseNum(v) {
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function formatTanggal(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
}

function getYearMonthStr(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return parts[0] + parts[1]; // YYYYMM
  }
  return '';
}

function generateNextInvoiceNumber(dateStr, existingInvoices) {
  const ym = getYearMonthStr(dateStr);
  if (!ym) return '';

  const prefix = `INV-${ym}-`;
  const matches = (existingInvoices || [])
    .map(inv => inv.no_invoice)
    .filter(no => typeof no === 'string' && no.startsWith(prefix))
    .map(no => {
      const parts = no.split('-');
      const numStr = parts[parts.length - 1];
      const num = parseInt(numStr, 10);
      return isNaN(num) ? 0 : num;
    });

  const maxNum = matches.length > 0 ? Math.max(...matches) : 0;
  const nextNum = maxNum + 1;
  const nextNumStr = String(nextNum).padStart(3, '0');

  return `${prefix}${nextNumStr}`;
}

export default function InvoicePage() {
  const router = useRouter();
  const previewRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('isLoggedIn') !== 'true') router.replace('/');
  }, [router]);

  const [view, setView] = useState('form');

  // Dynamic scaling for invoice preview relative to screen width
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (view !== 'preview') return;
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const availableWidth = parentWidth - 32; // padding 16px left + right
        if (availableWidth < 1131) {
          setScale(availableWidth / 1131);
        } else {
          setScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    id: null,
    noInvoice: '',
    tanggal: today,
    namaPembeli: '',
    items: [{ ...EMPTY_ITEM }],
    ongkir: '',
    dp: '',
  });

  const [existingInvoices, setExistingInvoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const json = await res.json();
      if (json.success) {
        setExistingInvoices(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching invoices:', e);
    }
  };

  const handleDelete = async (id, noInvoice) => {
    if (confirm(`Apakah Anda yakin ingin menghapus invoice ${noInvoice}?`)) {
      try {
        const res = await fetch(`/api/invoices?id=${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          alert('Invoice berhasil dihapus!');
          fetchInvoices();
        } else {
          alert(`Gagal menghapus: ${json.error}`);
        }
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('Terjadi kesalahan koneksi saat menghapus.');
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchInvoices();
    }
  }, [mounted]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setItem = (i, k, v) =>
    setForm(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));
  const removeItem = i => setForm(p => ({
    ...p,
    items: p.items.length === 1 ? p.items : p.items.filter((_, idx) => idx !== i)
  }));

  // Automatically update/generate invoice number based on the selected date and existing invoices list
  useEffect(() => {
    if (!mounted) return;

    if (view === 'form' && !form.id) {
      const nextNo = generateNextInvoiceNumber(form.tanggal, existingInvoices);
      setForm(p => ({
        ...p,
        noInvoice: nextNo
      }));
    }
  }, [mounted, form.tanggal, existingInvoices, view, form.id]);

  const handleNewInvoice = () => {
    if (confirm('Apakah Anda ingin membuat invoice baru? Semua data di form saat ini akan dikosongkan.')) {
      setForm({
        id: null,
        noInvoice: generateNextInvoiceNumber(today, existingInvoices),
        tanggal: today,
        namaPembeli: '',
        items: [{ ...EMPTY_ITEM }],
        ongkir: '',
        dp: '',
      });
      setView('form');
    }
  };

  // Computed
  const subTotalItems = form.items.reduce(
    (s, it) => s + parseNum(it.harga) * parseNum(it.kuantitas), 0
  );
  const ongkirNum = parseNum(form.ongkir);
  const dpNum = parseNum(form.dp);
  const subTotal = subTotalItems + ongkirNum;
  const grandTotal = subTotal - dpNum;

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!form.namaPembeli) {
      alert('Nama Penerima harus diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const method = form.id ? 'PUT' : 'POST';
      const response = await fetch('/api/invoices', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal menyimpan invoice.');
      }

      if (json.invoiceId) {
        setForm(p => ({ ...p, id: json.invoiceId }));
      }

      // Re-fetch invoices to get the updated database count for the next invoice sequence
      await fetchInvoices();

      // Go to preview view
      setView('preview');
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan ke database. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Export
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleExport = useCallback(async (fmt) => {
    const el = document.getElementById('invoice-doc');
    if (!el) return;
    setExporting(true);
    setExportDone(false);

    // Save original scale/transform
    const originalTransform = el.style.transform;

    try {
      // Temporarily remove transform so html2canvas renders the high-res canvas uncropped
      el.style.transform = 'none';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 2, // 2x is highly sharp and keeps PDF size reasonable
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f7f3eb',
        logging: false,
      });

      // Restore original transform/scale
      el.style.transform = originalTransform;

      const fileName = `invoice-${form.noInvoice || 'draft'}-${form.tanggal}`;
      const jpgData = canvas.toDataURL('image/jpeg', 0.95);

      if (fmt === 'png') {
        const a = document.createElement('a');
        a.download = `${fileName}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      } else if (fmt === 'jpg') {
        const a = document.createElement('a');
        a.download = `${fileName}.jpg`;
        a.href = jpgData;
        a.click();
      } else if (fmt === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = pdf.internal.pageSize.getWidth();
        const H = W * (canvas.height / canvas.width);
        pdf.addImage(jpgData, 'JPEG', 0, 0, W, Math.min(H, pdf.internal.pageSize.getHeight()));
        pdf.save(`${fileName}.pdf`);
      } else if (fmt === 'docx') {
        const { Document, Packer, Paragraph, ImageRun } = await import('docx');
        const { saveAs } = await import('file-saver');
        const blob = await fetch(jpgData).then(r => r.blob());
        const buf = await blob.arrayBuffer();
        const ratio = canvas.height / canvas.width;
        const doc = new Document({
          sections: [{
            properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
            children: [new Paragraph({
              children: [new ImageRun({
                data: buf,
                transformation: { width: 612, height: Math.round(612 * ratio) },
                type: 'jpg',
              })],
            })],
          }],
        });
        saveAs(await Packer.toBlob(doc), `${fileName}.docx`);
      }

      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal export. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  }, [form]);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <SidebarLayout currentView={view} onViewChange={setView}>
      {/* ── FORM VIEW ── */}
      {view === 'form' && (
        <div className={styles.page}>
          <div className={styles.topBar}>
            <button id="btn-new-invoice" className={styles.btnNewInvoice} type="button" onClick={handleNewInvoice}>
              ✨ Buat Baru
            </button>
          </div>

          <form className={styles.formWrap} onSubmit={handleGenerate} noValidate>
            {/* Info Invoice */}
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>📋 Info Invoice</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="noInvoice">No. Invoice (Otomatis)</label>
                <input id="noInvoice" className={`${styles.input} ${styles.inputLocked}`} type="text"
                  value={form.noInvoice} readOnly required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="tanggal">Tanggal</label>
                <input id="tanggal" className={styles.input} type="date"
                  value={form.tanggal} onChange={e => setField('tanggal', e.target.value)} required />
              </div>
            </div>

            {/* Kepada */}
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>👤 Kepada</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="namaPembeli">Nama Penerima</label>
                <input id="namaPembeli" className={styles.input} type="text"
                  placeholder="Nama lengkap / perusahaan"
                  value={form.namaPembeli} onChange={e => setField('namaPembeli', e.target.value)} required />
              </div>
            </div>

            {/* Items */}
            <div className={styles.formCard}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>🌸 Item Pesanan</h2>
                <button type="button" id="btn-add-item" className={styles.btnAdd} onClick={addItem}>
                  + Tambah Item
                </button>
              </div>

              {form.items.map((item, i) => (
                <div key={i} className={styles.itemBlock}>
                  <div className={styles.itemBlockHeader}>
                    <span className={styles.itemNum}>Item {i + 1}</span>
                    {form.items.length > 1 && (
                      <button type="button" className={styles.btnRemove} onClick={() => removeItem(i)}>
                        ✕ Hapus
                      </button>
                    )}
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Deskripsi</label>
                    <input id={`deskripsi-${i}`} className={styles.input} type="text"
                      placeholder="Nama bunga / produk"
                      value={item.deskripsi} onChange={e => setItem(i, 'deskripsi', e.target.value)} />
                  </div>
                  <div className={styles.row2}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Harga (Rp)</label>
                      <input id={`harga-${i}`} className={styles.input} type="number" min="0"
                        placeholder="0"
                        value={item.harga} onChange={e => setItem(i, 'harga', e.target.value)} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Kuantitas</label>
                      <input id={`kuantitas-${i}`} className={styles.input} type="number" min="1"
                        placeholder="1"
                        value={item.kuantitas} onChange={e => setItem(i, 'kuantitas', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    Total: <strong>Rp {toRupiah(parseNum(item.harga) * parseNum(item.kuantitas)) || '0'}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Biaya Tambahan */}
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>💳 Biaya Tambahan</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="ongkir">Ongkir (Rp)</label>
                <input id="ongkir" className={styles.input} type="number" min="0"
                  placeholder="0 (kosongkan jika tidak ada)"
                  value={form.ongkir} onChange={e => setField('ongkir', e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="dp">DP / Uang Muka (Rp)</label>
                <input id="dp" className={styles.input} type="number" min="0"
                  placeholder="0 (kosongkan jika tidak ada)"
                  value={form.dp} onChange={e => setField('dp', e.target.value)} />
              </div>

              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}>
                  <span>Sub Total</span><span>Rp {toRupiah(subTotal) || '0'}</span>
                </div>
                {dpNum > 0 && (
                  <div className={styles.summaryRow}>
                    <span>DP</span><span>- Rp {toRupiah(dpNum)}</span>
                  </div>
                )}
                <div className={styles.summaryRowFinal}>
                  <span>Grand Total</span><span>Rp {toRupiah(grandTotal) || '0'}</span>
                </div>
              </div>
            </div>

            <button id="btn-generate" type="submit" className={styles.btnGenerate} disabled={submitting}>
              {submitting
                ? '⏳ Menyimpan...'
                : form.id
                  ? '💾 Simpan Perubahan'
                  : '🌺 Generate & Simpan Invoice'
              }
            </button>
          </form>
        </div>
      )}

      {/* ── PREVIEW VIEW ── */}
      {view === 'preview' && (
        <div className={styles.page} ref={previewRef}>
          {/* Top bar */}
          <div className={styles.topBar}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button id="btn-back-history" className={styles.btnBack} onClick={() => setView('history')}>← Riwayat</button>
              <button id="btn-back" className={styles.btnBack} onClick={() => setView('form')}>✏️ Edit</button>
              <button id="btn-new-invoice-preview" className={styles.btnNewInvoice} onClick={handleNewInvoice}>✨ Buat Baru</button>
            </div>
          </div>

          {/* Export bar */}
          <div className={styles.exportBar}>
            <p className={styles.exportLabel}>Unduh sebagai:</p>
            <div className={styles.exportBtns}>
              {[
                { fmt: 'pdf', icon: '📄', label: 'PDF' },
                { fmt: 'jpg', icon: '📷', label: 'JPG' },
                { fmt: 'png', icon: '🖼️', label: 'PNG' },
                { fmt: 'docx', icon: '📝', label: 'DOCX' },
              ].map(({ fmt, icon, label }) => (
                <button key={fmt} id={`btn-export-${fmt}`}
                  className={styles.btnExport}
                  onClick={() => handleExport(fmt)}
                  disabled={exporting}>
                  {exporting ? '⏳' : icon} {label}
                </button>
              ))}
            </div>
            {exportDone && <p className={styles.exportSuccess}>✅ Berhasil diunduh!</p>}
          </div>

          {/* Invoice preview */}
          <div className={styles.previewScroll} ref={containerRef}>
            <div
              style={{
                width: '100%',
                height: `${1600 * scale}px`,
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <div
                id="invoice-doc"
                className={styles.invoiceDoc}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  width: '1131px',
                  height: '1600px',
                  flexShrink: 0,
                }}
              >
                {/* ── 1. Background template image ── */}
                <img
                  src="/header-roses.png"
                  className={styles.templateImg}
                  alt="invoice template"
                  crossOrigin="anonymous"
                />

                {/* ── 2. Cover "INV522110248" yang ada di template ── */}
                <div className={styles.invNumCover} />

                {/* ── 3. No. Invoice ── */}
                <div className={styles.fieldInvNo}>
                  {form.noInvoice || ''}
                </div>

                {/* ── 4. Tanggal ── */}
                <div className={styles.fieldDate}>
                  {formatTanggal(form.tanggal)}
                </div>

                {/* ── 5. Nama Pembeli ── */}
                <div className={styles.fieldNama}>
                  {(form.namaPembeli || '').toUpperCase()}
                </div>

                {/* ── 6. Item Rows ── */}
                {form.items.map((item, i) => {
                  const topPct = 47.2 + i * 4.65;
                  return (
                    <div key={i}>
                      {/* Deskripsi */}
                      <span className={styles.fieldCell}
                        style={{ top: `${topPct}%`, left: '8.5%', right: '30%' }}>
                        {item.deskripsi}
                      </span>
                      {/* Harga */}
                      <span className={styles.fieldCellRight}
                        style={{ top: `${topPct}%`, right: '38%', width: '12%' }}>
                        {item.harga ? toRupiah(parseNum(item.harga)) : ''}
                      </span>
                      {/* Kuantitas */}
                      <span className={styles.fieldCellCenter}
                        style={{ top: `${topPct}%`, right: '23%', width: '11%' }}>
                        {item.kuantitas || ''}
                      </span>
                      {/* Total */}
                      <span className={styles.fieldCellRight}
                        style={{ top: `${topPct}%`, right: '8%', width: '11%' }}>
                        {item.harga ? toRupiah(parseNum(item.harga) * parseNum(item.kuantitas)) : ''}
                      </span>
                    </div>
                  );
                })}

                {/* ── 7. Sub Total value ── */}
                <div className={styles.fieldTotalVal} style={{ top: '55.1%', left: '78.7%' }}>
                  {toRupiah(subTotalItems) || '0'}
                </div>

                {/* ── 8. Ongkir value ── */}
                <div className={styles.fieldTotalVal} style={{ top: '57.6%', left: '78.7%' }}>
                  {ongkirNum > 0 ? toRupiah(ongkirNum) : '-'}
                </div>

                {/* ── 9. DP value ── */}
                <div className={styles.fieldTotalVal} style={{ top: '60.2%', left: '78.7%' }}>
                  {dpNum > 0 ? toRupiah(dpNum) : '-'}
                </div>

                {/* ── 10. Grand Total value (white text on olive bar) ── */}
                <div className={styles.fieldGrandTotal} style={{ top: '63.3%', left: '78.7%' }}>
                  {toRupiah(grandTotal) || '0'}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === 'history' && (
        <div className={styles.page}>
          <div className={styles.topBar}>
            <div className={styles.topBarBrand}>
              <span>📜</span>
              <span className={`${styles.brandText} font-script`} style={{ fontSize: '20px' }}>Riwayat Invoice</span>
            </div>
            <button type="button" className={styles.logoutBtn} onClick={fetchInvoices}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.formWrap}>
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>📋 Daftar Invoice Terdaftar ({existingInvoices.length})</h2>

              {existingInvoices.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada invoice yang disimpan di database.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  {existingInvoices.map((inv) => {
                    const itemsTotal = (inv.invoice_items || []).reduce(
                      (sum, it) => sum + parseFloat(it.harga) * parseInt(it.kuantitas, 10), 0
                    );
                    const grand = itemsTotal + parseFloat(inv.ongkir) - parseFloat(inv.dp);

                    return (
                      <div key={inv.id} className={styles.itemBlock} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        {/* Cell Kiri: Info Invoice (Lebih Lebar) */}
                        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--green-500)', fontSize: '15px' }}>{inv.no_invoice}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tanggal: {formatTanggal(inv.tanggal)}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Penerima: {inv.nama_pembeli}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total: <strong>Rp {toRupiah(grand)}</strong></span>
                        </div>
                        
                        {/* Cell Kanan: Aksi (Lihat & Hapus) */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className={styles.btnAdd}
                            style={{ padding: '8px 14px', fontSize: '12px', height: '36px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              // Load invoice data to state (mode edit)
                              setForm({
                                id: inv.id,
                                noInvoice: inv.no_invoice,
                                tanggal: inv.tanggal,
                                namaPembeli: inv.nama_pembeli,
                                items: (inv.invoice_items || []).map(it => ({
                                  deskripsi: it.deskripsi,
                                  harga: String(it.harga),
                                  kuantitas: it.kuantitas
                                })),
                                ongkir: String(inv.ongkir),
                                dp: String(inv.dp)
                              });
                              // Open preview view
                              setView('preview');
                              setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                          >
                            👁️ Lihat Hasil
                          </button>
                          <button
                            type="button"
                            className={styles.btnRemove}
                            style={{ padding: '8px 14px', fontSize: '12px', height: '36px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleDelete(inv.id, inv.no_invoice)}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
