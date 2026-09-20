import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import BlackoutNavCards from './BlackoutNavCards';

interface HeroProps {
  onEnterStory?: () => void;
  onOpenDetails?: () => void;
  onRegister?: () => void;
}

/**
 * Hero — Opening GDGC PRESENTS BLACKOUT screen.
 * Features rusted metallic Fallout logo with radiation hazard emblem and
 * interactive tactical action cards for Story, Event Details, and Registration.
 */
export default function Hero({ onEnterStory, onOpenDetails, onRegister }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const gdgcRef = useRef<HTMLDivElement>(null);
  const presentsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    // Step 1: GDGC fades in
    tl.fromTo(
      gdgcRef.current,
      { opacity: 0, y: 10 },
      { opacity: 0.95, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Step 2: PRESENTS appears with letter-spacing animation
    tl.fromTo(
      presentsRef.current,
      { opacity: 0, letterSpacing: '1.2em' },
      { opacity: 1, letterSpacing: '0.6em', duration: 0.7, ease: 'power2.out' },
      '-=0.2'
    );

    // Step 3: BLACKOUT rusted logo reveal
    tl.fromTo(
      titleRef.current,
      {
        opacity: 0,
        scale: 1.05,
        clipPath: 'inset(0 100% 0 0)',
      },
      {
        opacity: 1,
        scale: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.7,
        ease: 'power3.out',
      },
      '-=0.2'
    );

    // Glitch slices effect on title
    tl.to(
      titleRef.current,
      {
        keyframes: [
          { clipPath: 'inset(20% 0 60% 0)', x: -4, duration: 0.05 },
          { clipPath: 'inset(50% 0 20% 0)', x: 4, duration: 0.05 },
          { clipPath: 'inset(10% 0 70% 0)', x: -2, duration: 0.05 },
          { clipPath: 'inset(0 0 0 0)', x: 0, duration: 0.05 },
        ],
        ease: 'none',
      },
      '-=0.1'
    );

    // Step 4: Subtitle AN INTERACTIVE STORY
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.1'
    );

    // Step 5: Action buttons fade in
    tl.fromTo(
      ctaGroupRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.2'
    );

    // Step 6: Scroll hint
    tl.fromTo(
      scrollHintRef.current,
      { opacity: 0, y: 15 },
      { opacity: 0.6, y: 0, duration: 0.6, ease: 'power2.out' },
      '+=0.2'
    );

    return () => {
      tl.kill();
    };
  }, []);

  const handleEnterStory = () => {
    if (onEnterStory) {
      onEnterStory();
    } else {
      const scene1 = document.querySelector('#scene-01');
      if (scene1) {
        scene1.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="hero" ref={heroRef} id="hero">
      <div className="hero__content">
        <div className="hero__gdgc" ref={gdgcRef}>
          <span className="text-gdgc">GDGC</span>
        </div>

        <div className="hero__presents" ref={presentsRef}>
          <span className="text-presents">PRESENTS</span>
        </div>

        <div className="hero__title-wrapper" ref={titleRef}>
          <img
            src="/assets/branding/blackout-logo.png"
            alt="BLACKOUT"
            className="hero__blackout-logo"
            draggable={false}
          />
          <h1 className="sr-only">BLACKOUT</h1>
        </div>

        <div className="hero__subtitle-wrap" ref={subtitleRef}>
          <p className="hero__interactive-subtitle">AN INTERACTIVE STORY.</p>
        </div>

        {/* Tactical 3-Card Action System (Story, Event Details, Register) */}
        <div className="hero__cta-group" ref={ctaGroupRef} style={{ width: '100%', maxWidth: '1020px' }}>
          <BlackoutNavCards
            onEnterStory={handleEnterStory}
            onOpenDetails={onOpenDetails || (() => {})}
            onRegister={onRegister || (() => {})}
            variant="hero"
          />
        </div>
      </div>

      <div
        className="hero__scroll-hint"
        ref={scrollHintRef}
        onClick={handleEnterStory}
        style={{ cursor: 'pointer' }}
      >
        <span className="label-text">SCROLL</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
