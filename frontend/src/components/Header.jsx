import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe, User, Shield, ChevronDown, Check, Sparkles, LogOut } from 'lucide-react';

export default function Header({ dbMode }) {
  const { lang, setLang, t } = useLanguage();
  const { user, loginAs, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const rolesList = [
    { id: 'admin', nameEn: 'Admin (Chinna anna)', nameTe: 'అడ్మిన్ (చిన్న అన్న)', user: 'admin' },
    { id: 'treasurer', nameEn: 'Treasurer (Hemanth)', nameTe: 'కోశాధికారి (హేమంత్)', user: 'treasurer' },
    { id: 'secretary', nameEn: 'Secretary (Chandu)', nameTe: 'కార్యదర్శి (చందు)', user: 'secretary' },
    { id: 'member', nameEn: 'Member (Kalyan)', nameTe: 'సభ్యుడు (కళ్యాణ్)', user: 'member' }
  ];

  return (
    <header className="glass-panel" style={{ margin: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--gold-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Sacred Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            className="sacred-glow-badge"
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 50%, #f59e0b 100%)',
              border: '2px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              color: '#fff',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            🛕
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-300)', margin: 0 }}>
                {lang === 'te' ? 'శ్రీ లంబోదర వినాయక కమిటీ' : 'Sri Lambodara Vinayaka Committee'}
              </h1>
              <span className="badge badge-role" style={{ fontSize: '0.7rem' }}>
                {dbMode === 'mysql' ? 'MySQL Connected' : 'Resilient Mode'}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--gold-200)', opacity: 0.85, margin: 0 }}>
              {t('mantra')} • {lang === 'te' ? 'ఆలయ సేవ & సంక్షేమ సంఘం' : 'Temple Seva & Welfare Trust'}
            </p>
          </div>
        </div>

        {/* Right Controls: Language Toggle & Demo Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Language Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', padding: '3px', borderRadius: '30px', border: '1px solid var(--gold-border)' }}>
            <button
              id="lang-btn-te"
              onClick={() => setLang('te')}
              className={`btn btn-sm ${lang === 'te' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            >
              తెలుగు
            </button>
            <button
              id="lang-btn-en"
              onClick={() => setLang('en')}
              className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '25px', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            >
              English
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              id="role-switcher-btn"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#201610', borderColor: 'var(--gold-400)' }}
            >
              <Shield size={16} color="#fbbf24" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
                  {lang === 'te' ? 'పాత్ర:' : 'Role:'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                  {user ? (lang === 'te' ? (user.role === 'admin' ? 'అడ్మిన్' : user.role === 'treasurer' ? 'కోశాధికారి' : user.role === 'secretary' ? 'కార్యదర్శి' : 'సభ్యుడు') : user.role.toUpperCase()) : 'Guest'}
                </span>
              </div>
              <ChevronDown size={14} />
            </button>

            {showRoleDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--gold-border-bright)',
                  borderRadius: 'var(--radius-md)',
                  width: '240px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  padding: '0.5rem',
                  animation: 'fadeIn 0.15s ease'
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--gold-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t('switchRole')} ({t('demoAccounts')})
                </div>
                {rolesList.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      loginAs(r.user);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: user?.role === r.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: user?.role === r.id ? 'var(--gold-300)' : 'var(--text-sub)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textAlign: 'left'
                    }}
                  >
                    <span>{lang === 'te' ? r.nameTe : r.nameEn}</span>
                    {user?.role === r.id && <Check size={16} color="#fbbf24" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
