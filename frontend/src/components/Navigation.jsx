import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Users, Calendar, CreditCard, Receipt, PiggyBank, Megaphone } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'members', label: t('navMembers'), icon: Users },
    { id: 'dues', label: t('navDues'), icon: Receipt },
    { id: 'payments', label: t('navPayments'), icon: CreditCard },
    { id: 'meetings', label: t('navMeetings'), icon: Calendar },
    { id: 'finances', label: t('navFinances'), icon: PiggyBank },
    { id: 'announcements', label: t('navAnnouncements'), icon: Megaphone }
  ];

  return (
    <nav style={{ margin: '0 1rem 1.5rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content', padding: '0.25rem 0' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="btn"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.35) 100%)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--gold-200)' : 'var(--text-sub)',
                border: isActive ? '1px solid var(--gold-400)' : '1px solid rgba(245, 158, 11, 0.12)',
                boxShadow: isActive ? '0 0 15px rgba(245, 158, 11, 0.25)' : 'none',
                fontWeight: isActive ? 700 : 500,
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Icon size={18} color={isActive ? '#fbbf24' : '#d1bfa7'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
