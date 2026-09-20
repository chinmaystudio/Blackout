import '../styles/blackout-nav-cards.css';

interface BlackoutNavCardsProps {
  onEnterStory?: () => void;
  onOpenDetails?: () => void;
  onRegister: () => void;
  variant?: 'hero' | 'finale';
}

/**
 * BlackoutNavCards
 * Three Fallout-inspired retro-futuristic navigation cards modeled directly
 * after the master UI dossier reference design.
 *
 * 1. ENTER THE STORY (ARCHIVE // 01) -> EXPLORE. INVESTIGATE. UNCOVER. (Display card - no redirect)
 * 2. EVENT DETAILS (DOSSIER // 02) -> TIMELINE. RULES. MISSION BRIEF. (Display card - no redirect)
 * 3. REGISTER (SQUAD (2–4) // 03) -> ENLIST CELL. BEGIN MISSION. (Redirects to squad enlistment)
 */
export default function BlackoutNavCards({
  onRegister,
  variant = 'hero',
}: BlackoutNavCardsProps) {
  const idPrefix = variant === 'finale' ? 'finale' : 'hero';

  return (
    <nav className="blackout-nav-cards" aria-label="Mission Navigation">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CARD 1: ENTER THE STORY (ARCHIVE // 01)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="blackout-nav-card-wrap blackout-nav-card-wrap--story">
        <button
          type="button"
          className="blackout-nav-card"
          id={`${idPrefix}-nav-enter-story`}
          aria-label="Enter the Story: Archive 01"
        >
          <div className="blackout-nav-card__glint" />

          {/* Top Header */}
          <div className="blackout-nav-card__header">
            <span className="blackout-nav-card__top-icon blackout-nav-card__top-icon--amber" aria-hidden="true">
              ☢
            </span>
            <span className="blackout-nav-card__top-tag">// 01</span>
          </div>

          {/* Artwork Display Window */}
          <div className="blackout-nav-card__art-window">
            <img
              src="/assets/branding/nav-art-story.png"
              alt="Wasteland Vault Portal"
              className="blackout-nav-card__art-img"
              draggable={false}
            />
            <div className="blackout-nav-card__art-overlay" />
          </div>

          {/* Content Body */}
          <div className="blackout-nav-card__content">
            <div className="blackout-nav-card__sub-badge blackout-nav-card__sub-badge--story">
              <span className="blackout-nav-card__dot blackout-nav-card__dot--square" />
              <span>ARCHIVE // 01</span>
            </div>

            <h3 className="blackout-nav-card__title">
              ENTER<br />THE STORY
            </h3>

            <div className="blackout-nav-card__action-row">
              <div className="blackout-nav-card__support-lines">
                <span>EXPLORE.</span>
                <span>INVESTIGATE.</span>
                <span>UNCOVER.</span>
              </div>

              <div className="blackout-nav-card__circle-btn blackout-nav-card__circle-btn--amber" aria-hidden="true">
                <span className="blackout-nav-card__circle-arrow">→</span>
              </div>
            </div>

            {/* Bottom Trim */}
            <div className="blackout-nav-card__trim">
              <div className="blackout-nav-card__barcode" aria-hidden="true" />
              <span>01</span>
            </div>
          </div>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CARD 2: EVENT DETAILS (DOSSIER // 02)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="blackout-nav-card-wrap blackout-nav-card-wrap--details">
        <button
          type="button"
          className="blackout-nav-card"
          id={`${idPrefix}-nav-event-details`}
          aria-label="Event Details: Dossier 02"
        >
          <div className="blackout-nav-card__glint" />

          {/* Top Header */}
          <div className="blackout-nav-card__header">
            <span className="blackout-nav-card__top-icon blackout-nav-card__top-icon--green" aria-hidden="true">
              📄
            </span>
            <span className="blackout-nav-card__top-tag">// 02</span>
          </div>

          {/* Artwork Display Window */}
          <div className="blackout-nav-card__art-window">
            <img
              src="/assets/branding/nav-art-details.png"
              alt="Classified Mission Dossier"
              className="blackout-nav-card__art-img"
              draggable={false}
            />
            <div className="blackout-nav-card__art-overlay" />
          </div>

          {/* Content Body */}
          <div className="blackout-nav-card__content">
            <div className="blackout-nav-card__sub-badge blackout-nav-card__sub-badge--details">
              <span className="blackout-nav-card__dot blackout-nav-card__dot--circle-green" />
              <span>DOSSIER // 02</span>
            </div>

            <h3 className="blackout-nav-card__title">
              EVENT<br />DETAILS
            </h3>

            <div className="blackout-nav-card__action-row">
              <div className="blackout-nav-card__support-lines">
                <span>TIMELINE.</span>
                <span>RULES.</span>
                <span>MISSION BRIEF.</span>
              </div>

              <div className="blackout-nav-card__circle-btn blackout-nav-card__circle-btn--steel" aria-hidden="true">
                <span className="blackout-nav-card__circle-arrow">→</span>
              </div>
            </div>

            {/* Bottom Trim */}
            <div className="blackout-nav-card__trim">
              <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>SPEC // PCCOE</span>
              <span>02</span>
            </div>
          </div>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CARD 3: REGISTER (SQUAD (2–4) // 03)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="blackout-nav-card-wrap blackout-nav-card-wrap--register">
        <button
          type="button"
          className="blackout-nav-card"
          onClick={onRegister}
          id={`${idPrefix}-nav-register`}
          aria-label="Register Squad: Squad 2 to 4, 03"
        >
          <div className="blackout-nav-card__glint" />

          {/* Top Header */}
          <div className="blackout-nav-card__header">
            <span className="blackout-nav-card__top-icon blackout-nav-card__top-icon--amber" aria-hidden="true">
              👥
            </span>
            <span className="blackout-nav-card__top-tag">// 03</span>
          </div>

          {/* Artwork Display Window */}
          <div className="blackout-nav-card__art-window">
            <img
              src="/assets/branding/nav-art-register.png"
              alt="Reinforced Squad Deployment Crate"
              className="blackout-nav-card__art-img"
              draggable={false}
            />
            <div className="blackout-nav-card__art-overlay" />
          </div>

          {/* Content Body */}
          <div className="blackout-nav-card__content">
            <div className="blackout-nav-card__sub-badge blackout-nav-card__sub-badge--register">
              <span className="blackout-nav-card__dot blackout-nav-card__dot--circle-amber" />
              <span>SQUAD (2–4) // 03</span>
            </div>

            <h3 className="blackout-nav-card__title">
              REGISTER
            </h3>

            <div className="blackout-nav-card__action-row">
              <div className="blackout-nav-card__support-lines">
                <span>ENLIST CELL.</span>
                <span>BEGIN MISSION.</span>
              </div>

              <div className="blackout-nav-card__circle-btn blackout-nav-card__circle-btn--amber" aria-hidden="true">
                <span className="blackout-nav-card__circle-arrow">→</span>
              </div>
            </div>

            {/* Bottom Trim */}
            <div className="blackout-nav-card__trim">
              <div className="blackout-nav-card__hazard-strip" aria-hidden="true" />
              <span>03</span>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}
