import { useEffect } from 'react';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export default function EventDetailsModal({ isOpen, onClose, onRegister }: EventDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="event-modal__backdrop" onClick={onClose}>
      <div className="event-modal__window" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal__scanlines" />
        
        {/* Header */}
        <div className="event-modal__header">
          <div className="event-modal__title-group">
            <span className="event-modal__badge">GDGC // MISSION DOSSIER</span>
            <h2 className="event-modal__heading">BLACKOUT: FALLOUT // PROJECT AFTERLIGHT</h2>
            <p className="event-modal__subheading">12-HOUR FORENSIC INVESTIGATION & SURVIVAL SENTINEL HACKATHON</p>
          </div>
          <button type="button" className="event-modal__close-btn" onClick={onClose} title="Close dossier">
            [ESC // CLOSE]
          </button>
        </div>

        {/* Content Body */}
        <div className="event-modal__body">
          {/* Executive Brief */}
          <div className="event-modal__section">
            <h3 className="event-modal__section-title">01 // INCIDENT OVERVIEW</h3>
            <p className="event-modal__text">
              At 11:47 PM, the citywide power grid and emergency frequencies were severed simultaneously. 
              Carrier-88 broadcasted a final transmission: <em>"HELIOS FAILURE CONFIRMED"</em>. Exactly 12 minutes later, 
              the sky turned white—a nuclear detonation rocked the Sector 9 perimeter.
            </p>
            <div className="event-modal__quote">
              "The bomb ended the old world. The breach will decide the new one."
            </div>
            <p className="event-modal__text">
              Collegiate developer teams enter as <strong>Recovery Cells</strong> to investigate the central forensic anomaly: 
              <strong> Why was civilization's infrastructure deliberately killed before the blast?</strong>
            </p>
          </div>

          {/* Factions */}
          <div className="event-modal__section">
            <h3 className="event-modal__section-title">02 // SURVIVOR FACTIONS</h3>
            <div className="event-modal__grid">
              <div className="event-modal__card">
                <div className="event-modal__card-header event-modal__card-header--citadel">
                  THE CITADEL
                </div>
                <p className="event-modal__card-motto">“Order is the only thing standing between us and extinction.”</p>
                <p className="event-modal__card-desc">Centralized recovery, automated machine surveillance, and decisive resource rationing.</p>
              </div>

              <div className="event-modal__card">
                <div className="event-modal__card-header event-modal__card-header--freeborn">
                  THE FREEBORN
                </div>
                <p className="event-modal__card-motto">“No machine should ever decide who gets to survive.”</p>
                <p className="event-modal__card-desc">Decentralized human autonomy, community sovereignty, and complete decommission of HELIOS.</p>
              </div>

              <div className="event-modal__card">
                <div className="event-modal__card-header event-modal__card-header--afterlight">
                  THE AFTERLIGHT
                </div>
                <p className="event-modal__card-motto">“Human oversight over automated survival continuity.”</p>
                <p className="event-modal__card-desc">Hybrid oversight model retaining essential life-support telemetry with human verification.</p>
              </div>
            </div>
          </div>

          {/* Hackathon Specs */}
          <div className="event-modal__section">
            <h3 className="event-modal__section-title">03 // OPERATIONAL TIMELINE & CHALLENGES</h3>
            <div className="event-modal__levels">
              <div className="event-modal__level-item">
                <span className="event-modal__level-tag">LVL 0</span>
                <div>
                  <strong>The Grid Gateway</strong>: Console forensic recovery of hidden Base64 emergency callsign.
                </div>
              </div>
              <div className="event-modal__level-item">
                <span className="event-modal__level-tag">LVL 1</span>
                <div>
                  <strong>Carrier-88 Intercept</strong>: Spectral radio audio decoding of the 17-second breaker code.
                </div>
              </div>
              <div className="event-modal__level-item">
                <span className="event-modal__level-tag">LVL 2</span>
                <div>
                  <strong>Subsystem Debugging</strong>: Sandboxed code repair of corrupted Python, JS & SQL life-support routines.
                </div>
              </div>
              <div className="event-modal__level-item">
                <span className="event-modal__level-tag">LVL 3</span>
                <div>
                  <strong>The Afterlight Archive</strong>: Forensic timeline correlation of Dr. Kabir Varma's encrypted logs.
                </div>
              </div>
              <div className="event-modal__level-item">
                <span className="event-modal__level-tag">LVL 4</span>
                <div>
                  <strong>Survival Sentinel Hackathon</strong>: Engineer a resilient shelter telemetry monitoring dashboard.
                </div>
              </div>
            </div>
          </div>

          {/* Rules & Eligibility */}
          <div className="event-modal__section">
            <h3 className="event-modal__section-title">04 // CELL COMPOSITION & REQUIREMENTS</h3>
            <ul className="event-modal__list">
              <li>Teams of 1 to 4 collegiate developers (Recovery Cells).</li>
              <li>Laptops with Git, modern web browsers, and Node/Python environments.</li>
              <li>Zero external hacking permitted: all technical forensics are sandboxed within event infrastructure.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="event-modal__footer">
          <button type="button" className="event-modal__btn event-modal__btn--secondary" onClick={onClose}>
            RETURN TO ARCHIVE
          </button>
          <button
            type="button"
            className="event-modal__btn event-modal__btn--primary"
            onClick={() => {
              onClose();
              onRegister();
            }}
          >
            ENLIST RECOVERY CELL &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
