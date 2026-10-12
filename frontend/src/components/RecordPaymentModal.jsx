import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Check, X } from 'lucide-react';

export default function RecordPaymentModal({
  isOpen,
  onClose,
  members,
  prefillData,
  onPaymentSuccess
}) {
  const { lang, t } = useLanguage();
  const { authFetch } = useAuth();

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('1000');
  const [fundCode, setFundCode] = useState('general');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [upiRef, setUpiRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [dueId, setDueId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (prefillData) {
      if (prefillData.member_id) setMemberId(String(prefillData.member_id));
      else if (prefillData.id) setMemberId(String(prefillData.id));

      if (prefillData.amount) {
        const bal = parseFloat(prefillData.amount) - parseFloat(prefillData.paid_amount || 0);
        setAmount(bal > 0 ? String(bal) : String(prefillData.amount));
      }
      if (prefillData.due_id || prefillData.id) {
        setDueId(prefillData.due_id || (prefillData.due_month ? prefillData.id : null));
      }
      if (prefillData.due_month) {
        setRemarks(`${prefillData.due_month}/${prefillData.due_year} Monthly Contribution`);
      }
    } else {
      if (members && members.length > 0 && !memberId) {
        setMemberId(String(members[0].id));
      }
    }
  }, [prefillData, members]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentMode === 'UPI' && !upiRef.trim()) {
      setErrorMsg('Please enter UPI Transaction Reference / UTR Number for digital payments.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          due_id: dueId,
          fund_code: fundCode,
          amount: parseFloat(amount),
          payment_mode: paymentMode,
          upi_ref: paymentMode === 'UPI' ? upiRef.trim() : null,
          payment_date: paymentDate,
          remarks: remarks.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to record payment');
        setSubmitting(false);
        return;
      }

      onClose();
      onPaymentSuccess(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#fbbf24" />
              <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                {t('newPayment')}
              </span>
            </div>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            {/* Member Select */}
            <div className="form-group">
              <label className="form-label">{t('member')}*</label>
              <select
                id="payment-member-select"
                required
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                className="form-control"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.member_code} - {m.full_name} {m.full_name_te ? `(${m.full_name_te})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount and Fund */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('amount')} (₹)*</label>
                <input
                  id="payment-amount-input"
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'te' ? 'నిధి వర్గం' : 'Fund Account'}</label>
                <select
                  value={fundCode}
                  onChange={e => setFundCode(e.target.value)}
                  className="form-control"
                >
                  <option value="general">{t('generalFund')}</option>
                  <option value="festival">{t('festivalFund')}</option>
                </select>
              </div>
            </div>

            {/* Mode & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('paymentMode')}*</label>
                <select
                  id="payment-mode-select"
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="form-control"
                >
                  <option value="Cash">{t('cash')}</option>
                  <option value="UPI">{t('upi')} (PhonePe / GPay / Paytm)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('date')}*</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            {/* UPI Reference if UPI */}
            {paymentMode === 'UPI' && (
              <div className="form-group">
                <label className="form-label">UPI Reference / UTR Number*</label>
                <input
                  id="payment-upi-ref-input"
                  type="text"
                  required
                  placeholder="e.g. UPI/261012998811/HDFC"
                  value={upiRef}
                  onChange={e => setUpiRef(e.target.value)}
                  className="form-control"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  {lang === 'te' ? 'యూపీఐ చెల్లింపు ధృవీకరణకు UTR నంబరు తప్పనిసరి' : 'Required for digital audit verification'}
                </small>
              </div>
            )}

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">{t('remarks')}</label>
              <input
                type="text"
                placeholder={lang === 'te' ? 'ఉదా: అక్టోబర్ నెల చందా చెల్లింపు' : 'e.g. October monthly subscription'}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="form-control"
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('cancel')}
            </button>
            <button
              id="submit-payment-btn"
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Recording...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
