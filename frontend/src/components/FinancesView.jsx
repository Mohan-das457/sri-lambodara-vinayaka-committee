import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  FileText,
  DollarSign,
  Download,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';

export default function FinancesView({
  onRefresh
}) {
  const { lang, t } = useLanguage();
  const { user, authFetch } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'expenses' | 'donations'
  const [report, setReport] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expTitleTe, setExpTitleTe] = useState('');
  const [expFund, setExpFund] = useState('general');
  const [expCategory, setExpCategory] = useState('Pooja Items');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expBillRef, setExpBillRef] = useState('');
  const [expRemarks, setExpRemarks] = useState('');

  // Donation form
  const [donName, setDonName] = useState('');
  const [donPhone, setDonPhone] = useState('');
  const [donFund, setDonFund] = useState('festival');
  const [donAmount, setDonAmount] = useState('');
  const [donMode, setDonMode] = useState('Cash');
  const [donUpiRef, setDonUpiRef] = useState('');
  const [donPurpose, setDonPurpose] = useState('Festival Annadanam Sponsorship (మహా అన్నదానం)');

  const fetchData = async () => {
    setLoading(true);
    try {
      const repRes = await authFetch('/api/finances/report');
      if (repRes.ok) setReport(await repRes.json());

      const expRes = await authFetch('/api/finances/expenses');
      if (expRes.ok) setExpenses(await expRes.json());

      const donRes = await authFetch('/api/finances/other-income');
      if (donRes.ok) setDonations(await donRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/finances/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expTitle,
          title_te: expTitleTe || expTitle,
          fund_code: expFund,
          category: expCategory,
          amount: expAmount,
          paid_to: expPaidTo,
          bill_receipt_ref: expBillRef,
          remarks: expRemarks
        })
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpTitle('');
        setExpTitleTe('');
        setExpAmount('');
        setExpPaidTo('');
        fetchData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/finances/other-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: donName,
          donor_phone: donPhone,
          fund_code: donFund,
          amount: donAmount,
          payment_mode: donMode,
          upi_ref: donUpiRef,
          purpose: donPurpose
        })
      });
      if (res.ok) {
        setShowDonationModal(false);
        setDonName('');
        setDonPhone('');
        setDonAmount('');
        fetchData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Header and Toolbar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('financesTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {lang === 'te'
              ? 'సాధారణ ఆలయ నిధి & గణేష్ ఉత్సవ నిధుల సమగ్ర వ్యయ లెక్కలు'
              : 'Segregated accounting for General Temple Fund and Ganesh Utsav Festival Fund'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(user?.role === 'admin' || user?.role === 'treasurer') && (
            <>
              <button
                id="record-expense-btn"
                onClick={() => setShowExpenseModal(true)}
                className="btn btn-sacred btn-sm"
              >
                <TrendingDown size={16} />
                <span>{t('addExpense')}</span>
              </button>
              <button
                id="record-donation-btn"
                onClick={() => setShowDonationModal(true)}
                className="btn btn-primary btn-sm"
              >
                <TrendingUp size={16} />
                <span>{t('addDonation')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub tabs: Overview, Expenses, Donations */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--gold-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`btn btn-sm ${activeSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('fundsOverview')}
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`btn btn-sm ${activeSubTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('expensesLedger')} ({expenses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('donations')}
          className={`btn btn-sm ${activeSubTab === 'donations' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('donationsLedger')} ({donations.length})
        </button>
      </div>

      {/* View 1: Overview */}
      {activeSubTab === 'overview' && (
        <>
          {/* Fund Balance Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            
            {/* General Fund Box */}
            <div className="card card-glowing-gold" style={{ background: 'linear-gradient(145deg, #1d130d 0%, #130c08 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div className="badge badge-partial" style={{ marginBottom: '0.4rem' }}>
                    {lang === 'te' ? 'సాధారణ నిధి' : 'General Fund'}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fef3c7', margin: 0 }}>
                    {t('generalFund')}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    {t('generalFundDesc')}
                  </p>
                </div>
                <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px' }}>
                  <Wallet size={24} color="#fbbf24" />
                </div>
              </div>

              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
                ₹{(report?.generalFund?.currentBalance || 148500).toLocaleString('en-IN')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem', borderTop: '1px solid var(--gold-border)', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{lang === 'te' ? 'చందాల ఆదాయం:' : 'Dues Income:'}</span>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>₹{(report?.generalFund?.breakdown?.monthlyDues || 2250).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{lang === 'te' ? 'ఆలయ ఖర్చులు:' : 'Expenses:'}</span>
                  <div style={{ fontWeight: 700, color: '#f87171' }}>₹{(report?.generalFund?.totalExpenses || 13550).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Festival Fund Box */}
            <div className="card card-glowing-crimson" style={{ background: 'linear-gradient(145deg, #221210 0%, #150a08 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>
                    {lang === 'te' ? 'ఉత్సవ నిధి' : 'Festival Fund'}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fef3c7', margin: 0 }}>
                    {t('festivalFund')}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    {t('festivalFundDesc')}
                  </p>
                </div>
                <div style={{ padding: '10px', background: 'rgba(220, 38, 38, 0.2)', borderRadius: '12px' }}>
                  <Sparkles size={24} color="#f87171" />
                </div>
              </div>

              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
                ₹{(report?.festivalFund?.currentBalance || 284000).toLocaleString('en-IN')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem', borderTop: '1px solid rgba(220, 38, 38, 0.3)', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{lang === 'te' ? 'విశేష దాతల కానుకలు:' : 'Donations:'}</span>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>₹{(report?.festivalFund?.breakdown?.donationsAndSponsorships || 75000).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{lang === 'te' ? 'ఉత్సవ ఖర్చులు:' : 'Expenses:'}</span>
                  <div style={{ fontWeight: 700, color: '#f87171' }}>₹{(report?.festivalFund?.totalExpenses || 25000).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Consolidated Summary */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--gold-border-bright)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fbbf24', margin: '0 0 0.2rem 0' }}>
                {t('totalReserves')}: ₹{((report?.generalFund?.currentBalance || 148500) + (report?.festivalFund?.currentBalance || 284000)).toLocaleString('en-IN')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
                {lang === 'te'
                  ? 'కమిటీ బ్యాంక్ ఖాతా & ఖజానాలో భద్రపరచబడిన మొత్తం నిధులు'
                  : 'Total combined assets deposited in Committee Bank Account & Treasury'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
            >
              <Download size={14} />
              <span>{lang === 'te' ? 'నివేదిక ప్రింట్ / PDF' : 'Print Statement'}</span>
            </button>
          </div>
        </>
      )}

      {/* View 2: Expenses Ledger */}
      {activeSubTab === 'expenses' && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('voucherNo')}</th>
                  <th>{t('date')}</th>
                  <th>{t('category')}</th>
                  <th>వివరణ / Title</th>
                  <th>{t('amount')}</th>
                  <th>{t('paidTo')}</th>
                  <th>{t('approvedBy')}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'monospace', color: '#f87171', fontWeight: 600 }}>{e.voucher_number}</td>
                    <td>{e.expense_date}</td>
                    <td><span className="badge badge-role">{e.category}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fef3c7' }}>
                        {lang === 'te' && e.title_te ? e.title_te : e.title}
                      </div>
                      {e.remarks && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.remarks}</div>}
                    </td>
                    <td style={{ fontWeight: 800, color: '#f87171', fontSize: '1rem' }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</td>
                    <td>{e.paid_to}</td>
                    <td>{e.approved_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Donations Ledger */}
      {activeSubTab === 'donations' && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('receiptNo')}</th>
                  <th>{t('date')}</th>
                  <th>{t('donorName')}</th>
                  <th>{t('purpose')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('paymentMode')}</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--gold-300)', fontWeight: 600 }}>{d.receipt_number}</td>
                    <td>{d.income_date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fef3c7' }}>{d.donor_name}</div>
                      {d.donor_phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.donor_phone}</div>}
                    </td>
                    <td style={{ color: 'var(--gold-200)' }}>{d.purpose}</td>
                    <td style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>₹{parseFloat(d.amount).toLocaleString('en-IN')}</td>
                    <td><span className={d.payment_mode === 'UPI' ? 'badge badge-paid' : 'badge badge-partial'}>{d.payment_mode}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateExpense}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('addExpense')}
                </span>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ఖర్చు ఉద్దేశం / Title (EN)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Flowers & Deepam Oil"
                    value={expTitle}
                    onChange={e => setExpTitle(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Title (తెలుగు)</label>
                  <input
                    type="text"
                    placeholder="ఉదా: పూజా సామగ్రి మరియు నూనె ఖర్చు"
                    value={expTitleTe}
                    onChange={e => setExpTitleTe(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">నిధి / Fund Source</label>
                    <select
                      value={expFund}
                      onChange={e => setExpFund(e.target.value)}
                      className="form-control"
                    >
                      <option value="general">{t('generalFund')}</option>
                      <option value="festival">{t('festivalFund')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('category')}</label>
                    <select
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="Pooja Items">Pooja Items (పూజా సామగ్రి)</option>
                      <option value="Maintenance">Maintenance (నిర్వహణ)</option>
                      <option value="Electricity">Electricity (విద్యుత్ బిల్లు)</option>
                      <option value="Prasad">Prasad (ప్రసాదం)</option>
                      <option value="Ganesh Idol">Ganesh Idol (విగ్రహం)</option>
                      <option value="Tent/Pandals">Tent & Mandapam (మండపం)</option>
                      <option value="Sound/Light">Sound & Light (మైక్ & లైటింగ్)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('amount')} (₹)*</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expAmount}
                      onChange={e => setExpAmount(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('paidTo')}*</label>
                    <input
                      type="text"
                      required
                      placeholder="Vendor / Store Name"
                      value={expPaidTo}
                      onChange={e => setExpPaidTo(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bill / Receipt Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-9921"
                    value={expBillRef}
                    onChange={e => setExpBillRef(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-sacred">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Donation Modal */}
      {showDonationModal && (
        <div className="modal-overlay" onClick={() => setShowDonationModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateDonation}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('addDonation')}
                </span>
                <button type="button" onClick={() => setShowDonationModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t('donorName')}*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri K. Suresh & Family"
                    value={donName}
                    onChange={e => setDonName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('phone')}</label>
                    <input
                      type="tel"
                      placeholder="9848011223"
                      value={donPhone}
                      onChange={e => setDonPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('amount')} (₹)*</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="10000"
                      value={donAmount}
                      onChange={e => setDonAmount(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('purpose')}</label>
                    <select
                      value={donPurpose}
                      onChange={e => setDonPurpose(e.target.value)}
                      className="form-control"
                    >
                      <option value="Festival Annadanam Sponsorship (మహా అన్నదానం)">Annadanam Sponsorship (అన్నదానం)</option>
                      <option value="Pandal & Floral Decoration (మండపం)">Mandapam Sponsorship (మండపం)</option>
                      <option value="Temple Hundi Offering (హుండీ కానుక)">Hundi Offering (హుండీ)</option>
                      <option value="Special Pooja Seva (విశేష పూజ)">Special Pooja (విశేష పూజ)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('paymentMode')}</label>
                    <select
                      value={donMode}
                      onChange={e => setDonMode(e.target.value)}
                      className="form-control"
                    >
                      <option value="Cash">{t('cash')}</option>
                      <option value="UPI">{t('upi')}</option>
                    </select>
                  </div>
                </div>

                {donMode === 'UPI' && (
                  <div className="form-group">
                    <label className="form-label">UPI Reference / UTR Number</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/261012999/SBI"
                      value={donUpiRef}
                      onChange={e => setDonUpiRef(e.target.value)}
                      className="form-control"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowDonationModal(false)} className="btn btn-secondary">
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
