import { Client, Databases, ID } from 'appwrite';

/**
 * Appwrite Backend Service for BLACKOUT: FALLOUT Recovery Cell Registration
 */

export interface TeamMember {
  name: string;
  email: string;
  studentId?: string;
}

export interface RegistrationData {
  cellName: string;
  faction: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadCollege: string;
  teamSize: number;
  members: TeamMember[];
  specialization: string;
  experienceTier: string;
  emergencyProtocolAccepted: boolean;
}

export interface RegistrationResult {
  success: boolean;
  clearanceToken: string;
  message: string;
  offlineMode?: boolean;
}

// Environment config
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'blackout_db';
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'registrations';

// Initialize Client only if project ID is provided
let client: Client | null = null;
let databases: Databases | null = null;

if (PROJECT_ID && PROJECT_ID.trim() !== '' && PROJECT_ID !== 'your_project_id_here') {
  try {
    client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    databases = new Databases(client);
  } catch (err) {
    console.warn('[Appwrite] Initialization skipped:', err);
  }
}

export function isAppwriteConfigured(): boolean {
  return !!(databases && PROJECT_ID && PROJECT_ID.trim() !== '' && PROJECT_ID !== 'your_project_id_here');
}

/**
 * Basic XSS sanitizer
 */
function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Generate cryptographic-looking operative token (e.g. RC-7F9A-2026)
 */
export function generateClearanceToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RC-${rand}-2026`;
}

// Session anti-spam rate limiter
let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN_MS = 15000; // 15 seconds

/**
 * Submit Recovery Cell Registration with anti-bot protection & security checks
 */
export async function submitRegistration(
  data: RegistrationData,
  honeypotTrap?: string
): Promise<RegistrationResult> {
  // 1. Bot honeypot shield: automated bots filling hidden field are rejected
  if (honeypotTrap && honeypotTrap.trim().length > 0) {
    console.warn('[Security] Automated submission rejected via honeypot trap.');
    throw new Error('SECURITY ALERT // Automated transaction prohibited by HELIOS.');
  }

  // 2. Submission cooldown check
  const now = Date.now();
  if (now - lastSubmissionTime < SUBMISSION_COOLDOWN_MS) {
    const waitSec = Math.ceil((SUBMISSION_COOLDOWN_MS - (now - lastSubmissionTime)) / 1000);
    throw new Error(`COMMS OVERLOAD // Rate limit active. Please wait ${waitSec}s before transmitting.`);
  }

  // 3. Validation & Sanitization
  const sanitizedCellName = sanitize(data.cellName);
  const sanitizedLeadName = sanitize(data.leadName);
  const sanitizedLeadEmail = sanitize(data.leadEmail).toLowerCase();
  const sanitizedLeadPhone = sanitize(data.leadPhone);
  const sanitizedLeadCollege = sanitize(data.leadCollege);

  if (!sanitizedCellName || sanitizedCellName.length < 3) {
    throw new Error('IDENTIFICATION ERROR // Recovery Cell Call Sign must be at least 3 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedLeadEmail)) {
    throw new Error('COMMS FAILURE // Invalid Lead Operative email address.');
  }

  if (!sanitizedLeadPhone || sanitizedLeadPhone.length < 8) {
    throw new Error('FREQUENCY ERROR // Valid comms frequency (phone number) is required.');
  }

  if (!data.emergencyProtocolAccepted) {
    throw new Error('CLEARANCE DENIED // You must accept the Directive AFTERLIGHT Emergency Protocol.');
  }

  const sanitizedMembers: TeamMember[] = (data.members || []).map((m) => ({
    name: sanitize(m.name),
    email: sanitize(m.email).toLowerCase(),
    studentId: m.studentId ? sanitize(m.studentId) : undefined,
  }));

  const clearanceToken = generateClearanceToken();
  const submissionTimestamp = new Date().toISOString();

  const payload = {
    cellName: sanitizedCellName,
    faction: data.faction || 'Undecided',
    leadName: sanitizedLeadName,
    leadEmail: sanitizedLeadEmail,
    leadPhone: sanitizedLeadPhone,
    leadCollege: sanitizedLeadCollege,
    teamSize: data.teamSize || 1,
    members: JSON.stringify(sanitizedMembers),
    specialization: data.specialization || 'Vanguard',
    experienceTier: data.experienceTier || 'Recruit',
    clearanceToken,
    createdAt: submissionTimestamp,
  };

  lastSubmissionTime = Date.now();

  // 4. Submit to Appwrite if configured
  if (isAppwriteConfigured() && databases) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        payload
      );

      // 5. Dispatch Clearance Email via SMTP endpoint
      try {
        fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cellName: payload.cellName,
            leadName: payload.leadName,
            leadEmail: payload.leadEmail,
            leadPhone: payload.leadPhone,
            leadCollege: payload.leadCollege,
            teamSize: payload.teamSize,
            members: sanitizedMembers,
            clearanceToken,
          }),
        }).catch((e) => {
          console.warn('[SMTP Dispatch Warning] Failed to trigger email endpoint:', e);
        });
      } catch (emailErr) {
        console.warn('[SMTP Dispatch Notice] Non-blocking email dispatch error:', emailErr);
      }

      return {
        success: true,
        clearanceToken,
        message: 'TRANSMISSION CONFIRMED // Clearance dossier established on HELIOS Network.',
        offlineMode: false,
      };
    } catch (err: any) {
      console.error('[Appwrite Error]', err);
      // Surface clear, actionable guidance if Appwrite returns known API errors
      if (err.code === 401 || err.code === 403) {
        throw new Error(
          'APPWRITE PERMISSIONS REQUIRED // Go to Appwrite Console > Databases > registrations > Settings > Permissions, and add Role "Any" with "Create" permission.'
        );
      } else if (err.code === 404) {
        throw new Error(
          `APPWRITE RESOURCE NOT FOUND // Verify that Database "${DATABASE_ID}" and Collection "${COLLECTION_ID}" exist in your Appwrite project.`
        );
      } else if (err.message) {
        throw new Error(`APPWRITE CLOUD ERROR (${err.code || 'STATUS'}) // ${err.message}`);
      }
      throw err;
    }
  }

  // 5. Fallback Local Storage Persistence (Ensures site never breaks during testing/development)
  try {
    const existing = JSON.parse(localStorage.getItem('blackout_recovery_cells') || '[]');
    existing.push(payload);
    localStorage.setItem('blackout_recovery_cells', JSON.stringify(existing));
  } catch {
    // ignore storage errors
  }

  return {
    success: true,
    clearanceToken,
    message: isAppwriteConfigured()
      ? 'TRANSMISSION CONFIRMED // Local shelter ledger updated.'
      : 'TRANSMISSION CONFIRMED // Clearance token established (Offline Test Mode active).',
    offlineMode: !isAppwriteConfigured(),
  };
}
