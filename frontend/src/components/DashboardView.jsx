import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  CreditCard,
  PlusCircle,
  Share2,
  Receipt,
  ArrowUpRight,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DashboardView({
  stats,
  recentPayments,
  upcomingMeeting,
  announcements,
  onOpenPaymentModal,
  onOpenMeetingModal,
  onOpenDueGenModal,
  onViewReceipt,
  onNavigateTab
}) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const collectionPercent = stats?.currentMonthDues?.collectionPercentage || 0;
  const targetAmount = stats?.currentMonthDues?.total || 4000;
  const collectedAmount = stats?.currentMonthDues?.collected || 2250;
  const pendingAmount = stats?.currentMonthDues?.pending || 1750;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Sacred Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.45) 0%, rgba(32, 22, 16, 0.85) 60%, rgba(245, 158, 11, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: 'var(--shadow-gold)',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '24px' }}>🕉️</span>
            <span className="badge badge-role">
              {lang === 'te' ? 'శుభారంభం' : 'Auspicious Portal'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#fbbf24', margin: '0 0 0.3rem 0', fontWeight: 800 }}>
            {lang === 'te' ? 'శ్రీ లంబోదర వినాయక సమక్షంలో స్వాగతం' : 'Welcome to Sri Lambodara Vinayaka Portal'}
          </h2>
          <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.95rem' }}>
            {lang === 'te'
              ? 'ఆలయ అభివృద్ధి, సభ్యుల చందాలు, సమావేశాలు మరియు ఉత్సవ నిధుల సమగ్ర డిజిటల్ నిర్వహణ వ్యవస్థ.'
              : 'Unified digital records for committee dues, meetings, accounting, and festival celebrations.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(user?.role === 'admin' || user?.role === 'treasurer') && (
            <button
              id="dash-record-payment-btn"
              onClick={onOpenPaymentModal}
              className="btn btn-primary"
            >
              <CreditCard size={18} />
              <span>{t('actionRecordPayment')}</span>
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'secretary') && (
            <button
              id="dash-schedule-meeting-btn"
              onClick={onOpenMeetingModal}
              className="btn btn-secondary"
            >
              <Calendar size={18} />
              <span>{t('actionScheduleMeeting')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Core Financial & Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: General Temple Fund */}
        <div className="card card-glowing-gold">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{t('generalFund')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('generalFundDesc')}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px' }}>
              <Wallet size={20} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-serif)' }}>
            ₹{(stats?.generalFundBalance || 148500).toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#34d399' }}>
            <TrendingUp size={14} />
            <span>{lang === 'te' ? 'ఆలయ నిర్వహణకు లభ్యం' : 'Available for Temple Seva'}</span>
          </div>
        </div>

        {/* Card 2: Festival & Ganesh Utsav Fund */}
        <div className="card card-glowing-crimson">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{t('festivalFund')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('festivalFundDesc')}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(220, 38, 38, 0.2)', borderRadius: '10px' }}>
              <Sparkles size={20} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-serif)' }}>
            ₹{(stats?.festivalFundBalance || 284000).toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#fca5a5' }}>
            <span>{lang === 'te' ? 'ప్రత్యేక ఉత్సవ నిల్వ' : 'Special Utsav Reserve'}</span>
          </div>
        </div>

        {/* Card 3: Monthly Collection Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{t('monthlyCollection')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('target')}: ₹{targetAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="badge badge-partial">
              {collectionPercent}% {t('collected')}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-serif)' }}>
            ₹{collectedAmount.toLocaleString('en-IN')}
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.6rem' }}>
            <div
              style={{
                width: `${collectionPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                borderRadius: '4px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            <span>{t('pending')}: ₹{pendingAmount.toLocaleString('en-IN')}</span>
            <span>{lang === 'te' ? 'గడువు: 15వ తేదీ' : 'Due: 15th'}</span>
          </div>
        </div>

        {/* Card 4: Active Members & Meeting */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{t('activeMembers')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang === 'te' ? 'కమిటీ హోదాలు' : 'Committee Roster'}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px' }}>
              <Users size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-serif)' }}>
            {stats?.activeMembersCount || 8} / {stats?.membersCount || 8}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gold-200)' }}>
            <Calendar size={14} />
            <span>{lang === 'te' ? 'ప్రతి నెలా 15న రాత్రి 7:30కి మీటింగ్' : 'Monthly Meeting on 15th'}</span>
          </div>
        </div>

      </div>

      {/* Grid: Left = Recent Payments, Right = Meeting Card & Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Recent Payment Records */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--gold-border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="#fbbf24" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-200)', margin: 0 }}>
                {t('recentPayments')}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              {t('viewAll')} <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('receiptNo')}</th>
                  <th>{t('member')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('paymentMode')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments && recentPayments.length > 0 ? (
                  recentPayments.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--gold-300)', fontWeight: 600 }}>
                        {p.receipt_number}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {lang === 'te' && p.full_name_te ? p.full_name_te : p.full_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.member_code}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                        ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={p.payment_mode === 'UPI' ? 'badge badge-paid' : 'badge badge-partial'}>
                          {p.payment_mode}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          {t('viewReceipt')}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      {t('noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upcoming Meeting & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Upcoming Meeting Feature Card */}
          {upcomingMeeting && (
            <div className="card" style={{ background: 'linear-gradient(145deg, #1f140e 0%, #150d09 100%)', border: '1px solid var(--gold-border-bright)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-paid">
                  {lang === 'te' ? 'రాబోయే సమావేశం' : 'Next Meeting'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-300)' }}>
                  {upcomingMeeting.meeting_date} @ 7:30 PM
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#fef3c7', margin: '0 0 0.5rem 0' }}>
                {lang === 'te' && upcomingMeeting.title_te ? upcomingMeeting.title_te : upcomingMeeting.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', whiteSpace: 'pre-line', marginBottom: '1rem', lineHeight: 1.4 }}>
                {lang === 'te' && upcomingMeeting.agenda_te ? upcomingMeeting.agenda_te : upcomingMeeting.agenda}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gold-border)', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📍 {lang === 'te' ? upcomingMeeting.venue_te || upcomingMeeting.venue : upcomingMeeting.venue}
                </div>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `🛕 *శ్రీ లంబోదర వినాయక కమిటీ సమావేశ ఆహ్వానం* 🛕\nతేదీ: *${upcomingMeeting.meeting_date}* (రాత్రి 7:30 గంటలకు)\nవేదిక: *${upcomingMeeting.venue_te || upcomingMeeting.venue}*\nసభ్యులందరూ సకాలంలో విచ్చేయగలరు.`
                    );
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="btn btn-whatsapp btn-sm"
                >
                  <Share2 size={14} />
                  <span>{t('whatsappNotice')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Committee Announcements Ticker */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-200)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} color="#fbbf24" />
              <span>{t('announcementsTitle')}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcements && announcements.slice(0, 3).map(ann => (
                <div
                  key={ann.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderLeft: ann.priority === 'High' ? '3px solid #f87171' : '3px solid #fbbf24',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0 8px 8px 0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef3c7' }}>
                      {lang === 'te' && ann.title_te ? ann.title_te : ann.title}
                    </span>
                    <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>
                      {ann.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35 }}>
                    {lang === 'te' && ann.message_te ? ann.message_te : ann.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
