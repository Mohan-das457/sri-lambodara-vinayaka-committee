import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import MembersView from './components/MembersView';
import DuesView from './components/DuesView';
import PaymentsView from './components/PaymentsView';
import MeetingsView from './components/MeetingsView';
import FinancesView from './components/FinancesView';
import AnnouncementsView from './components/AnnouncementsView';
import ReceiptModal from './components/ReceiptModal';
import RecordPaymentModal from './components/RecordPaymentModal';
import confetti from 'canvas-confetti';

function MainApp() {
  const { lang, t } = useLanguage();
  const { user, token, authFetch } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dbMode, setDbMode] = useState('local');

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPrefill, setPaymentPrefill] = useState(null);

  const fetchAllData = async () => {
    try {
      const statsRes = await authFetch('/api/stats');
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
        setDbMode(s.dbMode || 'local');
      }

      const memRes = await authFetch('/api/members');
      if (memRes.ok) setMembers(await memRes.json());

      const payRes = await authFetch('/api/payments');
      if (payRes.ok) setPayments(await payRes.json());

      const meetRes = await authFetch('/api/meetings');
      if (meetRes.ok) setMeetings(await meetRes.json());

      const annRes = await authFetch('/api/announcements');
      if (annRes.ok) setAnnouncements(await annRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleOpenPaymentForDue = (due) => {
    setPaymentPrefill(due);
    setPaymentModalOpen(true);
  };

  const handleOpenGeneralPayment = () => {
    setPaymentPrefill(null);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (newPayment) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    fetchAllData();
    setActiveReceipt(newPayment);
  };

  const handleSendWhatsAppReminder = (member) => {
    const text = encodeURIComponent(
      `🛕 *శ్రీ లంబోదర వినాయక కమిటీ* 🛕\n\nనమస్కారం ${member.full_name_te || member.full_name} గారు (${member.member_code}),\n\nఈ నెల చందా బకాయి *₹1,000* ఉంది. దయచేసి PhonePe / GPay లేదా నగదు రూపంలో కోశాధికారి గారికి చెల్లించగలరు.\n\nచెల్లించిన వెంటనే డిజిటల్ రసీదు జారీ చేయబడుతుంది.\n- శ్రీ లంబోదర వినాయక కమిటీ`
    );
    const phone = member.phone ? member.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const upcomingMeeting = meetings.find(m => m.status === 'Scheduled') || meetings[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sacred Top Header */}
      <Header dbMode={dbMode} />

      {/* Navigation Tabs */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Tab View */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentPayments={payments}
            upcomingMeeting={upcomingMeeting}
            announcements={announcements}
            onOpenPaymentModal={handleOpenGeneralPayment}
            onOpenMeetingModal={() => setActiveTab('meetings')}
            onOpenDueGenModal={() => setActiveTab('dues')}
            onViewReceipt={setActiveReceipt}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            members={members}
            onRefresh={fetchAllData}
            onOpenReceipt={setActiveReceipt}
            onSendWhatsAppReminder={handleSendWhatsAppReminder}
          />
        )}

        {activeTab === 'dues' && (
          <DuesView
            onRecordPaymentForDue={handleOpenPaymentForDue}
            onSendWhatsAppReminder={handleSendWhatsAppReminder}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={payments}
            members={members}
            onRecordPayment={handleOpenGeneralPayment}
            onViewReceipt={setActiveReceipt}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsView
            meetings={meetings}
            members={members}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'finances' && (
          <FinancesView
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            onRefresh={fetchAllData}
          />
        )}
      </main>

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receiptData={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        members={members}
        prefillData={paymentPrefill}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--gold-border)', padding: '1.5rem', textAlign: 'center', background: '#0e0906', marginTop: 'auto', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
        <p style={{ margin: '0 0 0.3rem 0', color: '#fbbf24', fontWeight: 600 }}>
          {lang === 'te'
            ? '॥ సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః ॥'
            : '॥ Sarve Bhavantu Sukhinah Sarve Santu Niramayah ॥'}
        </p>
        <p style={{ margin: 0 }}>
          © 2026 Sri Lambodara Vinayaka Committee (శ్రీ లంబోదర వినాయక కమిటీ). All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
