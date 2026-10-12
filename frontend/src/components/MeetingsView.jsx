import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Share2,
  PlusCircle,
  Edit3,
  X
} from 'lucide-react';

export default function MeetingsView({
  meetings,
  members,
  onRefresh
}) {
  const { lang, t } = useLanguage();
  const { user, authFetch } = useAuth();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);

  // Schedule Meeting State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleTe, setNewTitleTe] = useState('');
  const [newDate, setNewDate] = useState('2026-11-15');
  const [newTime, setNewTime] = useState('19:30:00');
  const [newVenue, setNewVenue] = useState('Sri Lambodara Vinayaka Temple Sabha Hall');
  const [newVenueTe, setNewVenueTe] = useState('శ్రీ లంబోదర వినాయక ఆలయ సభా ప్రాంగణం');
  const [newAgenda, setNewAgenda] = useState('1. Monthly collection review\n2. Temple maintenance works');
  const [newAgendaTe, setNewAgendaTe] = useState('1. నెలవారీ చందాల సేకరణ సమీక్ష\n2. ఆలయ నిర్వహణ పనుల ప్రణాళిక');

  // Minutes & Decisions edit state
  const [minutesText, setMinutesText] = useState('');
  const [minutesTextTe, setMinutesTextTe] = useState('');
  const [decisionsText, setDecisionsText] = useState('');

  const openAttendance = async (meeting) => {
    setSelectedMeeting(meeting);
    try {
      const res = await authFetch(`/api/meetings/${meeting.id}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data.attendance || []);
        setShowAttendanceModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAttendance = async () => {
    try {
      const res = await authFetch(`/api/meetings/${selectedMeeting.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceList })
      });
      if (res.ok) {
        setShowAttendanceModal(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openMinutesModal = (meeting) => {
    setSelectedMeeting(meeting);
    setMinutesText(meeting.minutes || '');
    setMinutesTextTe(meeting.minutes_te || '');
    setDecisionsText(meeting.decisions || '');
    setShowMinutesModal(true);
  };

  const saveMinutes = async () => {
    try {
      const res = await authFetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: minutesText,
          minutes_te: minutesTextTe,
          decisions: decisionsText,
          status: 'Completed'
        })
      });
      if (res.ok) {
        setShowMinutesModal(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          title_te: newTitleTe || newTitle,
          meeting_date: newDate,
          meeting_time: newTime,
          venue: newVenue,
          venue_te: newVenueTe,
          agenda: newAgenda,
          agenda_te: newAgendaTe
        })
      });
      if (res.ok) {
        setShowScheduleModal(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shareMeetingWhatsApp = (meeting) => {
    const text = encodeURIComponent(
      `🛕 *శ్రీ లంబోదర వినాయక కమిటీ సమావేశ ఆహ్వానం* 🛕\n\n*Sri Lambodara Vinayaka Committee Meeting*\n\nతేదీ: *${meeting.meeting_date}* (రాత్రి *${meeting.meeting_time}* గంటలకు)\nవేదిక: *${meeting.venue_te || meeting.venue}*\n\n*ఎజెండా:* \n${meeting.agenda_te || meeting.agenda}\n\nదయచేసి గౌరవ సభ్యులందరూ సకాలంలో హాజరుకాగలరు.\n- కార్యదర్శి, శ్రీ లంబోదర వినాయక కమిటీ`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Header and Controls */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('meetingsTitle')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {lang === 'te'
              ? 'ప్రతి నెలా 15వ తేదీ రాత్రి 7:30 గంటలకు సాధారణ సమావేశం • ఎజెండా, తీర్మానాలు & సభ్యుల హాజరు'
              : 'Monthly meetings scheduled on 15th at 7:30 PM • Agendas, resolutions, and attendance tracking'}
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'secretary') && (
          <button
            id="schedule-meeting-btn"
            onClick={() => setShowScheduleModal(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            <span>{t('scheduleMeeting')}</span>
          </button>
        )}
      </div>

      {/* Meetings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {meetings && meetings.map(meeting => (
          <div key={meeting.id} className="card" style={{ borderLeft: meeting.status === 'Completed' ? '4px solid #34d399' : '4px solid #fbbf24' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={meeting.status === 'Completed' ? 'badge badge-paid' : 'badge badge-partial'}>
                    {meeting.status === 'Completed' ? t('completed') : t('scheduled')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ID: #{meeting.id}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#fef3c7', margin: 0 }}>
                  {lang === 'te' && meeting.title_te ? meeting.title_te : meeting.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openAttendance(meeting)}
                  className="btn btn-secondary btn-sm"
                >
                  <Users size={14} />
                  <span>{t('attendance')} ({meeting.attendanceStats?.present || 0} / {meeting.attendanceStats?.total || members.length})</span>
                </button>

                {(user?.role === 'admin' || user?.role === 'secretary') && (
                  <button
                    onClick={() => openMinutesModal(meeting)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit3 size={14} />
                    <span>{t('minutes')}</span>
                  </button>
                )}

                <button
                  onClick={() => shareMeetingWhatsApp(meeting)}
                  className="btn btn-whatsapp btn-sm"
                >
                  <Share2 size={14} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Date, Time & Venue */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--gold-200)', background: 'rgba(0,0,0,0.2)', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="#fbbf24" />
                <span>{meeting.meeting_date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="#fbbf24" />
                <span>{meeting.meeting_time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} color="#fbbf24" />
                <span>{lang === 'te' && meeting.venue_te ? meeting.venue_te : meeting.venue}</span>
              </div>
            </div>

            {/* Agenda */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--gold-300)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                {t('agenda')}:
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', whiteSpace: 'pre-line', lineHeight: 1.5, margin: 0 }}>
                {lang === 'te' && meeting.agenda_te ? meeting.agenda_te : meeting.agenda}
              </p>
            </div>

            {/* Minutes & Decisions if completed */}
            {meeting.minutes && (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  {t('minutes')} & {t('decisions')}:
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: 1.45, margin: 0 }}>
                  {lang === 'te' && meeting.minutes_te ? meeting.minutes_te : meeting.minutes}
                </p>
                {meeting.decisions && (
                  <div style={{ marginTop: '0.6rem', borderTop: '1px dashed rgba(16, 185, 129, 0.2)', paddingTop: '0.5rem', fontSize: '0.85rem', color: '#6ee7b7' }}>
                    <strong>{t('decisions')}:</strong> {meeting.decisions}
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedMeeting && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-dialog modal-dialog-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                {t('attendance')}: {lang === 'te' && selectedMeeting.title_te ? selectedMeeting.title_te : selectedMeeting.title}
              </span>
              <button onClick={() => setShowAttendanceModal(false)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>{t('member')}</th>
                      <th>{t('designation')}</th>
                      <th>{t('attendance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList.map((item, idx) => (
                      <tr key={item.member_id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fef3c7' }}>
                            {lang === 'te' && item.full_name_te ? item.full_name_te : item.full_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.member_code}</div>
                        </td>
                        <td>{item.designation}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {['Present', 'Absent', 'Excused'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  const updated = [...attendanceList];
                                  updated[idx] = { ...updated[idx], status: st };
                                  setAttendanceList(updated);
                                }}
                                className="btn btn-sm"
                                style={{
                                  padding: '0.2rem 0.55rem',
                                  fontSize: '0.75rem',
                                  background: item.status === st ? (st === 'Present' ? '#10b981' : st === 'Absent' ? '#ef4444' : '#f59e0b') : 'rgba(255,255,255,0.05)',
                                  color: item.status === st ? '#fff' : 'var(--text-muted)'
                                }}
                              >
                                {st === 'Present' ? t('present') : st === 'Absent' ? t('absent') : t('excused')}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowAttendanceModal(false)} className="btn btn-secondary">
                {t('cancel')}
              </button>
              {(user?.role === 'admin' || user?.role === 'secretary') && (
                <button onClick={saveAttendance} className="btn btn-primary">
                  {t('save')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleScheduleMeeting}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('scheduleMeeting')}
                </span>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t('meetingsTitle')} (EN)*</label>
                  <input
                    type="text"
                    required
                    placeholder="November 2026 Monthly Committee Meeting"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('meetingsTitle')} (TE)</label>
                  <input
                    type="text"
                    placeholder="నవంబర్ 2026 నెలవారీ కమిటీ సమావేశం"
                    value={newTitleTe}
                    onChange={e => setNewTitleTe(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('meetingDate')}* (15th)</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('meetingTime')}* (7:30 PM)</label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('venue')}</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={e => setNewVenue(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('agenda')}</label>
                  <textarea
                    rows={3}
                    value={newAgenda}
                    onChange={e => setNewAgenda(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary">
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

      {/* Record Minutes Modal */}
      {showMinutesModal && selectedMeeting && (
        <div className="modal-overlay" onClick={() => setShowMinutesModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                {t('minutes')} & {t('decisions')}
              </span>
              <button onClick={() => setShowMinutesModal(false)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('minutes')} (English)</label>
                <textarea
                  rows={4}
                  value={minutesText}
                  onChange={e => setMinutesText(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('minutes')} (తెలుగు)</label>
                <textarea
                  rows={4}
                  value={minutesTextTe}
                  onChange={e => setMinutesTextTe(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('decisions')}</label>
                <textarea
                  rows={3}
                  value={decisionsText}
                  onChange={e => setDecisionsText(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowMinutesModal(false)} className="btn btn-secondary">
                {t('cancel')}
              </button>
              <button onClick={saveMinutes} className="btn btn-primary">
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
