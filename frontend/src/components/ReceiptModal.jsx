import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Printer, Share2, X, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ receiptData, onClose }) {
  const { lang, t } = useLanguage();

  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛕 *శ్రీ లంబోదర వినాయక కమిటీ - అధికారిక రసీదు* 🛕\n\nరసీదు సంఖ్య: *${receiptData.receipt_number}*\nసభ్యుడు: *${receiptData.full_name_te || receiptData.full_name}* (${receiptData.member_code})\nమొత్తం: *₹${receiptData.amount}*\nవిధానం: *${receiptData.payment_mode}* ${receiptData.upi_ref ? `(${receiptData.upi_ref})` : ''}\nతేదీ: *${receiptData.payment_date}*\nస్వీకరించినవారు: *${receiptData.received_by}*\n\nమీ సహకారానికి ధన్యవాదాలు. గణపతి అనుగ్రహం మీకు సదా ఉండుగాక!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', background: '#17100b' }}>
        
        {/* Modal Action Bar (no-print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#fbbf24" />
            <span style={{ fontWeight: 700, color: 'var(--gold-200)', fontSize: '1.05rem' }}>
              {t('viewReceipt')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button id="receipt-print-btn" onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={15} />
              <span>{t('printReceipt')}</span>
            </button>
            <button id="receipt-whatsapp-btn" onClick={shareWhatsApp} className="btn btn-whatsapp btn-sm">
              <Share2 size={15} />
              <span>WhatsApp</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt */}
        <div id="printable-receipt" style={{ padding: '2rem', background: '#1c130d', color: '#fef3c7', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: '1px solid var(--gold-border)' }}>
          
          {/* Masthead */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed rgba(245, 158, 11, 0.4)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '28px', marginBottom: '0.3rem' }}>🛕</div>
            <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', margin: '0 0 0.25rem 0', fontWeight: 800 }}>
              {lang === 'te' ? 'శ్రీ లంబోదర వినాయక కమిటీ' : 'Sri Lambodara Vinayaka Committee'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#d1bfa7', margin: '0 0 0.25rem 0' }}>
              {lang === 'te' ? 'ఆలయ సేవ & అభివృద్ధి సంక్షేమ సంఘం (రిజి. సంఖ్య: REG/SLV/2023/881)' : 'Temple Seva & Welfare Trust (Regd: REG/SLV/2023/881)'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#a8947f', margin: 0 }}>
              Main Temple Road, Ganesh Nagar • Tel: +91 98480 12345
            </p>
            <div style={{ marginTop: '0.8rem', display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #fbbf24', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#fde68a' }}>
              {lang === 'te' ? 'అధికారిక విరాళ / చందా రసీదు' : 'OFFICIAL PAYMENT RECEIPT'}
            </div>
          </div>

          {/* Receipt Info Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div>
              <span style={{ color: '#a8947f' }}>{t('receiptNo')}: </span>
              <strong style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '1rem' }}>{receiptData.receipt_number}</strong>
            </div>
            <div>
              <span style={{ color: '#a8947f' }}>{t('date')}: </span>
              <strong style={{ color: '#fef3c7' }}>{receiptData.payment_date}</strong>
            </div>
          </div>

          {/* Member Details Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: '#a8947f', fontSize: '0.8rem' }}>{t('member')}:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fef3c7' }}>
                {receiptData.full_name}
              </div>
              {receiptData.full_name_te && (
                <div style={{ fontSize: '0.95rem', color: '#fde68a' }}>
                  {receiptData.full_name_te}
                </div>
              )}
            </div>
            <div>
              <div style={{ color: '#a8947f', fontSize: '0.8rem' }}>{t('memberId')} & {t('phone')}:</div>
              <div style={{ fontWeight: 600, color: '#fef3c7' }}>
                <span className="badge badge-role" style={{ marginRight: '0.4rem' }}>{receiptData.member_code}</span>
                {receiptData.phone}
              </div>
            </div>
          </div>

          {/* Payment Amount & Breakdown */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#d1bfa7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {receiptData.fund_code === 'festival' ? (lang === 'te' ? 'వినాయక చవితి ఉత్సవ నిధి' : 'Ganesh Utsav Festival Fund') : (lang === 'te' ? 'నెలవారీ చందా / సాధారణ ఆలయ నిధి' : 'Monthly Member Contribution / General Fund')}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24', margin: '0.3rem 0', fontFamily: 'var(--font-serif)' }}>
              ₹{parseFloat(receiptData.amount).toLocaleString('en-IN')}/-
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', color: '#d1bfa7' }}>
              <span>
                <strong>{t('paymentMode')}:</strong> <span className={receiptData.payment_mode === 'UPI' ? 'badge badge-paid' : 'badge badge-partial'}>{receiptData.payment_mode}</span>
              </span>
              {receiptData.upi_ref && (
                <span>
                  <strong>UTR:</strong> <code style={{ color: '#fbbf24' }}>{receiptData.upi_ref}</code>
                </span>
              )}
            </div>
            {receiptData.remarks && (
              <div style={{ fontSize: '0.825rem', color: '#a8947f', marginTop: '0.5rem', fontStyle: 'italic' }}>
                "{receiptData.remarks}"
              </div>
            )}
          </div>

          {/* Signature & Verification Seal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '45px', height: '45px', border: '1px solid var(--gold-400)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', fontSize: '20px' }}>
                🏁
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a8947f' }}>
                <div style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CheckCircle size={12} /> {lang === 'te' ? 'డిజిటల్ వెరిఫైడ్' : 'Digitally Verified'}
                </div>
                <div>SLV Committee Cloud Portal</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fef3c7', fontStyle: 'italic' }}>
                {receiptData.received_by || 'V. Sreenivasulu (Treasurer)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a8947f', borderTop: '1px solid #a8947f', paddingTop: '2px', marginTop: '4px' }}>
                {lang === 'te' ? 'అధికారిక స్వీకర్త సంతకం' : 'Authorized Signatory'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
