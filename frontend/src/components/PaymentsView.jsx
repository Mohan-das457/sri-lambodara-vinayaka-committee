import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  PlusCircle,
  Search,
  Receipt,
  CheckCircle,
  Share2,
  Calendar,
  X
} from 'lucide-react';

export default function PaymentsView({
  payments,
  members,
  onRecordPayment,
  onViewReceipt,
  onRefresh
}) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.receipt_number.toLowerCase().includes(q) ||
      p.full_name?.toLowerCase().includes(q) ||
      (p.full_name_te && p.full_name_te.includes(q)) ||
      (p.upi_ref && p.upi_ref.toLowerCase().includes(q));
    const matchesMode = modeFilter === 'all' || p.payment_mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Header and Toolbar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('paymentsTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {lang === 'te'
              ? 'నగదు మరియు UPI చెల్లింపుల రికార్డులు & అధికారిక డిజిటల్ రసీదులు'
              : 'Cash & UPI transaction ledger with unique digital receipt numbers'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} color="#d1bfa7" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder={lang === 'te' ? 'రసీదు, పేరు లేదా UTR...' : 'Receipt, name or UTR...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', height: '36px', padding: '0 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="all">{t('paymentMode')} ({t('allStatus')})</option>
            <option value="Cash">{t('cash')}</option>
            <option value="UPI">{t('upi')}</option>
          </select>

          {(user?.role === 'admin' || user?.role === 'treasurer') && (
            <button
              id="new-payment-record-btn"
              onClick={onRecordPayment}
              className="btn btn-primary btn-sm"
              style={{ height: '36px' }}
            >
              <PlusCircle size={16} />
              <span>{t('newPayment')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('receiptNo')}</th>
                <th>{t('date')}</th>
                <th>{t('member')}</th>
                <th>{t('amount')}</th>
                <th>{t('paymentMode')}</th>
                <th>{t('transactionRef')}</th>
                <th>{t('receivedBy')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold-300)', fontWeight: 700 }}>
                      {p.receipt_number}
                    </td>
                    <td>{p.payment_date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fef3c7' }}>
                        {lang === 'te' && p.full_name_te ? p.full_name_te : p.full_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.member_code}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={p.payment_mode === 'UPI' ? 'badge badge-paid' : 'badge badge-partial'}>
                        {p.payment_mode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-sub)' }}>
                      {p.upi_ref || '-'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      {p.received_by}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Receipt size={13} />
                          <span>{t('viewReceipt')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {t('noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
