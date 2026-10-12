import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  CreditCard,
  X
} from 'lucide-react';

export default function DuesView({
  onRecordPaymentForDue,
  onSendWhatsAppReminder
}) {
  const { lang, t, getMonthName } = useLanguage();
  const { user, authFetch } = useAuth();
  
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [statusFilter, setStatusFilter] = useState('all');
  const [duesList, setDuesList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genAmount, setGenAmount] = useState(1000);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/dues?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setDuesList(data);
      }

      const sumRes = await authFetch(`/api/dues/summary?month=${selectedMonth}&year=${selectedYear}`);
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, [selectedMonth, selectedYear]);

  const handleGenerateDues = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/dues/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          amount: genAmount
        })
      });
      if (res.ok) {
        setShowGenModal(false);
        fetchDues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDues = duesList.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Month Selection & Actions Toolbar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('duesManagement')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {getMonthName(selectedMonth)} {selectedYear} • {lang === 'te' ? 'నెలవారీ చందాల స్థితి మరియు వసూలు' : 'Monthly Member Contribution Records'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
            className="form-control"
            style={{ width: 'auto', height: '36px', padding: '0 0.8rem', fontSize: '0.85rem' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            className="form-control"
            style={{ width: 'auto', height: '36px', padding: '0 0.8rem', fontSize: '0.85rem' }}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', height: '36px', padding: '0 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="paid">{t('statusPaid')}</option>
            <option value="pending">{t('statusPending')}</option>
            <option value="partial">{t('statusPartial')}</option>
          </select>

          {(user?.role === 'admin' || user?.role === 'treasurer') && (
            <button
              id="generate-dues-btn"
              onClick={() => setShowGenModal(true)}
              className="btn btn-primary btn-sm"
              style={{ height: '36px' }}
            >
              <PlusCircle size={16} />
              <span>{t('actionGenerateDues')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Badges */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', borderLeft: '3px solid var(--gold-400)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('totalTarget')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-200)' }}>
              ₹{summary.totalObligation.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              {summary.totalMembers} {lang === 'te' ? 'సభ్యులు' : 'Members'}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', borderLeft: '3px solid #34d399' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('collected')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
              ₹{summary.totalCollected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
              {summary.paidCount} {t('statusPaid')} ({summary.percentage}%)
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', borderLeft: '3px solid #f87171' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('pending')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
              ₹{summary.totalPending.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#f87171' }}>
              {summary.pendingCount} {t('statusPending')} • {summary.partialCount} {t('statusPartial')}
            </div>
          </div>
        </div>
      )}

      {/* Dues Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('memberId')}</th>
                <th>{t('memberName')}</th>
                <th>{t('phone')}</th>
                <th>{t('dueAmount')}</th>
                <th>{t('paidAmount')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.length > 0 ? (
                filteredDues.map(due => (
                  <tr key={due.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold-300)' }}>
                      {due.member_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fef3c7' }}>
                        {due.full_name}
                      </div>
                      {due.full_name_te && (
                        <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                          {due.full_name_te}
                        </div>
                      )}
                    </td>
                    <td>{due.phone}</td>
                    <td style={{ fontWeight: 600 }}>₹{due.amount}</td>
                    <td style={{ fontWeight: 600, color: due.paid_amount > 0 ? '#34d399' : 'var(--text-muted)' }}>
                      ₹{due.paid_amount}
                    </td>
                    <td>
                      <span className={due.status === 'paid' ? 'badge badge-paid' : due.status === 'partial' ? 'badge badge-partial' : 'badge badge-pending'}>
                        {due.status === 'paid' ? t('statusPaid') : due.status === 'partial' ? t('statusPartial') : t('statusPending')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {due.status !== 'paid' && (user?.role === 'admin' || user?.role === 'treasurer') && (
                          <button
                            onClick={() => onRecordPaymentForDue(due)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          >
                            <CreditCard size={13} />
                            <span>{t('markPaid')}</span>
                          </button>
                        )}
                        {due.status !== 'paid' && (
                          <button
                            onClick={() => onSendWhatsAppReminder({ ...due, id: due.member_id })}
                            className="btn btn-whatsapp btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            title="Send WhatsApp Reminder"
                          >
                            <Share2 size={13} />
                            <span>WhatsApp</span>
                          </button>
                        )}
                        {due.status === 'paid' && (
                          <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={14} /> {t('statusPaid')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading...' : t('noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Dues Modal */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleGenerateDues}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('generateDuesModalTitle')}
                </span>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
                  {lang === 'te'
                    ? `${getMonthName(selectedMonth)} ${selectedYear} నెలకు సంబంధించి క్రియాశీల సభ్యులందరికీ ఏకకాలంలో చందా రికార్డులు రూపొందించబడును.`
                    : `This will generate monthly contribution obligation for all active members for ${getMonthName(selectedMonth)} ${selectedYear}.`}
                </p>

                <div className="form-group">
                  <label className="form-label">{t('dueAmount')} (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={genAmount}
                    onChange={e => setGenAmount(e.target.value)}
                    className="form-control"
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {lang === 'te' ? 'కమిటీ నిబంధనల ప్రకారం సాధారణ చందా ₹1,000' : 'Default standard monthly dues is ₹1,000'}
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
