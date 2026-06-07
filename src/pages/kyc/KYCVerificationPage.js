import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import toast from 'react-hot-toast';
import {
  Shield, CheckCircle, XCircle, Clock, Upload, Camera, FileText,
  User, ArrowRight, Lock, BadgeCheck, IdCard, Eye
} from 'lucide-react';
import './KYCVerificationPage.css';

const LEVELS = [
  { level: 0, label: 'Unverified', icon: XCircle, color: 'var(--gray-400)' },
  { level: 1, label: 'Basic KYC', icon: Clock, color: '#f6ad55' },
  { level: 2, label: 'Verified', icon: BadgeCheck, color: '#00b96b' },
];

export default function KYCVerificationPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [documentType, setDocumentType] = useState('id_card');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const backFileRef = useRef(null);

  const kycLevel = user?.kyc_level ?? 0;
  const kycStatus = user?.kyc_status || 'unverified';
  const currentLevel = LEVELS[kycLevel] || LEVELS[0];

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const res = await client.get('/auth/kyc/status/');
      const data = res.data?.data;
      setKycData(data);
      if (data?.nin) setNin('');
      if (data?.bvn) setBvn('');
    } catch {}
  };

  const handleFrontImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setFrontImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!nin && !bvn && !frontImage) {
      toast.error('Provide at least NIN, BVN, or a document image');
      return;
    }

    const fd = new FormData();
    if (nin) fd.append('nin', nin.replace(/\s/g, ''));
    if (bvn) fd.append('bvn', bvn.replace(/\s/g, ''));
    if (documentType) fd.append('document_type', documentType);
    if (documentNumber) fd.append('document_number', documentNumber);
    if (frontImage) fd.append('front_image', frontImage);
    if (backImage) fd.append('back_image', backImage);

    setLoading(true);
    try {
      const res = await client.post('/auth/kyc/submit/', fd);
      toast.success('KYC information submitted!', { duration: 6000 });
      await refreshUser();
      await loadKYCStatus();
      setNin('');
      setBvn('');
      setFrontImage(null);
      setBackImage(null);
      setPreview(null);
      setDocumentNumber('');
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error?.message || d?.message || d?.detail || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const levelPercent = (kycLevel / 2) * 100;

  return (
    <div className="kyc-page">
      <div className="page-title">Identity Verification</div>
      <div className="page-subtitle">Complete your KYC to unlock all features</div>

      {/* KYC Level Progress */}
      <div className="kyc-progress-card">
        <div className="kyc-level-header">
          <div className="kyc-level-icon" style={{ background: `${currentLevel.color}20`, color: currentLevel.color }}>
            <currentLevel.icon size={28} />
          </div>
          <div>
            <div className="kyc-level-label">KYC Level {kycLevel}</div>
            <div className="kyc-level-status" style={{ color: currentLevel.color }}>
              {currentLevel.label}
            </div>
          </div>
          {kycLevel >= 2 && (
            <BadgeCheck size={32} color="#00b96b" style={{ marginLeft: 'auto' }} />
          )}
        </div>
        <div className="kyc-track">
          <div className="kyc-track-fill" style={{ width: `${levelPercent}%` }} />
        </div>
        <div className="kyc-track-labels">
          {LEVELS.map((l, i) => (
            <span key={l.level} className={`kyc-track-dot ${kycLevel >= l.level ? 'active' : ''}`}
              style={{ left: `${(i / 2) * 100}%` }}>
              <span className="kyc-track-dot-inner" />
              <span className="kyc-track-dot-label">{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="kyc-grid">
        {/* NIN Section */}
        <div className={`kyc-section ${kycData?.has_nin ? 'done' : ''}`}>
          <div className="kyc-section-header">
            <div className="kyc-section-icon"><IdCard size={20} /></div>
            <div>
              <h3>National Identification Number (NIN)</h3>
              <p>11-digit NIN</p>
            </div>
            {kycData?.has_nin && <CheckCircle size={20} color="#00b96b" />}
          </div>
          {kycData?.has_nin ? (
            <div className="kyc-verified-badge">
              <CheckCircle size={16} /> NIN Verified (••••{kycData.nin})
            </div>
          ) : (
            <div className="kyc-section-body">
              <input className="form-input" value={nin}
                onChange={e => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="Enter your 11-digit NIN" maxLength={11} inputMode="numeric" />
            </div>
          )}
        </div>

        {/* BVN Section */}
        <div className={`kyc-section ${kycData?.has_bvn ? 'done' : ''}`}>
          <div className="kyc-section-header">
            <div className="kyc-section-icon"><Lock size={20} /></div>
            <div>
              <h3>Bank Verification Number (BVN)</h3>
              <p>11-digit BVN</p>
            </div>
            {kycData?.has_bvn && <CheckCircle size={20} color="#00b96b" />}
          </div>
          {kycData?.has_bvn ? (
            <div className="kyc-verified-badge">
              <CheckCircle size={16} /> BVN Verified (••••{kycData.bvn})
            </div>
          ) : (
            <div className="kyc-section-body">
              <input className="form-input" value={bvn}
                onChange={e => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="Enter your 11-digit BVN" maxLength={11} inputMode="numeric" />
            </div>
          )}
        </div>

        {/* Document Upload Section */}
        <div className={`kyc-section ${kycData?.documents?.length ? 'done' : ''}`}>
          <div className="kyc-section-header">
            <div className="kyc-section-icon"><FileText size={20} /></div>
            <div>
              <h3>Identification Document</h3>
              <p>Upload a valid ID (passport, driver's license, ID card)</p>
            </div>
            {kycData?.documents?.length > 0 && <CheckCircle size={20} color="#00b96b" />}
          </div>
          <div className="kyc-section-body">
            <select className="form-input" value={documentType}
              onChange={e => setDocumentType(e.target.value)}>
              <option value="id_card">National ID Card</option>
              <option value="passport">International Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="utility_bill">Utility Bill</option>
              <option value="bank_statement">Bank Statement</option>
            </select>
            <input className="form-input" value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
              placeholder="Document number (optional)" style={{ marginTop: 10 }} />

            {/* Front image upload */}
            <div className="kyc-upload-area" onClick={() => fileRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="preview" className="kyc-upload-preview" />
              ) : (
                <>
                  <Camera size={32} color="var(--gray-400)" />
                  <span>Tap to upload front image</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleFrontImage} />
            </div>

            {/* Back image upload */}
            {documentType !== 'utility_bill' && documentType !== 'bank_statement' && (
              <div className="kyc-upload-area secondary" onClick={() => backFileRef.current?.click()}>
                {backImage ? (
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                    <CheckCircle size={16} /> Back image selected
                  </span>
                ) : (
                  <>
                    <Camera size={20} color="var(--gray-400)" />
                    <span>Upload back image (optional)</span>
                  </>
                )}
                <input ref={backFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => setBackImage(e.target.files?.[0] || null)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button className="btn btn-primary btn-full" style={{ marginTop: 8, padding: 14 }}
        onClick={handleSubmit} disabled={loading || kycLevel >= 2}>
        {loading ? <span className="spinner" /> : kycLevel >= 2 ? (
          <><BadgeCheck size={18} /> Fully Verified</>
        ) : (
          <><Shield size={18} /> Submit for Verification</>
        )}
      </button>

      {/* KYC Benefits */}
      <div className="kyc-benefits">
        <h3>Why Verify Your Identity?</h3>
        <div className="kyc-benefits-grid">
          <div className="kyc-benefit">
            <BadgeCheck size={20} color="#00b96b" />
            <div>
              <strong>Higher Transaction Limits</strong>
              <p>Increase your daily and monthly spending caps</p>
            </div>
          </div>
          <div className="kyc-benefit">
            <Shield size={20} color="#4299e1" />
            <div>
              <strong>Enhanced Security</strong>
              <p>Protect your account with verified identity</p>
            </div>
          </div>
          <div className="kyc-benefit">
            <BadgeCheck size={20} color="#9f7aea" />
            <div>
              <strong>Priority Support</strong>
              <p>Get faster responses from our support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
