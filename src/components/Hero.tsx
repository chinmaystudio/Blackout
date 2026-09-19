import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hero — Opening GDGC PRESENTS BLACKOUT screen.
 * Pure black → stepped animation → scroll to begin story.
 */
export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gdgcRef = useRef<HTMLDivElement>(null);
  const presentsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    // Step 1–2: Pure black → faint noise (handled by NoiseOverlay)

    // Step 3: GDGC fades in
    tl.fromTo(
      gdgcRef.current,
      { opacity: 0, y: 10 },
      { opacity: 0.95, y: 0, duration: 0.9, ease: 'power2.out' }
    );

    // Step 4: PRESENTS appears with letter-spacing animation
    tl.fromTo(
      presentsRef.current,
      { opacity: 0, letterSpacing: '1.2em' },
      { opacity: 1, letterSpacing: '0.6em', duration: 0.8, ease: 'power2.out' },
      '-=0.2'
    );

    // Step 5: BLACKOUT glitch reveal
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
    tl.to(titleRef.current, {
      keyframes: [
        { clipPath: 'inset(20% 0 60% 0)', x: -4, duration: 0.05 },
        { clipPath: 'inset(50% 0 20% 0)', x: 4, duration: 0.05 },
        { clipPath: 'inset(10% 0 70% 0)', x: -2, duration: 0.05 },
        { clipPath: 'inset(0 0 0 0)', x: 0, duration: 0.05 },
      ],
      ease: 'none',
    }, '-=0.1');

    // Second glitch pass
    tl.to(titleRef.current, {
      keyframes: [
        { clipPath: 'inset(70% 0 5% 0)', x: 3, duration: 0.04 },
        { clipPath: 'inset(30% 0 40% 0)', x: -3, duration: 0.04 },
        { clipPath: 'inset(0 0 0 0)', x: 0, duration: 0.04 },
      ],
      ease: 'none',
    }, '+=0.05');

    // Step 6: Tagline fades in (crisp, no blur)
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.2'
    );

    // Scroll hint
    tl.fromTo(
      scrollHintRef.current,
      { opacity: 0, y: 20 },
      { opacity: 0.6, y: 0, duration: 0.6, ease: 'power2.out' },
      '+=0.3'
    );

    return () => {
      tl.kill();
    };
  }, []);

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

        <div className="hero__tagline" ref={taglineRef}>
          <p className="text-tagline">SOME TRUTHS ARE BETTER LEFT IN THE DARK</p>
        </div>
      </div>

      <div className="hero__scroll-hint" ref={scrollHintRef}>
        <span className="label-text">SCROLL</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
