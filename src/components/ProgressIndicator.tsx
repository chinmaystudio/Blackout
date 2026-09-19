interface ProgressIndicatorProps {
  totalScenes: number;
  activeScene: number;
  visible: boolean;
}

/**
 * ProgressIndicator — Fixed right-side dot indicator.
 * Current scene gets yellow glow.
 */
export default function ProgressIndicator({ totalScenes, activeScene, visible }: ProgressIndicatorProps) {
  return (
    <div className={`progress-indicator ${visible ? 'visible' : ''}`}>
      {Array.from({ length: totalScenes }, (_, i) => (
        <div
          key={i}
          className={`progress-indicator__dot ${i === activeScene ? 'active' : ''}`}
          aria-label={`Scene ${i + 1}`}
        />
      ))}
    </div>
  );
}
