import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero from './components/Hero';
import NoiseOverlay from './components/NoiseOverlay';
import FireSparks from './components/FireSparks';
import SceneLabel from './components/SceneLabel';
import ProgressIndicator from './components/ProgressIndicator';
import RadioAudioPlayer, { type RadioAudioPlayerHandle } from './components/RadioAudioPlayer';
import EventDetailsModal from './components/EventDetailsModal';
import RegistrationPage from './pages/RegistrationPage';
import BlackoutNavCards from './components/BlackoutNavCards';
import { scenes, heliosTerminal, mysteryBoard, finale as finaleData } from './data/story';
import type { StoryImage, StoryLine } from './data/story';

import './styles/globals.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/components.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentRoute, setCurrentRoute] = useState<'story' | 'register'>(() => {
    return window.location.hash === '#/register' ? 'register' : 'story';
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState('');
  const [uiVisible, setUiVisible] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const whiteFlashRef = useRef<HTMLDivElement>(null);
  const radioAudioRef = useRef<RadioAudioPlayerHandle>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeSceneIndex = scenes.findIndex(s => s.number === currentScene);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/register') {
        setCurrentRoute('register');
      } else if (window.location.hash === '#/details') {
        setIsDetailsOpen(true);
        setCurrentRoute('story');
      } else {
        setCurrentRoute('story');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToRegister = () => {
    window.location.hash = '#/register';
    setCurrentRoute('register');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToStory = () => {
    window.location.hash = '';
    setCurrentRoute('story');
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  };

  const setupScrollAnimations = useCallback(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    // ═══════════════════════════════
    // HERO — Pin + scroll exit
    // ═══════════════════════════════
    const heroSection = document.querySelector('#hero') as HTMLElement;
    if (heroSection) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: '+=50%',
        pin: true,
        pinSpacing: true,
        onLeave: () => setUiVisible(true),
        onEnterBack: () => {
          setUiVisible(false);
          setCurrentScene('');
        },
      });

      gsap.to('.hero__content', {
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: '+=50%',
          scrub: 0.5,
        },
        scale: 1.1,
        y: -40,
        opacity: 0,
      });
    }

    // ═══════════════════════════════
    // SCENE HEADERS — Fade-in reveal
    // ═══════════════════════════════
    // ═══════════════════════════════
    // SCENE HEADERS — Fade-in reveal
    // ═══════════════════════════════
    document.querySelectorAll('.scene-header').forEach((header) => {
      const sceneId = header.getAttribute('data-scene') || '';
      const children = header.querySelectorAll('.scene-header__child');

      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 80%',
            toggleActions: 'play none none none',
            onEnter: () => setCurrentScene(sceneId),
            onEnterBack: () => setCurrentScene(sceneId),
          },
        }
      );
    });

    // ═══════════════════════════════
    // IMAGE PIN CONTAINERS — Master Timeline per scene
    // ═══════════════════════════════
    document.querySelectorAll('.image-pin-wrap').forEach((wrap) => {
      const container = wrap.querySelector('.image-pin-container') as HTMLElement;
      const panels = wrap.querySelectorAll('.image-panel');
      const sceneId = wrap.getAttribute('data-scene') || '';
      const numPanels = panels.length;

      if (!container || numPanels === 0) return;

      // Tight, brisk, cinematic scroll distance: ~0.85 * innerHeight per panel + 0.3
      const scrollDistance = Math.round(window.innerHeight * (numPanels * 0.85 + 0.3));

      // Master timeline for this scene's image sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          pin: container,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          onEnter: () => setCurrentScene(sceneId),
          onEnterBack: () => setCurrentScene(sceneId),
          onLeave: () => {
            // Pause video when scrolling down past scene
            const vid = wrap.querySelector('video');
            if (vid) vid.pause();
          },
          onLeaveBack: () => {
            // Pause video when scrolling up past scene
            const vid = wrap.querySelector('video');
            if (vid) vid.pause();
          },
        },
      });

      // Initialize all panels (Panel 0 visible at x: 0, video panel at y: 100%, others at x: 100%)
      panels.forEach((p, idx) => {
        const isVideoPanel = p.classList.contains('image-panel--video') || !!p.querySelector('video');
        gsap.set(p, {
          x: idx === 0 ? '0%' : (isVideoPanel ? '0%' : '100%'),
          y: isVideoPanel && idx > 0 ? '100%' : '0%',
          opacity: 1,
          filter: 'brightness(1)',
        });
        // Ensure all text lines inside the panel are 100% visible and sharp
        const panelLines = p.querySelectorAll('.image-panel__body-line');
        if (panelLines.length > 0) {
          gsap.set(panelLines, { opacity: 1, y: 0, clearProps: 'filter' });
        }
      });

      // Panel 0: continuous gentle slow-motion camera breathe while scrolling
      const firstPanel = panels[0] as HTMLElement;
      const firstImg = firstPanel?.querySelector('.image-panel__image') as HTMLElement;
      if (firstImg) {
        tl.fromTo(firstImg, { scale: 1.04 }, { scale: 1.0, duration: 0.8, ease: 'none' }, 0);
      }

      // Subsequent panels — smooth overlapping slide
      for (let i = 1; i < numPanels; i++) {
        const panel = panels[i] as HTMLElement;
        const prevPanel = panels[i - 1] as HTMLElement;
        const img = panel.querySelector('.image-panel__image') as HTMLElement;
        const label = `panel-${i}`;

        const isVideoPanel = panel.classList.contains('image-panel--video') || !!panel.querySelector('video');
        const prevIsVideo = prevPanel.classList.contains('image-panel--video') || !!prevPanel.querySelector('video');

        if (isVideoPanel) {
          const flashRef = whiteFlashRef.current;

          // 1. WHITE FLASH HITS FIRST BEFORE THE VIDEO ENTERS
          if (flashRef) {
            tl.to(flashRef, { opacity: 0.9, duration: 0.12, ease: 'power2.in' }, label);

            // AUDIO AUTOMATICALLY STARTS AT THE EXACT MOMENT THE WHITE FLASH HITS!
            tl.call(() => {
              if (!tl.scrollTrigger || tl.scrollTrigger.direction === 1) {
                radioAudioRef.current?.playDetonationTrack();
              }
            }, [], label);

            tl.to(flashRef, { opacity: 0, duration: 0.3, ease: 'power2.out' }, `${label}+=0.12`);
          } else {
            tl.call(() => {
              if (!tl.scrollTrigger || tl.scrollTrigger.direction === 1) {
                radioAudioRef.current?.playDetonationTrack();
              }
            }, [], label);
          }

          // 2. Video panel slides in smoothly from bottom right out of the flash
          tl.to(panel, { y: '0%', x: '0%', duration: 1.0, ease: 'power1.inOut' }, `${label}+=0.08`);
          tl.to(prevPanel, { y: '-10%', filter: 'brightness(0.35)', duration: 1.0, ease: 'power1.inOut' }, `${label}+=0.08`);

          // Video starts playing as it emerges from the detonation flash
          tl.call(() => {
            const vid = panel.querySelector('video');
            if (!tl.scrollTrigger || tl.scrollTrigger.direction === 1) {
              if (vid) {
                vid.play().catch(() => {});
              }
            } else if (tl.scrollTrigger && tl.scrollTrigger.direction === -1) {
              if (vid) vid.pause();
            }
          }, [], `${label}+=0.08`);
        } else if (prevIsVideo) {
          // Panel following video slides in from right smoothly
          tl.to(panel, { x: '0%', y: '0%', duration: 1.0, ease: 'power1.inOut' }, label);
          tl.to(prevPanel, { x: '-6%', filter: 'brightness(0.35)', duration: 1.0, ease: 'power1.inOut' }, label);

          // Swiping down past video: PAUSE VIDEO (GPU OPTIMIZATION), KEEP AUDIO PLAYING IN BACKGROUND!
          tl.call(() => {
            const vid = prevPanel.querySelector('video');
            if (!tl.scrollTrigger || tl.scrollTrigger.direction === 1) {
              if (vid) vid.pause();
            } else if (tl.scrollTrigger && tl.scrollTrigger.direction === -1) {
              if (vid) {
                vid.play().catch(() => {});
              }
            }
          }, [], label);
        } else {
          // Standard horizontal panel slide
          tl.to(panel, { x: '0%', y: '0%', duration: 1.0, ease: 'power1.inOut' }, label);
          tl.to(prevPanel, { x: '-6%', filter: 'brightness(0.35)', duration: 1.0, ease: 'power1.inOut' }, label);
        }

        // Image gentle continuous scale
        if (img) {
          tl.fromTo(img, { scale: 1.04 }, { scale: 1.0, duration: 1.0, ease: 'none' }, label);
        }

        // Scene special effect: crisp, self-reversing cinematic white flash on detonation (for non-video panels if any)
        const sceneData = scenes.find((s) => s.number === sceneId);
        const imageData = sceneData?.images[i];
        if (imageData?.effect === 'flash' && whiteFlashRef.current && !isVideoPanel) {
          const flashRef = whiteFlashRef.current;
          tl.to(flashRef, { opacity: 0.75, duration: 0.08, ease: 'power2.in' }, `${label}+=0.15`)
            .to(flashRef, { opacity: 0, duration: 0.22, ease: 'power2.out' }, `${label}+=0.23`);
        }
      }



      // Final gentle continuous drift on last panel before unpinning
      const lastPanel = panels[numPanels - 1] as HTMLElement;
      const lastImg = lastPanel?.querySelector('.image-panel__image') as HTMLElement;
      if (lastImg) {
        tl.to(lastImg, { scale: 0.98, duration: 0.35, ease: 'none' });
      }
    });

    // ═══════════════════════════════
    // END SECTIONS (black interstitials)
    // ═══════════════════════════════
    document.querySelectorAll('.scene-end-section').forEach((section) => {
      const lines = section.querySelectorAll('.scene-end-line');
      gsap.fromTo(
        lines,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.35,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ═══════════════════════════════
    // MYSTERY BOARD
    // ═══════════════════════════════
    const mysteryEl = document.querySelector('#mystery-board') as HTMLElement;
    if (mysteryEl) {
      const items = mysteryEl.querySelectorAll('.mystery-animated');
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mysteryEl,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // ═══════════════════════════════
    // HELIOS TERMINAL
    // ═══════════════════════════════
    const terminalEl = document.querySelector('#helios-terminal') as HTMLElement;
    if (terminalEl) {
      const logLines = terminalEl.querySelectorAll('.terminal__log-line');
      gsap.fromTo(
        logLines,
        { opacity: 0, x: -15 },
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: terminalEl,
            start: 'top 70%',
            toggleActions: 'play none none none',
            onEnter: () => setCurrentScene('SCENE 04'),
          },
        }
      );

      const revelation = terminalEl.querySelector('.terminal__revelation') as HTMLElement;
      if (revelation) {
        const revLines = revelation.querySelectorAll('.terminal__rev-line');
        gsap.fromTo(
          revLines,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.3,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: revelation,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }

    // ═══════════════════════════════
    // FINALE
    // ═══════════════════════════════
    document.querySelectorAll('.finale__section').forEach((section) => {
      const children = section.querySelectorAll('.finale__animated');
      gsap.fromTo(
        children,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
            onEnter: () => {
              setCurrentScene('');
              setUiVisible(false);
            },
          },
        }
      );
    });

    ScrollTrigger.refresh();
  }, []);

  // Preload all story assets on mount to prevent any scroll pop-in
  useEffect(() => {
    const toPreload: string[] = [
      '/assets/branding/blackout-logo.png',
      '/assets/branding/blackout-title.png',
    ];
    scenes.forEach((s) => {
      s.images.forEach((img) => toPreload.push(img.src));
    });
    toPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(setupScrollAnimations, 200);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [setupScrollAnimations]);

  // ── Render helpers ──

  function renderStoryLine(line: StoryLine, idx: number) {
    let className = 'image-panel__body-line ';
    switch (line.style) {
      case 'headline': className += 'headline'; break;
      case 'quote': className += 'quote-text'; break;
      case 'emergency': className += 'emergency-text'; break;
      case 'timestamp': className += 'timestamp'; break;
      case 'signal-lost': className += 'signal-lost'; break;
      default: className += 'body-text';
    }
    return <div key={idx} className={className}>{line.text}</div>;
  }

  function renderImagePanel(image: StoryImage, index: number, sceneNum: string) {
    const isVideo = !!image.videoSrc;
    return (
      <div
        className={`image-panel ${isVideo ? 'image-panel--video' : ''}`}
        key={index}
        style={{ zIndex: index + 1 }}
      >
        <div className="image-panel__image-container">
          {image.videoSrc ? (
            <div className="image-panel__video-wrap">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.muted = true;
                    el.playsInline = true;
                    // Ensure video does NOT play prematurely at page load; only plays when scrolled into view
                    if (el.currentTime === 0 && !el.paused) {
                      el.pause();
                    }
                  }
                }}
                className="image-panel__image image-panel__video"
                src={image.videoSrc}
                muted
                loop
                playsInline
                preload="auto"
                onPlay={() => {
                  radioAudioRef.current?.playDetonationTrack();
                }}
              />
            </div>
          ) : (
            <img
              className="image-panel__image"
              src={image.src}
              alt={image.alt}
              loading="eager"
              decoding="async"
              draggable={false}
            />
          )}
          <div className="image-panel__vignette" />
        </div>

        <div className="image-panel__text-container">
          <div className="image-panel__scene-num scene-number image-panel__body-line">{sceneNum}</div>

          {image.timestamp && (
            <div className="image-panel__timestamp timestamp image-panel__body-line">
              {image.timestamp}
            </div>
          )}

          <div className="image-panel__headline headline image-panel__body-line">
            {image.headline}
          </div>

          <div className="image-panel__body">
            {image.bodyLines.map((line, i) => renderStoryLine(line, i))}
          </div>

          {image.specialText && (
            <div className="image-panel__special-text">
              <div className={`image-panel__body-line body-text ${image.specialText.special === 'flicker' ? 'flicker-text' : ''}`}
                   style={image.specialText.special === 'flicker' ? { animation: 'flicker 2s infinite', color: 'var(--yellow)' } : {}}>
                {image.specialText.text}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderEndLine(line: StoryLine, idx: number) {
    let className = '';
    switch (line.style) {
      case 'headline': className = 'headline'; break;
      case 'quote': className = 'quote-text'; break;
      case 'emergency': className = 'emergency-text'; break;
      case 'signal-lost': className = 'signal-lost'; break;
      default: className = 'body-text';
    }

    if (line.special === 'red-text') {
      className = 'emergency-text';
    }

    return (
      <div key={idx} className={`scene-end-line ${className}`} style={{ marginBottom: '1.5rem' }}>
        {line.text}
      </div>
    );
  }

  if (currentRoute === 'register') {
    return <RegistrationPage onReturnToStory={navigateToStory} />;
  }

  return (
    <div className="app" ref={appRef}>
      {/* Global overlays */}
      <NoiseOverlay />
      <FireSparks />
      <SceneLabel currentScene={currentScene} visible={uiVisible} />
      <ProgressIndicator
        totalScenes={4}
        activeScene={activeSceneIndex >= 0 ? activeSceneIndex : 0}
        visible={uiVisible}
      />
      <div className="white-flash" ref={whiteFlashRef} />
      <RadioAudioPlayer ref={radioAudioRef} />

      {/* Event Details Dossier Modal */}
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRegister={navigateToRegister}
      />

      {/* ════════════════════════════
         HERO
         ════════════════════════════ */}
      <Hero
        onEnterStory={() => {
          const s1 = document.querySelector('#scene-01');
          if (s1) {
            s1.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
          }
        }}
        onOpenDetails={() => setIsDetailsOpen(true)}
        onRegister={navigateToRegister}
      />

      {/* ════════════════════════════
         SCENES
         ════════════════════════════ */}
      {scenes.map((scene) => (
        <section key={scene.id} id={scene.id} className="scene">

          {/* Scene Header — cinematic narrative title card */}
          <div className="scene-header" data-scene={scene.number} style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(2.5rem, 5vh, 4rem) var(--scene-padding)', background: 'var(--black)' }}>
            <div className="scene-header__child scene-number" style={{ marginBottom: '0.75rem' }}>
              {scene.number}
            </div>
            <h2 className="scene-header__child headline" style={{ marginBottom: '1rem' }}>
              {scene.title}
            </h2>
            {scene.openingCaption && (
              <p className="scene-header__child body-text" style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1.1rem)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
                {scene.openingCaption}
              </p>
            )}
            {scene.subtitle && (
              <p className="scene-header__child body-text" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {scene.subtitle}
              </p>
            )}
          </div>

          {/* Image Panels — pinned container with horizontal overlaps */}
          {scene.images.length > 0 && (
            <div className="image-pin-wrap" data-scene={scene.number}>
              <div className="image-pin-container" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
                {scene.images.map((img, i) => renderImagePanel(img, i, scene.number))}
              </div>
            </div>
          )}

          {/* End Section */}
          {scene.endSection && (
            <div className="scene-end-section" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(2.5rem, 5vh, 4rem) var(--scene-padding)', background: 'var(--black)' }}>
              {scene.endSection.lines.map((line, i) => renderEndLine(line, i))}
            </div>
          )}
        </section>
      ))}

      {/* ════════════════════════════
         MYSTERY BOARD
         ════════════════════════════ */}
      <section id="mystery-board" className="mystery-board">
        {mysteryBoard.items.map((item, i) => (
          <div key={`item-${i}`} className="mystery-board__item mystery-animated">
            {item}
          </div>
        ))}
        <div style={{ height: '1.5rem' }} />
        {mysteryBoard.revelations.map((rev, i) => (
          <div key={`rev-${i}`} className="mystery-board__no mystery-animated">
            {rev}
          </div>
        ))}
        <div className="mystery-board__question mystery-animated">
          {mysteryBoard.question}
        </div>
      </section>

      {/* ════════════════════════════
         HELIOS TERMINAL
         ════════════════════════════ */}
      <section id="helios-terminal" className="terminal">
        <div className="terminal__scanline" />
        <div className="terminal__crt" />
        <div className="terminal__content">
          <div className="terminal__header terminal-text">
            {heliosTerminal.header}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            {heliosTerminal.statusLines.map((line, i) => (
              <div key={i} className="terminal__status-line terminal-text">
                <span className="terminal__status-key">{line.key}:</span>
                <span className="terminal__status-value">{line.value}</span>
              </div>
            ))}
          </div>

          <div className="terminal__divider" />

          <div style={{ marginTop: '1rem' }}>
            {heliosTerminal.logs.map((log, i) => (
              <div
                key={i}
                className="terminal__log-line terminal-text"
                style={{ marginBottom: '0.4rem' }}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="terminal__divider" />

          <div className="terminal__revelation" style={{ marginTop: '2rem' }}>
            {heliosTerminal.revelation.map((line, i) => (
              <div
                key={i}
                className={`terminal__rev-line ${line.style === 'quote' ? 'quote-text' : 'headline'}`}
                style={{ marginBottom: '1.5rem' }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
         FINALE
         ════════════════════════════ */}
      <section id="finale" className="finale">
        {finaleData.lines.map((line, i) => (
          <div key={i} className="finale__section">
            <div className="finale__warning-text finale__animated">
              {line.text}
            </div>
          </div>
        ))}

        <div className="finale__section">
          <div className="finale__animated" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="text-gdgc" style={{ marginBottom: '0.5rem' }}>GDGC</div>
            <div className="text-presents" style={{ marginBottom: '1.5rem' }}>PRESENTS</div>
            <img
              src="/assets/branding/blackout-logo.png"
              alt="BLACKOUT"
              className="finale__blackout-logo"
              draggable={false}
            />
            <h2 className="sr-only">BLACKOUT</h2>
            <div className="finale__subtitle">{finaleData.cta.subtitle}</div>
          </div>

          <div className="finale__cta-area finale__animated" style={{ width: '100%', maxWidth: '860px', margin: '3rem auto 0 auto' }}>
            <BlackoutNavCards
              onEnterStory={() => {
                const s1 = document.querySelector('#scene-01');
                if (s1) {
                  s1.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onOpenDetails={() => setIsDetailsOpen(true)}
              onRegister={navigateToRegister}
              variant="finale"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
