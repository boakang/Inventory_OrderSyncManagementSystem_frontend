import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { customerApi, orderApi } from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function OrderDetailsPage() {
  const { id } = useParams();
  const orderId = Number(id);

  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(orderId) || orderId <= 0) {
        setError('Invalid order id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setCustomerName('');

        const res = await orderApi.getById(orderId);
        setOrder(res.data);

        try {
          const custRes = await customerApi.getById(res.data.customerID);
          const c = custRes.data;
          const name = `${String(c.firstName ?? '').trim()} ${String(c.lastName ?? '').trim()}`.trim();
          setCustomerName(name);
        } catch {
          setCustomerName('');
        }
      } catch (e) {
        console.error('Error loading order:', e);
        setOrder(null);
        setError('Failed to load order.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  const details = useMemo(() => (order?.orderDetails ?? []), [order]);

  const totalAmount = useMemo(() => {
    if (!details.length) return 0;
    return details.reduce((sum, d) => sum + Number(d.quantity ?? 0) * Number(d.unitPrice ?? 0), 0);
  }, [details]);

  const downloadPdf = async () => {
    if (!order) return;

    try {
      setDownloading(true);

      const doc = new jsPDF();
      const orderCode = `ORD-${String(order.orderID ?? orderId).padStart(4, '0')}`;
      const dateText = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '';

      doc.setFontSize(16);
      doc.text('Order Details', 14, 18);

      doc.setFontSize(11);
      doc.text(`Order: #${orderCode}`, 14, 28);
      doc.text(`Date: ${dateText}`, 14, 35);
      doc.text(`Customer: ${customerName || `Customer #${order.customerID}`}`, 14, 42);

      const body = details.map((d) => {
        const qty = Number(d.quantity ?? 0);
        const unit = Number(d.unitPrice ?? 0);
        const storedLine = Number(d.totalPrice);
        const line = Number.isFinite(storedLine) && storedLine > 0 ? storedLine : (qty * unit);
        return [
          String(d.productName || `Product #${d.productID}`),
          String(d.productID ?? ''),
          String(qty),
          unit.toFixed(2),
          line.toFixed(2),
        ];
      });

      autoTable(doc, {
        head: [["Product Name", "Product ID", "Quantity", "Unit Price", "Line Total"]],
        body,
        startY: 52,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        columnStyles: {
          1: { cellWidth: 22 },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 28, halign: 'right' },
        },
      });

      const finalY = (doc.lastAutoTable?.finalY ?? 52) + 10;
      doc.setFontSize(11);
      doc.text(`Total: ${Number(totalAmount).toFixed(2)}`, 14, finalY);

      doc.save(`${orderCode}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
            <p className="text-slate-500">View items for this order.</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2"
          onClick={downloadPdf}
          disabled={!order || downloading}
          title="Download PDF"
        >
          <Download size={18} />
          <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

      {error && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-slate-500">Loading...</div>
      ) : order ? (
        <>
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-500">Order</div>
                <div className="text-xl font-bold text-slate-900 font-mono">#ORD-{String(order.orderID).padStart(4, '0')}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-500">Customer</div>
                <div className="text-lg font-bold text-slate-900">
                  {customerName || `Customer #${order.customerID}`}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-500">Date</div>
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Calendar size={14} />
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-sm font-semibold text-slate-500">Total</div>
                <div className="text-xl font-bold text-slate-900">${Number(order.totalAmount ?? totalAmount).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Items</h3>
              <span className="text-sm font-medium text-slate-500">{details.length} items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left order-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Product ID</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Unit Price</th>
                    <th className="px-6 py-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {details.map((d) => {
                    const qty = Number(d.quantity ?? 0);
                    const unit = Number(d.unitPrice ?? 0);
                    const storedLine = Number(d.totalPrice);
                    const line = Number.isFinite(storedLine) && storedLine > 0 ? storedLine : (qty * unit);
                    return (
                      <tr key={d.orderDetailID ?? `${order.orderID}-${d.productID}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{d.productName || `Product #${d.productID}`}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{d.productID}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">{qty}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">${unit.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-900 text-right">${line.toLocaleString()}</td>
                      </tr>
                    );
                  })}

                  {details.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No order details.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default OrderDetailsPage;
