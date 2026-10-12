import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Share2,
  Receipt,
  CheckCircle,
  XCircle,
  ListPlus,
  X
} from 'lucide-react';

export default function MembersView({
  members,
  onRefresh,
  onOpenReceipt,
  onSendWhatsAppReminder
}) {
  const { lang, t } = useLanguage();
  const { user, authFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New member form
  const [formName, setFormName] = useState('');
  const [formNameTe, setFormNameTe] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDesignation, setFormDesignation] = useState('Member');
  const [formDesignationTe, setFormDesignationTe] = useState('సభ్యుడు');
  const [formAddress, setFormAddress] = useState('');

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.full_name_te && m.full_name_te.includes(search)) ||
      m.member_code.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openMemberProfile = async (member) => {
    setSelectedMember(member);
    setLoadingDetails(true);
    try {
      const res = await authFetch(`/api/members/${member.id}`);
      if (res.ok) {
        const data = await res.json();
        setMemberDetails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    try {
      const res = await authFetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formName,
          full_name_te: formNameTe || formName,
          phone: formPhone,
          email: formEmail,
          designation: formDesignation,
          designation_te: formDesignationTe,
          address: formAddress,
          status: 'active'
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormName('');
        setFormNameTe('');
        setFormPhone('');
        setFormEmail('');
        setFormAddress('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding member:', err);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkNames.trim()) return;
    setBulkLoading(true);
    try {
      const res = await authFetch('/api/members/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namesText: bulkNames, generateDues: true })
      });
      if (res.ok) {
        setShowBulkModal(false);
        setBulkNames('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error importing members:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '0 1rem 2rem' }}>
      
      {/* Header & Search Toolbar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--gold-200)', margin: '0 0 0.25rem 0' }}>
            {t('memberDirectory')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0 }}>
            {lang === 'te'
              ? 'మొత్తం రిజిస్టర్ అయిన ఆలయ కమిటీ సభ్యులు & వారి చందా సమాచారం'
              : 'Registered committee members, contact details, and contribution records'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="#d1bfa7" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              id="member-search-input"
              type="text"
              placeholder={t('searchMembers')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', height: '36px', padding: '0 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>

          {user?.role === 'admin' && (
            <>
              <button
                id="bulk-add-members-btn"
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ height: '36px' }}
              >
                <ListPlus size={16} />
                <span>{lang === 'te' ? 'సభ్యుల పేర్లు నమోదు' : 'Bulk Import'}</span>
              </button>
              <button
                id="add-member-btn"
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-sm"
                style={{ height: '36px' }}
              >
                <UserPlus size={16} />
                <span>{t('addMember')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Members Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-role">{member.member_code}</span>
                <span className={member.status === 'active' ? 'badge badge-active' : 'badge badge-pending'}>
                  {member.status === 'active' ? t('active') : t('inactive')}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#fef3c7', margin: '0 0 0.15rem 0' }}>
                {member.full_name}
              </h3>
              {member.full_name_te && (
                <div style={{ fontSize: '1rem', color: '#fbbf24', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {member.full_name_te}
                </div>
              )}

              <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#fde68a', marginBottom: '0.75rem' }}>
                {lang === 'te' && member.designation_te ? member.designation_te : member.designation}
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} color="#fbbf24" />
                  <span>{member.phone}</span>
                </div>
                {member.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} color="#a8947f" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.2rem', borderTop: '1px solid var(--gold-border)', paddingTop: '0.85rem' }}>
              <button
                onClick={() => openMemberProfile(member)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                {t('viewDetails')}
              </button>
              <button
                onClick={() => onSendWhatsAppReminder(member)}
                className="btn btn-whatsapp btn-sm"
                title="Send WhatsApp Reminder"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Profile Drawer Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-dialog modal-dialog-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={20} color="#fbbf24" />
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('memberProfile')} - {selectedMember.member_code}
                </span>
              </div>
              <button onClick={() => setSelectedMember(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Member Card Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#fbbf24', margin: '0 0 0.2rem 0' }}>
                    {selectedMember.full_name}
                  </h3>
                  {selectedMember.full_name_te && (
                    <div style={{ fontSize: '1.05rem', color: '#fde68a', marginBottom: '0.4rem' }}>
                      {selectedMember.full_name_te}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    {lang === 'te' && selectedMember.designation_te ? selectedMember.designation_te : selectedMember.designation} • 📱 {selectedMember.phone}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{t('collected')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                      ₹{(memberDetails?.summary?.totalPaid || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f87171' }}>{t('pending')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>
                      ₹{(memberDetails?.summary?.totalPending || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History List */}
              <h4 style={{ fontSize: '1rem', color: 'var(--gold-300)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Receipt size={16} />
                <span>{t('paymentHistory')}</span>
              </h4>

              <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>{t('receiptNo')}</th>
                      <th>{t('date')}</th>
                      <th>{t('amount')}</th>
                      <th>{t('paymentMode')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberDetails?.payments && memberDetails.payments.length > 0 ? (
                      memberDetails.payments.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontFamily: 'monospace', color: 'var(--gold-300)' }}>{p.receipt_number}</td>
                          <td>{p.payment_date}</td>
                          <td style={{ fontWeight: 700, color: '#fbbf24' }}>₹{p.amount}</td>
                          <td><span className={p.payment_mode === 'UPI' ? 'badge badge-paid' : 'badge badge-partial'}>{p.payment_mode}</span></td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedMember(null);
                                onOpenReceipt(p);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              {t('viewReceipt')}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          {t('noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            <div className="modal-footer">
              <button
                onClick={() => onSendWhatsAppReminder(selectedMember)}
                className="btn btn-whatsapp"
              >
                <Share2 size={16} />
                <span>{t('sendWhatsAppReminder')}</span>
              </button>
              <button onClick={() => setSelectedMember(null)} className="btn btn-secondary">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateMember}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {t('addMember')}
                </span>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t('memberName')} (English)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Mohan Das"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('memberName')} (తెలుగు)</label>
                  <input
                    type="text"
                    placeholder="e.g. కె. మోహన్ దాస్"
                    value={formNameTe}
                    onChange={e => setFormNameTe(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('phone')}*</label>
                    <input
                      type="tel"
                      required
                      placeholder="9848012345"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('designation')} (EN)</label>
                    <select
                      value={formDesignation}
                      onChange={e => {
                        setFormDesignation(e.target.value);
                        const teMap = {
                          President: 'అధ్యక్షులు',
                          'Vice President': 'ఉపాధ్యక్షులు',
                          Secretary: 'కార్యదర్శి',
                          Treasurer: 'కోశాధికారి',
                          'Executive Member': 'కార్యవర్గ సభ్యుడు',
                          Member: 'సభ్యుడు'
                        };
                        setFormDesignationTe(teMap[e.target.value] || 'సభ్యుడు');
                      }}
                      className="form-control"
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Executive Member">Executive Member</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('designation')} (TE)</label>
                    <input
                      type="text"
                      value={formDesignationTe}
                      onChange={e => setFormDesignationTe(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address / Address Details</label>
                  <textarea
                    rows={2}
                    placeholder="Temple street, Colony details..."
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
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

      {/* Bulk Add Member Names Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-dialog modal-dialog-large" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleBulkImport}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, color: '#fef3c7', fontSize: '1.1rem' }}>
                  {lang === 'te' ? 'సభ్యుల పేర్లు నమోదు (నెల చందా ₹1,000)' : 'Bulk Import Members (Monthly Dues ₹1,000)'}
                </span>
                <button type="button" onClick={() => setShowBulkModal(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                  {lang === 'te'
                    ? 'ప్రతి లైన్లో ఒక సభ్యుని పేరు నమోదు చేయండి (ఉదా: పేరు లేదా పేరు, ఫోన్ నంబర్, హోదా). నమోదు చేసిన సభ్యులందరికీ ఆటోమేటిక్‌గా ₹1,000 చందా రూపొందించబడుతుంది.'
                    : 'Enter or paste member names below (one per line). All registered members will automatically have ₹1,000 monthly dues assigned.'}
                </p>

                <div className="form-group">
                  <label className="form-label">{lang === 'te' ? 'సభ్యుల పేర్ల జాబితా' : 'Members List (One per line)'}*</label>
                  <textarea
                    rows={8}
                    required
                    placeholder={"కె. మోహన్ దాస్\nవి. శ్రీనివాసులు\nఆర్. వెంకటేశ్వర్లు\nపి. రామకృష్ణారావు\n..."}
                    value={bulkNames}
                    onChange={e => setBulkNames(e.target.value)}
                    className="form-control"
                    style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowBulkModal(false)} className="btn btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" disabled={bulkLoading} className="btn btn-primary">
                  {bulkLoading ? 'Saving...' : (lang === 'te' ? 'అందరినీ నమోదు చేయండి' : 'Import All Members')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
