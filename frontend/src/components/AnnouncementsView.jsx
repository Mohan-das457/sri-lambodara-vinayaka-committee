import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  PlusCircle,
  Share2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

export default function AnnouncementsView({
  announcements,
  onRefresh
}) {
  const { lang, t } = useLanguage();
  const { user, authFetch } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [titleTe, setTitleTe] = useState('');
  const [message, setMessage] = useState('');
  const [messageTe, setMessageTe] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Normal');

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          title_te: titleTe || title,
          message,
          message_te: messageTe || message,
          category,
          priority
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setTitleTe('');
        setMessage('');
        setMessageTe('');
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shareAnnouncement = (ann) => {
    const text = encodeURIComponent(
      `🛕 *శ్రీ లంబోదర వినాయక కమిటీ ముఖ్య ప్రకటన* 🛕\n\n*${ann.title_te || ann.title}*\n\n${ann.message_te || ann.message}\n\n- కమిటీ కార్యవర్గం`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Header and Toolbar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('announcementsTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {lang === 'te'
              ? 'ఆలయ ఉత్సవాలు, సమావేశాలు మరియు చందాల సమాచార నోటీసుల బోర్డు'
              : 'Official committee notifications, festival announcements, and circulars'}
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'secretary') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            <span>{t('postAnnouncement')}</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {announcements && announcements.map(ann => (
          <div
            key={ann.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: ann.priority === 'High' ? '4px solid #f87171' : '4px solid #fbbf24'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-role">{ann.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ''}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: '#fef3c7', margin: '0 0 0.4rem 0' }}>
                {lang === 'te' && ann.title_te ? ann.title_te : ann.title}
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.5, margin: '0 0 1rem 0', whiteSpace: 'pre-line' }}>
                {lang === 'te' && ann.message_te ? ann.message_te : ann.message}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gold-border)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => shareAnnouncement(ann)}
                className="btn btn-whatsapp btn-sm"
              >
                <Share2 size={14} />
                <span>WhatsApp షేర్</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Announcement Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('postAnnouncement')}
                </span>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title (English)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Deepavali Pooja Schedule"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Title (తెలుగు)</label>
                  <input
                    type="text"
                    placeholder="ఉదా: దీపావళి విశేష పూజల వివరాలు"
                    value={titleTe}
                    onChange={e => setTitleTe(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="form-control"
                    >
                      <option value="General">General</option>
                      <option value="Festival">Festival (ఉత్సవం)</option>
                      <option value="Meeting">Meeting (సమావేశం)</option>
                      <option value="Dues">Dues (చందాలు)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('priority')}</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="form-control"
                    >
                      <option value="Normal">{t('normal')}</option>
                      <option value="High">{t('high')}</option>
                      <option value="Urgent">{t('urgent')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message (English)*</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">సందేశం (తెలుగు)</label>
                  <textarea
                    rows={3}
                    value={messageTe}
                    onChange={e => setMessageTe(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
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
