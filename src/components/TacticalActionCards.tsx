import '../styles/action-cards.css';

interface TacticalActionCardsProps {
  onEnterStory: () => void;
  onOpenDetails: () => void;
  onRegister: () => void;
  variant?: 'hero' | 'finale';
}

/**
 * TacticalActionCards
 * Creative Wasteland-themed triple action cards for both the Hero (Start Page)
 * and Finale (End of Story).
 * 
 * Includes:
 * 1. Primary: ENTER THE STORY
 * 2. Secondary: EVENT DETAILS
 * 3. Secondary: REGISTER (Creative Radiation Hazard Enlistment Card)
 */
export default function TacticalActionCards({
  onEnterStory,
  onOpenDetails,
  onRegister,
  variant = 'hero',
}: TacticalActionCardsProps) {
  const prefix = variant === 'finale' ? 'finale' : 'hero';

  return (
    <div className="tac-container">
      {/* ── CARD 1: ENTER THE STORY (Primary Hero Banner Card) ── */}
      <button
        type="button"
        className="tac-card tac-card--primary"
        onClick={onEnterStory}
        id={`${prefix}-enter-story`}
        aria-label="Enter the Story"
      >
        <div className="tac-card__glint" />
        <div className="tac-card__header">
          <span className="tac-card__badge">
            <span className="tac-card__led tac-card__led--amber" />
            <span>ARCHIVE // LOG 01</span>
          </span>
          <span className="tac-card__telemetry">
            {variant === 'finale' ? 'REPLAY MISSION ARCHIVE' : 'STATUS: UNSEALED'}
          </span>
        </div>

        <div className="tac-card__body">
          <span className="tac-card__title">ENTER THE STORY</span>
          <span className="tac-card__cta">
            <span>{variant === 'finale' ? 'RETURN TO STORY' : 'COMMENCE RECON'}</span>
            <span className="tac-card__arrow">❯❯</span>
          </span>
        </div>

        <div className="tac-card__notch tac-card__notch--tl" />
        <div className="tac-card__notch tac-card__notch--br" />
      </button>

      {/* ── SECONDARY ROW: EVENT DETAILS + REGISTER ── */}
      <div className="tac-row-secondary">
        {/* ── CARD 2: EVENT DETAILS ── */}
        <button
          type="button"
          className="tac-card tac-card--details"
          onClick={onOpenDetails}
          id={`${prefix}-event-details`}
          aria-label="Event Details Dossier"
        >
          <div className="tac-card__glint" />
          <div className="tac-card__header">
            <span className="tac-card__badge">
              <span className="tac-card__led tac-card__led--cyan" />
              <span>DOSSIER</span>
            </span>
            <span className="tac-card__icon">▤</span>
          </div>

          <div className="tac-card__body">
            <span className="tac-card__title">EVENT DETAILS</span>
            <span className="tac-card__cta">
              <span>INTEL</span>
              <span className="tac-card__arrow">⇲</span>
            </span>
          </div>

          <div className="tac-card__notch tac-card__notch--tl" />
          <div className="tac-card__notch tac-card__notch--br" />
        </button>

        {/* ── CARD 3: REGISTER (Creative Hazard Enlistment Card) ── */}
        <button
          type="button"
          className="tac-card tac-card--register"
          onClick={onRegister}
          id={`${prefix}-register`}
          aria-label="Register Squad Cell"
        >
          <div className="tac-card__glint" />
          <div className="tac-card__header">
            <span className="tac-card__badge">
              <span className="tac-card__led tac-card__led--live" />
              <span>SQUAD (2–4)</span>
            </span>
            <span className="tac-card__hazard-icon">☢</span>
          </div>

          <div className="tac-card__body">
            <span className="tac-card__title">
              REGISTER<span className="tac-card__hazard-text">☢</span>
            </span>
            <span className="tac-card__cta">
              <span>ENLIST CELL</span>
              <span className="tac-card__arrow">❯❯</span>
            </span>
          </div>

          <div className="tac-card__hazard-strip" />
          <div className="tac-card__notch tac-card__notch--tl" />
          <div className="tac-card__notch tac-card__notch--br" />
        </button>
      </div>
    </div>
  );
}
