# BLACKOUT — Incident & Debug Log

## Incident Report: Screen Collapse / Blackout After Scene 02 Card 1

### 1. Problem Description
- **Observed Behavior**: When scrolling past Scene 02 Card 1 ("THEN— SILENCE" / Emergency broadcast radio FM 88.7 MHz) into Card 2 ("THE SKY TURNS WHITE" / Detonation Video), the screen suddenly crashed and turned 100% pitch black.
- **Reference Image**: Scene 02 Card 1 (`scene2-2.png`) showing countdown to silence and "THEN— SILENCE".

---

### 2. Root Cause Analysis
- **Stack Trace Captured in Console**:
  ```
  NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
      at insertOrAppendPlacementNode (react-dom_client.js:7120:70)
      at commitPlacement (react-dom_client.js:7151:6)
      at commitReconciliationEffects (react-dom_client.js:8051:6)
      at commitMutationEffectsOnFiber (react-dom_client.js:7927:6)
  ```
- **Mechanism**:
  1. In `src/App.tsx`, GSAP ScrollTrigger pins the `#hero` element and image containers by injecting `.pin-spacer` wrappers and re-parenting elements directly within `<div className="app">`.
  2. Inside `src/components/RadioAudioPlayer.tsx`, when the video panel was reached, `playDetonationTrack()` fired, calling `setHasStarted(true)`.
  3. This conditionally mounted `{hasStarted && <div className="radio-hud">...</div>}` inside `<div className="app">`.
  4. React's Fiber reconciler attempted to insert `<div className="radio-hud">` as a sibling before the next DOM node (`#hero`). But `#hero` was no longer a direct child of `<div className="app">` (it was wrapped inside GSAP's `.pin-spacer`).
  5. The browser threw `DOMException: NotFoundError`.
  6. Because this error occurred in the React commit phase without an Error Boundary, React 18/19 unmounted the entire component tree from `<div id="root"></div>`, leaving a completely blank black screen.

---

### 3. Architecture & Resolution Implemented

#### A. Decouple Radio Audio & Tactical HUD from GSAP DOM (`RadioAudioPlayer.tsx`)
- Moved `<audio>` and `<div className="radio-hud">` out of `<div className="app">` using React's `createPortal(..., document.body)`.
- Eliminated conditional DOM insertion/removal (`{hasStarted && ...}`). The Tactical HUD is now **permanently mounted in the DOM** from initial render.
- State transitions are handled exclusively via CSS classes:
  - `.radio-hud--hidden`: `opacity: 0; pointer-events: none; transform: translateY(20px); visibility: hidden;`
  - `.radio-hud--visible`: `opacity: 1; pointer-events: auto; transform: translateY(0); visibility: visible;`
- **Zero DOM insertion/removal occurs during scroll**. React only modifies the `className` attribute on an existing node, completely preventing any `insertBefore` or reconciliation conflicts with GSAP pin-spacers.

#### B. Audio Autoplay Synchronization (`RadioAudioPlayer.tsx` & `App.tsx`)
- **White Flash Audio Triggering**: Rather than waiting for the video element or panel animation to finish, the audio is now synchronized **directly to the White Flash detonation effect** at the start of the Card 2 transition.
- **Cinematic Sequence**:
  1. As you scroll from Card 1 ("THEN— SILENCE"), the screen flashes blinding white (detonation blast).
  2. **At that exact moment of the white flash**, `radioAudioRef.current?.playDetonationTrack()` fires automatically.
  3. The mushroom cloud video card slides in from the bottom right as the flash clears, and begins playing.
  4. The audio and blast are unified in a single, cinematic moment.
- **Premature Autoplay Fix**: Removed `autoPlay` from `<video>` so it never runs at page load.
- **Continuous Background Audio**: When scrolling past to Panel 3 ("WINDOWS SHATTER"), the video pauses while the Fallout song keeps playing uninterrupted in the background.

#### C. React Error Resilience (`ErrorBoundary.tsx` & `main.tsx`)
- Created `src/components/ErrorBoundary.tsx` and wrapped `<App />` in `src/main.tsx`.
- Ensures that even under unexpected external errors, the root component will never collapse to an unrecoverable blank screen.

---

### 4. Verification Checklist
- [x] Scene 02 Card 1 ("THEN— SILENCE") scrolls smoothly into Card 2 without crash or black screen.
- [x] Single video element in DOM (`/video/nuclear_blast.mp4`) renders and plays smoothly.
- [x] Video enters with a smooth downward slide rather than swapping horizontally.
- [x] Video does not play prematurely on page load; only starts when scrolled into view.
- [x] Fallout theme audio autoplays seamlessly when the video card enters and video starts.
- [x] Video pauses when scrolling past to Panel 3 ("WINDOWS SHATTER"), and Fallout audio continues playing uninterrupted.
- [x] Tactical Radio HUD displays playback controls, volume slider, and track title.
- [x] All subsequent scenes (Scene 03, Helios Terminal, Finale) remain fully functional and smooth.

---

### 5. Recovery Cell Registration & Appwrite Backend Integration

#### A. Hero Action Buttons (Reference Image Match)
- Added the exact layout from user reference image:
  - Subtitle: `AN INTERACTIVE STORY.`
  - Primary Button: `[ ENTER THE STORY ]` (smooth scroll down into Scene 01).
  - Secondary Buttons: `[ EVENT DETAILS ]` (opens Event Dossier modal) and `[ REGISTER ]` (navigates to Registration terminal).
- Rusted gold/amber borders, tactical hover glows, and responsive styling.

#### B. Event Details Dossier Modal (`EventDetailsModal.tsx`)
- Provides full tactical lore and briefing:
  - Incident timeline (11:47 PM blackout, 11:59 PM detonation).
  - The three survivor factions (*The Citadel*, *The Freeborn*, *The Afterlight*).
  - 5 challenge levels (Grid Gateway, Radio Intercept, Subsystem Debugging, Archive Correlation, Survival Sentinel Hackathon).
  - Quick "ENLIST RECOVERY CELL >>" button leading straight to registration.

#### C. Recovery Cell Registration Terminal (`RegistrationPage.tsx` & `registration.css`)
- **Creative Sci-Fi Glassmorphism Redesign**:
  - Replaced the heavy, complex multi-section form with a streamlined **2-column creative workstation**:
    - **Left**: Simplified, intuitive registration terminal with instant `[ SOLO (1) ]` vs `[ SQUAD (2-4) ]` deployment toggle.
    - **Right**: **Live Holographic Tactical Pass Preview** that updates in real-time as the user types their callsign, lead operative name, and selected faction pill! Includes animated holographic shimmer, dynamic barcode, and projected clearance ID.
  - Low-friction inputs: Only essential information required (Team Callsign, Lead Name, Comms Email, Phone, College, and companion slots if squad mode is enabled).
  - High-tech amber/gold and phosphor-green tactile glowing aesthetics with deep obsidian glass backdrop.
- **Clearance Badge**: On submission, renders an official **Recovery Cell Clearance Dossier** with unique cryptographic token (`RC-XXXX-2026`), faction stamp, and print/export button.

#### D. Appwrite Backend & Security Architecture (`src/lib/appwrite.ts`)
- **Appwrite SDK Integration**: Connected via `Client`, `Databases`, `ID` with `.env` template (`VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`, `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_COLLECTION_ID`).
- **Input Sanitization**: All strings are sanitized against XSS and injection.
- **Anti-Bot Shield**: Hidden honeypot field (`recovery_auth_token_trap`) rejects automated spambots.
- **Rate-Limiting Cooldown**: 15-second debounce between transmissions.
- **Offline / Mock Fallback Mode**: If environment variables are not yet configured, the system automatically falls back to an offline simulation ledger in `localStorage` with a generated clearance token, ensuring zero downtime and complete testability out of the box.
