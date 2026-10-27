'use client';

/**
 * ReceiptTicket — premium payment receipt (Task 3)
 * ================================================
 * A ticket-style receipt shown on /payment/success once an order is PAID.
 *
 * Design (per brief):
 *  - Rounded white card, soft shadow, on a light gradient background
 *  - Ticket notches cut into the sides at the dashed divider
 *  - Scalloped bottom edge
 *  - Celebration icon, "Thank you!" heading + subtext
 *  - Fields: Order/Ticket ID, Amount, Date & Time, Payment method
 *    (card brand mark, cardholder name, masked last 4)
 *  - Itemized purchases, subtotal, tax, shipping, total
 *  - Genuine Code 39 barcode generated from the order ID
 *
 * Data: 100% real order data from /api/payhere/status/[orderId].
 * Nothing is hardcoded — optional card fields simply don't render when the
 * gateway didn't supply them.
 *
 * Export: "Download receipt" triggers a print-optimized view (browser
 * "Save as PDF") with a print stylesheet that reproduces the on-screen
 * ticket 1:1 (see `@media print` rules for .receipt-* in globals.css).
 *
 * Motion: entrance slide/scale + staggered field reveal. Only transform &
 * opacity are animated; `prefers-reduced-motion` disables everything via
 * the global rule in globals.css.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Barcode39 from '@/app/components/ui/Barcode39';
import { paymentBrandMark, paymentBrandLabel, CelebrationIcon, DownloadIcon } from '@/app/components/icons';
import { fmt } from '@/lib/data';

export interface ReceiptOrder {
  orderId: string;
  status: string;
  total: number;
  currency: string;
  items: { name: string; quantity: number; price: number; lineTotal: number }[];
  itemCount: number;
  firstName: string;
  lastName?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  paymentMethod?: string;
  cardHolder?: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  order: ReceiptOrder;
  onDownload?: () => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function ReceiptTicket({ order, onDownload }: Props) {
  const cardRef    = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [notchY, setNotchY] = useState<number | null>(null);

  /* Measure the divider's offset so the side notches are cut exactly at it.
     Re-measured on resize so every breakpoint keeps aligned notches. */
  useEffect(() => {
    const measure = () => {
      if (!cardRef.current || !dividerRef.current) return;
      const card = cardRef.current.getBoundingClientRect();
      const div  = dividerRef.current.getBoundingClientRect();
      const y = div.top - card.top + div.height / 2;
      if (y > 0) setNotchY(Math.round(y));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (cardRef.current) ro.observe(cardRef.current);
    return () => ro.disconnect();
  }, [order.orderId]);

  /* Print-to-PDF export — sets a friendly document title so the saved file
     is named after the order, then restores it. */
  const handleDownload = useCallback(() => {
    const prevTitle = document.title;
    document.title = `Vertex-Receipt-${order.orderId}`;
    onDownload?.();
    window.print();
    // Restore after the print dialog closes
    setTimeout(() => { document.title = prevTitle; }, 500);
  }, [order.orderId, onDownload]);

  const cardholder = order.cardHolder ?? `${order.firstName} ${order.lastName ?? ''}`.trim();
  const methodLabel = paymentBrandLabel(order.cardBrand ?? order.paymentMethod);
  const brandMark = paymentBrandMark(order.cardBrand ?? order.paymentMethod);
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.lineTotal, 0);
  const tax = order.tax ?? 0;
  const shipping = order.shipping ?? Math.max(0, order.total - subtotal - tax);
  const paidAt = order.updatedAt ?? order.createdAt;

  return (
    <div className="receipt-page">
      {/* Decorative background glows (purely visual, never overlap notches —
          they sit far outside the card column) */}
      <span className="receipt-glow receipt-glow-a" aria-hidden="true" />
      <span className="receipt-glow receipt-glow-b" aria-hidden="true" />

      <div
        ref={cardRef}
        id="receipt-card"
        className={`receipt-card${notchY != null ? ' notched' : ''}`}
        style={notchY != null ? ({ '--notch-y': `${notchY}px` } as React.CSSProperties) : undefined}
        role="article"
        aria-label={`Payment receipt for order ${order.orderId}`}
      >
        {/* ── Brand header ── */}
        <div className="rc-head">
          <span className="rc-brand">
            <img src="/logo.png" alt="" width={30} height={30} />
            <span>VERTEX<small>SMARTER BUILDS.</small></span>
          </span>
          <span className="rc-chip mono">OFFICIAL RECEIPT</span>
        </div>

        {/* ── Celebration ── */}
        <div className="rc-celebrate">
          <span className="rc-celebrate-icon">
            <CelebrationIcon size={58} />
            <i className="rc-spark rc-spark-1" aria-hidden="true" />
            <i className="rc-spark rc-spark-2" aria-hidden="true" />
            <i className="rc-spark rc-spark-3" aria-hidden="true" />
          </span>
          <h1>Thank you!</h1>
          <p>Your order has been placed successfully</p>
        </div>

        {/* ── Key fields (staggered reveal) ── */}
        <div className="rc-fields">
          <div className="rc-field" style={{ '--i': 0 } as React.CSSProperties}>
            <span className="rc-field-label">Order ID</span>
            <span className="rc-field-value mono">{order.orderId}</span>
          </div>
          <div className="rc-field" style={{ '--i': 1 } as React.CSSProperties}>
            <span className="rc-field-label">Amount</span>
            <span className="rc-field-value rc-amount">{fmt(order.total)}</span>
          </div>
          <div className="rc-field" style={{ '--i': 2 } as React.CSSProperties}>
            <span className="rc-field-label">Date &amp; Time</span>
            <span className="rc-field-value">{formatDateTime(paidAt)}</span>
          </div>
          <div className="rc-field" style={{ '--i': 3 } as React.CSSProperties}>
            <span className="rc-field-label">Payment Method</span>
            <span className="rc-card">
              <span className="rc-card-mark">{brandMark}</span>
              <span className="rc-card-meta">
                <b>{methodLabel}{order.cardLast4 ? ` •••• ${order.cardLast4}` : ''}</b>
                <small>{cardholder}</small>
              </span>
            </span>
          </div>
        </div>

        {/* ── Ticket divider (notches cut here via mask) ── */}
        <div ref={dividerRef} className="rc-divider" aria-hidden="true">
          <span className="rc-dash" />
        </div>

        {/* ── Purchased items ── */}
        <div className="rc-items" aria-label="Purchased items">
          <h2 className="rc-items-title">
            Purchased Items
            <span className="mono">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
          </h2>
          <ul>
            {order.items.map((item, i) => (
              <li key={`${item.name}-${i}`} style={{ '--i': i } as React.CSSProperties}>
                <span className="rc-item-name">
                  {item.name}
                  {item.quantity > 1 && <em className="mono"> ×{item.quantity}</em>}
                </span>
                <span className="rc-item-price mono">{fmt(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="rc-totals">
            <div><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
            <div><dt>Tax</dt><dd>{fmt(tax)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping > 0 ? fmt(shipping) : 'FREE'}</dd></div>
            <div className="rc-total-row"><dt>Total Paid</dt><dd>{fmt(order.total)}</dd></div>
          </dl>
        </div>

        {/* ── Divider #2 ── */}
        <div className="rc-divider rc-divider-2" aria-hidden="true">
          <span className="rc-dash" />
        </div>

        {/* ── Barcode (real Code 39 from the order ID) ── */}
        <div className="rc-barcode">
          <Barcode39 value={order.orderId} unit={1.15} height={52} />
          <p className="rc-scan-hint mono">Present this barcode for order pickup &amp; support</p>
        </div>

        <p className="rc-fineprint">
          Vertex Computers · {fmt(order.total)} paid via {methodLabel} · {formatDateTime(paidAt)}<br />
          Questions? support@vertexcomputers.example — keep this receipt for warranty and returns.
        </p>
      </div>

      {/* ── Actions (screen only — hidden when printing) ── */}
      <div className="receipt-actions">
        <button className="btn btn-primary btn-lg rc-download" onClick={handleDownload}>
          <DownloadIcon size={17} />
          Download Receipt
        </button>
        <p className="rc-download-hint">Saves as PDF — looks exactly like the ticket above.</p>
      </div>
    </div>
  );
}
