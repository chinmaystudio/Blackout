import { useState } from 'react';
import {
  submitRegistration,
  isAppwriteConfigured,
  type TeamMember,
  type RegistrationData,
} from '../lib/appwrite';
import '../styles/registration.css';

interface RegistrationPageProps {
  onReturnToStory: () => void;
}

export default function RegistrationPage({ onReturnToStory }: RegistrationPageProps) {
  // Squad composition: Strictly 2, 3, or 4 operatives (No solo operatives allowed)
  const [squadSize, setSquadSize] = useState<number>(2);

  // Core Fields
  const [cellName, setCellName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCollege, setLeadCollege] = useState('PCCOE Pune');

  // Squad Companion Roster (Operatives 02, 03, 04)
  const [companions, setCompanions] = useState<TeamMember[]>([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ]);

  // Anti-bot security honeypot
  const [honeypot, setHoneypot] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [clearanceSuccess, setClearanceSuccess] = useState<{
    token: string;
    cellName: string;
    leadName: string;
    totalOperatives: number;
    college: string;
    timestamp: string;
    offlineMode?: boolean;
  } | null>(null);

  const handleCompanionChange = (idx: number, field: keyof TeamMember, val: string) => {
    const updated = [...companions];
    updated[idx] = { ...updated[idx], [field]: val };
    setCompanions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setIsSubmitting(true);

    try {
      // Companion count is (squadSize - 1)
      const activeMembers = companions.slice(0, squadSize - 1);

      // Validate companion inputs
      for (let i = 0; i < activeMembers.length; i++) {
        if (!activeMembers[i].name.trim() || !activeMembers[i].email.trim()) {
          throw new Error(`ROSTER INCOMPLETE // Operative 0${i + 2} name and email are required.`);
        }
      }

      const payload: RegistrationData = {
        cellName,
        faction: 'Unassigned', // Faction removed from UI; defaulted for schema compatibility
        leadName,
        leadEmail,
        leadPhone,
        leadCollege,
        teamSize: squadSize,
        members: activeMembers,
        specialization: 'Vanguard',
        experienceTier: 'Operative',
        emergencyProtocolAccepted: true,
      };

      const result = await submitRegistration(payload, honeypot);

      setClearanceSuccess({
        token: result.clearanceToken,
        cellName: cellName.toUpperCase(),
        leadName: leadName.toUpperCase(),
        totalOperatives: squadSize,
        college: leadCollege,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offlineMode: result.offlineMode,
      });
    } catch (err: any) {
      setErrorBanner(err.message || 'TRANSMISSION ANOMALY // Submission interrupted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-page__vignette" />

      {/* Top Header Navigation Bar */}
      <nav className="reg-nav">
        <button type="button" className="reg-nav__back" onClick={onReturnToStory}>
          <span>&lt;&lt;</span> RETURN TO STORY
        </button>
        <div className="reg-nav__tag">
          <span className="reg-nav__led" />
          <span>DIRECTIVE AFTERLIGHT</span>
        </div>
      </nav>

      {/* Form or Clearance Dossier */}
      <main className="reg-card">
        {clearanceSuccess ? (
          /* Minimalist Tactical Clearance Pass */
          <div className="reg-clearance-wrap">
            <div className="reg-clearance-badge">
              <div className="reg-clearance-top">
                <span className="reg-clearance-label">GDGC // DEFENSE CORPS</span>
                <span className="reg-clearance-status">CLEARANCE AUTHORIZED</span>
              </div>

              <div className="reg-clearance-label">PROJECTED CLEARANCE ID</div>
              <div className="reg-clearance-token">{clearanceSuccess.token}</div>

              <div className="reg-clearance-grid">
                <div>
                  <span className="reg-clearance-key">CALL SIGN</span>
                  <span className="reg-clearance-val">{clearanceSuccess.cellName}</span>
                </div>
                <div>
                  <span className="reg-clearance-key">LEAD OPERATIVE</span>
                  <span className="reg-clearance-val">{clearanceSuccess.leadName}</span>
                </div>
                <div>
                  <span className="reg-clearance-key">SQUAD COMPOSITION</span>
                  <span className="reg-clearance-val">{clearanceSuccess.totalOperatives} Operatives</span>
                </div>
                <div>
                  <span className="reg-clearance-key">INSTITUTION</span>
                  <span className="reg-clearance-val">{clearanceSuccess.college}</span>
                </div>
              </div>

              <div className="reg-clearance-barcode" />

              <div className="reg-clearance-footer">
                <span>SECTOR 9 // HELIOS DIRECTIVE</span>
                <span>CRYPTOGRAPHIC PROTOCOL 2.0</span>
              </div>
            </div>

            <div className="reg-clearance-btns">
              <button
                type="button"
                className="reg-btn-submit"
                onClick={() => window.print()}
                style={{ margin: 0 }}
              >
                PRINT / SAVE PASS
              </button>
              <button
                type="button"
                className="reg-nav__back"
                onClick={onReturnToStory}
                style={{ justifyContent: 'center', minHeight: '52px', width: '100%' }}
              >
                RETURN TO STORY
              </button>
            </div>
          </div>
        ) : (
          /* Minimalist Registration Form */
          <div>
            <header className="reg-banner">
              <h1 className="reg-banner__title">
                BLACK<span className="reg-banner__hazard-symbol">☢</span>UT
              </h1>
              <div className="reg-banner__rule-text">RECOVERY CELL REGISTRATION</div>
              <p className="reg-banner__sub">
                REGISTER YOUR SQUAD (2 TO 4 OPERATIVES) FOR THE 12-HOUR ALTERNATE-REALITY INVESTIGATION &amp; HACKATHON.
              </p>
              <div className="reg-banner__hazard">☢</div>
            </header>

            {/* Error Notification */}
            {errorBanner && (
              <div className="reg-error-box">
                {errorBanner}
              </div>
            )}

            <form onSubmit={handleSubmit} className="reg-form">
              {/* Squad Composition Selector (Strictly 2, 3, or 4 - No Solo Operatives) */}
              <div className="reg-group">
                <label className="reg-label">
                  <span>Squad Composition <span className="req">*</span></span>
                  <span className="hint">(2 to 4 Operatives)</span>
                </label>
                <div className="reg-team-size-row">
                  {[2, 3, 4].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`reg-size-pill ${squadSize === size ? 'reg-size-pill--active' : ''}`}
                      onClick={() => setSquadSize(size)}
                    >
                      {size} Operatives
                    </button>
                  ))}
                </div>
              </div>

              {/* Cell Call Sign (Team Name) */}
              <div className="reg-group">
                <label className="reg-label">
                  <span>Recovery Cell Call Sign (Team Name) <span className="req">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={cellName}
                  onChange={(e) => setCellName(e.target.value)}
                  placeholder="e.g. Apex Protocol, Vault-88, Echo Seven"
                  className="reg-input"
                  autoComplete="off"
                />
              </div>

              {/* Lead Operative Name */}
              <div className="reg-group">
                <label className="reg-label">
                  <span>Lead Operative Full Name <span className="req">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Commander / Lead Name"
                  className="reg-input"
                  autoComplete="name"
                />
              </div>

              {/* Lead Comms Row */}
              <div className="reg-group--grid">
                <div className="reg-group">
                  <label className="reg-label">
                    <span>Comms Email <span className="req">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="lead@college.edu"
                    className="reg-input"
                    autoComplete="email"
                  />
                </div>

                <div className="reg-group">
                  <label className="reg-label">
                    <span>Phone / WhatsApp <span className="req">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="reg-input"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Institution / College */}
              <div className="reg-group">
                <label className="reg-label">
                  <span>Institution / College <span className="req">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={leadCollege}
                  onChange={(e) => setLeadCollege(e.target.value)}
                  placeholder="e.g. PCCOE Pune"
                  className="reg-input"
                />
              </div>

              {/* Companion Roster (Operatives 02, 03, 04 based on squad size) */}
              <div className="reg-teammates">
                <div className="reg-teammates__header">
                  <span>SQUAD ROSTER // COMPANIONS</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.62rem', fontWeight: 'normal' }}>
                    {squadSize - 1} Teammate{squadSize > 2 ? 's' : ''} Required
                  </span>
                </div>

                {Array.from({ length: squadSize - 1 }).map((_, idx) => (
                  <div key={idx} className="reg-teammate-card">
                    <span className="reg-teammate-card__title">
                      Operative 0{idx + 2} Details
                    </span>
                    <div className="reg-teammate-card__grid">
                      <input
                        type="text"
                        required
                        value={companions[idx]?.name || ''}
                        onChange={(e) => handleCompanionChange(idx, 'name', e.target.value)}
                        placeholder={`Operative 0${idx + 2} Full Name *`}
                        className="reg-input"
                      />
                      <input
                        type="email"
                        required
                        value={companions[idx]?.email || ''}
                        onChange={(e) => handleCompanionChange(idx, 'email', e.target.value)}
                        placeholder={`Operative 0${idx + 2} Email *`}
                        className="reg-input"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Anti-Bot Honeypot Field */}
              <input
                type="text"
                name="cell_auth_trap_shield"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Transmit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="reg-btn-submit"
              >
                {isSubmitting
                  ? 'TRANSMITTING ENLISTMENT TO HELIOS...'
                  : 'TRANSMIT SQUAD ENLISTMENT >>'}
              </button>

              <div className="reg-status-note">
                {isAppwriteConfigured()
                  ? 'COMMUNICATION LINK: APWRITE CLOUD ACTIVE'
                  : 'SECURE ENLISTMENT PROTOCOL // HELIOS DEFENSE NETWORK'}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
