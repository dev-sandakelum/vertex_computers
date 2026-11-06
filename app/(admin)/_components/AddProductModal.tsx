'use client';

/**
 * AddProductModal — admin "Add product" form.
 *
 * Posts to /api/admin/products. The server assigns the numeric id, slug,
 * categorySlug, icon, SKU (if blank) and sensible defaults for everything
 * the storefront expects (shipping, warranty, returns, reviews, metadata).
 */

import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
  onCreated: (id: number, name: string) => void;
}

const CATEGORIES = ['GPUs', 'CPUs', 'Motherboards', 'RAM', 'PSUs', 'Storage', 'Cooling', 'Cases', 'Peripherals'];

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 13, background: '#fff', color: 'var(--ink)', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 };
const FIELD: React.CSSProperties = { marginBottom: 12 };

type SpecRow = { key: string; value: string };

const EMPTY = {
  name: '', brand: '', category: 'GPUs', price: '', oldPrice: '', stock: 'in', stockCount: '',
  sku: '', partNumber: '', shortDescription: '', imageUrl: '', highlights: '', tags: '',
};

/**
 * Mounted only while open (the parent renders `{adding && <AddProductModal/>}`),
 * so every opening starts from a clean form without any reset effect.
 */
export default function AddProductModal({ onClose, onCreated }: Props) {
  const [form, setForm]     = useState({ ...EMPTY });
  const [specs, setSpecs]   = useState<SpecRow[]>([{ key: '', value: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.brand.trim()) { setError('Name and brand are required.'); return; }
    if (!form.price || Number(form.price) < 0.01)  { setError('Enter a valid price.'); return; }
    if (form.shortDescription.trim().length < 10)  { setError('Short description must be at least 10 characters.'); return; }

    const specsObj: Record<string, string> = {};
    for (const r of specs) if (r.key.trim() && r.value.trim()) specsObj[r.key.trim()] = r.value.trim();

    setSaving(true);
    try {
      const res  = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:             form.name,
          brand:            form.brand,
          category:         form.category,
          price:            Number(form.price),
          oldPrice:         form.oldPrice ? Number(form.oldPrice) : null,
          stock:            form.stock,
          stockCount:       form.stockCount ? Number(form.stockCount) : null,
          sku:              form.sku,
          partNumber:       form.partNumber,
          shortDescription: form.shortDescription,
          imageUrl:         form.imageUrl,
          highlights:       form.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
          tags:             form.tags.split(',').map((s) => s.trim()).filter(Boolean),
          specs:            specsObj,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? `Failed (${res.status}).`); return; }
      onCreated(data.id, form.name.trim());
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,9,24,.55)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 720, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 id="add-product-title" style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Add product</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL} htmlFor="ap-name">Product name *</label>
            <input id="ap-name" style={INPUT} value={form.name} onChange={set('name')} maxLength={120} placeholder="e.g. Nova RTX 5080 16GB OC" required autoFocus />
          </div>

          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-brand">Brand *</label>
            <input id="ap-brand" style={INPUT} value={form.brand} onChange={set('brand')} maxLength={60} placeholder="e.g. Nova" required />
          </div>
          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-category">Category *</label>
            <select id="ap-category" style={INPUT} value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-price">Price (USD) *</label>
            <input id="ap-price" style={INPUT} type="number" min="0.01" step="0.01" value={form.price} onChange={set('price')} placeholder="499.99" required />
          </div>
          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-oldprice">Old price (optional, shows a discount)</label>
            <input id="ap-oldprice" style={INPUT} type="number" min="0.01" step="0.01" value={form.oldPrice} onChange={set('oldPrice')} placeholder="599.99" />
          </div>

          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-stock">Stock status *</label>
            <select id="ap-stock" style={INPUT} value={form.stock} onChange={set('stock')}>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-stockcount">Units on hand</label>
            <input id="ap-stockcount" style={INPUT} type="number" min="0" step="1" value={form.stockCount} onChange={set('stockCount')} placeholder="auto" />
          </div>

          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-sku">SKU (blank = auto)</label>
            <input id="ap-sku" style={INPUT} value={form.sku} onChange={set('sku')} maxLength={40} placeholder="NO-0726" />
          </div>
          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-part">Part number (optional)</label>
            <input id="ap-part" style={INPUT} value={form.partNumber} onChange={set('partNumber')} maxLength={60} />
          </div>

          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL} htmlFor="ap-desc">Short description * <span style={{ fontWeight: 400 }}>({form.shortDescription.trim().length}/300)</span></label>
            <textarea id="ap-desc" style={{ ...INPUT, minHeight: 72, resize: 'vertical' }} value={form.shortDescription} onChange={set('shortDescription')} maxLength={300} placeholder="One or two sentences shown under the product title." required />
          </div>

          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL} htmlFor="ap-image">Image</label>
            <input id="ap-image" style={INPUT} value={form.imageUrl} onChange={set('imageUrl')} placeholder="/product-images/gpus/nova-rtx-5080.png" />
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
              Use a <code>/product-images/…</code> path from the product-images repo, or a <code>/public</code> path. Other hosts are not allowed by the image optimizer.
            </div>
          </div>

          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-highlights">Highlights (one per line)</label>
            <textarea id="ap-highlights" style={{ ...INPUT, minHeight: 80, resize: 'vertical' }} value={form.highlights} onChange={set('highlights')} placeholder={'16GB GDDR7 memory\nTriple-fan cooling'} />
          </div>
          <div style={FIELD}>
            <label style={LABEL} htmlFor="ap-tags">Tags (comma separated, max 5)</label>
            <input id="ap-tags" style={INPUT} value={form.tags} onChange={set('tags')} placeholder="New Arrival, Sale" />
          </div>

          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL}>Specifications</label>
            {specs.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: 8, marginBottom: 6 }}>
                <input style={INPUT} placeholder="Spec (e.g. VRAM)" value={row.key} maxLength={60}
                  onChange={(e) => setSpecs((s) => s.map((r, j) => j === i ? { ...r, key: e.target.value } : r))} />
                <input style={INPUT} placeholder="Value (e.g. 16GB GDDR7)" value={row.value} maxLength={120}
                  onChange={(e) => setSpecs((s) => s.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} />
                <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} aria-label="Remove spec"
                  onClick={() => setSpecs((s) => s.length > 1 ? s.filter((_, j) => j !== i) : [{ key: '', value: '' }])}>−</button>
              </div>
            ))}
            {specs.length < 30 && (
              <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={() => setSpecs((s) => [...s, { key: '', value: '' }])}>
                + Add spec
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" style={{ background: 'var(--danger-soft)', border: '1px solid #f5c2c7', borderRadius: 10, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-secondary" style={{ borderRadius: 10 }} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 10 }} disabled={saving}>
            {saving ? 'Adding…' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
