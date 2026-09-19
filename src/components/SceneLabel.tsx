interface SceneLabelProps {
  currentScene: string;
  visible: boolean;
}

/**
 * SceneLabel — Fixed upper-left "BLACKOUT // ARCHIVE" label
 * with dynamic scene number.
 */
export default function SceneLabel({ currentScene, visible }: SceneLabelProps) {
  return (
    <div className={`scene-label ${visible ? 'visible' : ''}`}>
      <div className="scene-label__archive">BLACKOUT // ARCHIVE</div>
      <div className="scene-label__scene">{currentScene}</div>
    </div>
  );
}
