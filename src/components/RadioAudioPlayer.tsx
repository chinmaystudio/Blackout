import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';

export interface RadioAudioPlayerHandle {
  playDetonationTrack: () => void;
  stopTrack: () => void;
}

interface RadioAudioPlayerProps {
  onAudioPlayStateChange?: (isPlaying: boolean) => void;
}

const RadioAudioPlayer = forwardRef<RadioAudioPlayerHandle, RadioAudioPlayerProps>(
  ({ onAudioPlayStateChange }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.85);
    const [hasStarted, setHasStarted] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const hasTriggeredRef = useRef(false);
    const userPausedRef = useRef(false);
    const isPrimedRef = useRef(false);

    // Prime the audio element on any early user gesture so the browser permits immediate autoplay
    const primeAudio = () => {
      const audio = audioRef.current;
      if (!audio || isPrimedRef.current) return;
      isPrimedRef.current = true;

      const prevMuted = audio.muted;
      audio.muted = true;
      audio.play()
        .then(() => {
          if (!hasTriggeredRef.current) {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = prevMuted;
          } else {
            audio.muted = false;
            audio.volume = volume;
            setIsPlaying(true);
            setNeedsInteraction(false);
            onAudioPlayStateChange?.(true);
          }
        })
        .catch(() => {
          isPrimedRef.current = false;
        });
    };

    // Start playing audio with graceful autoplay recovery
    const startAudio = (vol = 0.85) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = vol;
      audio.muted = false;
      setIsMuted(false);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
            setNeedsInteraction(false);
            userPausedRef.current = false;
            onAudioPlayStateChange?.(true);
          })
          .catch((err) => {
            console.warn('Audio autoplay blocked by browser policy, awaiting user gesture:', err);
            setNeedsInteraction(true);
            setHasStarted(true);

            const onGesture = () => {
              const aud = audioRef.current;
              if (aud && !userPausedRef.current) {
                aud.volume = vol;
                aud.muted = false;
                aud.play()
                  .then(() => {
                    setIsPlaying(true);
                    setNeedsInteraction(false);
                    onAudioPlayStateChange?.(true);
                  })
                  .catch(() => {});
              }
              window.removeEventListener('pointerdown', onGesture);
              window.removeEventListener('click', onGesture);
              window.removeEventListener('keydown', onGesture);
              window.removeEventListener('touchstart', onGesture);
              window.removeEventListener('wheel', onGesture);
              window.removeEventListener('scroll', onGesture);
            };

            window.addEventListener('pointerdown', onGesture, { once: true });
            window.addEventListener('click', onGesture, { once: true });
            window.addEventListener('keydown', onGesture, { once: true });
            window.addEventListener('touchstart', onGesture, { once: true });
            window.addEventListener('wheel', onGesture, { once: true });
            window.addEventListener('scroll', onGesture, { once: true });
          });
      }
    };

    useImperativeHandle(ref, () => ({
      playDetonationTrack: () => {
        const audio = audioRef.current;
        if (!audio) return;

        // If user manually pressed PAUSE button on the HUD, respect that pause
        if (userPausedRef.current) return;

        // If audio is already playing smoothly, do NOT restart track
        if (!audio.paused && isPlaying) return;

        // Start or resume playback
        hasTriggeredRef.current = true;
        startAudio(volume);
      },
      stopTrack: () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          userPausedRef.current = true;
          onAudioPlayStateChange?.(false);
        }
      },
    }));

    // Unlock audio context on any user interaction anywhere on the page
    useEffect(() => {
      const handleEarlyInteraction = () => {
        primeAudio();

        const audio = audioRef.current;
        if (audio && audio.paused && hasTriggeredRef.current && !userPausedRef.current) {
          audio.muted = false;
          audio.volume = volume;
          audio.play()
            .then(() => {
              setIsPlaying(true);
              setNeedsInteraction(false);
              onAudioPlayStateChange?.(true);
            })
            .catch(() => {});
        }
      };

      window.addEventListener('click', handleEarlyInteraction, { passive: true });
      window.addEventListener('pointerdown', handleEarlyInteraction, { passive: true });
      window.addEventListener('keydown', handleEarlyInteraction, { passive: true });
      window.addEventListener('touchstart', handleEarlyInteraction, { passive: true });
      window.addEventListener('wheel', handleEarlyInteraction, { passive: true });
      window.addEventListener('scroll', handleEarlyInteraction, { passive: true });

      return () => {
        window.removeEventListener('click', handleEarlyInteraction);
        window.removeEventListener('pointerdown', handleEarlyInteraction);
        window.removeEventListener('keydown', handleEarlyInteraction);
        window.removeEventListener('touchstart', handleEarlyInteraction);
        window.removeEventListener('wheel', handleEarlyInteraction);
        window.removeEventListener('scroll', handleEarlyInteraction);
      };
    }, [volume, onAudioPlayStateChange]);

    // Handle play/pause button
    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        userPausedRef.current = true;
        onAudioPlayStateChange?.(false);
      } else {
        userPausedRef.current = false;
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
            setNeedsInteraction(false);
            hasTriggeredRef.current = true;
            onAudioPlayStateChange?.(true);
          })
          .catch(() => {});
      }
    };

    // Handle mute toggle
    const toggleMute = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const nextMuted = !isMuted;
      audio.muted = nextMuted;
      setIsMuted(nextMuted);
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (audioRef.current) {
        audioRef.current.volume = val;
        audioRef.current.muted = val === 0;
        setIsMuted(val === 0);
      }
    };

    // Render into document.body portal: 100% decoupled from React/GSAP DOM pin containers
    return createPortal(
      <>
        {/* Persistent audio element */}
        <audio
          ref={audioRef}
          src="/song/fallout_theme.mp3"
          preload="auto"
          onEnded={() => {
            setIsPlaying(false);
            onAudioPlayStateChange?.(false);
          }}
        />

        {/* Tactical HUD: always mounted, toggled via CSS visibility to prevent any DOM insertion crashes */}
        <div
          className={`radio-hud ${hasStarted ? 'radio-hud--visible' : 'radio-hud--hidden'} ${
            needsInteraction ? 'radio-hud--prompt' : ''
          }`}
          onClick={() => {
            if (needsInteraction) {
              startAudio(volume);
            }
          }}
        >
          <div className="radio-hud__chassis">
            <div className="radio-hud__header">
              <div className="radio-hud__freq">
                <span
                  className={`radio-hud__led ${
                    isPlaying
                      ? 'radio-hud__led--active'
                      : needsInteraction
                      ? 'radio-hud__led--standby'
                      : ''
                  }`}
                />
                <span className="radio-hud__freq-label">
                  {needsInteraction
                    ? '88.7 MHz // CLICK TO TUNE IN'
                    : isPlaying
                    ? '88.7 MHz // BROADCASTING'
                    : '88.7 MHz // STANDBY'}
                </span>
              </div>
              <div className="radio-hud__controls" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`radio-hud__ctrl-btn ${isPlaying ? 'radio-hud__ctrl-btn--active' : ''}`}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`radio-hud__ctrl-btn ${isMuted ? 'radio-hud__ctrl-btn--muted' : ''}`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="radio-hud__vol-slider"
                  title="Volume"
                />
              </div>
            </div>
            <div className="radio-hud__track-strip">
              <span>The Ink Spots — I Don't Want To Set The World On Fire</span>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }
);

RadioAudioPlayer.displayName = 'RadioAudioPlayer';

export default RadioAudioPlayer;
