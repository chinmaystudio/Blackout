import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

interface Member {
  name?: string;
  email?: string;
}

interface RegistrationPayload {
  cellName?: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  leadCollege?: string;
  teamSize?: number;
  members?: Member[] | string;
  clearanceToken?: string;
}

/**
 * Vercel Serverless Function: /api/send-confirmation
 * 
 * Sends an atmospheric, wasteland-themed clearance pass email
 * to the registered squad lead and all companion operatives via SMTP.
 */
export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse & { json?: (data: any) => void; status?: (code: number) => any }
) {
  // CORS & Header Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  try {
    // Parse incoming request body
    let body: RegistrationPayload = {};
    if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
    } else {
      const buffers: Buffer[] = [];
      for await (const chunk of req) {
        buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBody = Buffer.concat(buffers).toString('utf-8');
      if (rawBody.trim()) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = {};
        }
      }
    }

    const cellName = body.cellName || 'UNKNOWN RECOVERY CELL';
    const leadName = body.leadName || 'LEAD OPERATIVE';
    const leadEmail = body.leadEmail ? body.leadEmail.trim() : '';
    const leadCollege = body.leadCollege || 'PCCOE Pune';
    const teamSize = body.teamSize || 2;
    const clearanceToken = body.clearanceToken || 'RC-TEMP-2026';

    if (!leadEmail) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Missing required leadEmail.' }));
      return;
    }

    // Parse companion members
    let members: Member[] = [];
    if (typeof body.members === 'string') {
      try {
        members = JSON.parse(body.members);
      } catch {
        members = [];
      }
    } else if (Array.isArray(body.members)) {
      members = body.members;
    }

    // Compile recipient list (Lead + Companions)
    const recipientEmails: string[] = [leadEmail];
    members.forEach((m) => {
      if (m.email && m.email.trim()) {
        const cleanEmail = m.email.trim();
        if (!recipientEmails.includes(cleanEmail)) {
          recipientEmails.push(cleanEmail);
        }
      }
    });

    // Companion Roster Rows
    const companionListHtml = members.length > 0
      ? members.map((m, i) => `
          <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.15);">
            <td style="padding: 9px 12px; color: #f59e0b; font-weight: bold;">Operative 0${i + 2}</td>
            <td style="padding: 9px 12px; color: #ffffff;">${m.name || 'Pending Verification'}</td>
            <td style="padding: 9px 12px; color: #9ca3af;">${m.email || '—'}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" style="padding: 9px 12px; color: #9ca3af;">No additional companions listed.</td></tr>';

    const emailSubject = `☢ [HELIOS CLEARANCE] Recovery Cell Authorized // Call Sign: ${cellName} [${clearanceToken}]`;

    // Responsive Wasteland-Themed HTML Email
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Tactical Clearance Pass</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; border-radius: 0 !important; }
          .email-padding { padding: 16px !important; }
          .clearance-token { font-size: 22px !important; letter-spacing: 2px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 16px 8px; background-color: #080706; font-family: 'Courier New', Courier, monospace, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #0f0d0a; border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 6px; box-shadow: 0 10px 40px rgba(0,0,0,0.9);" class="email-container">
        
        <!-- Header Banner -->
        <tr>
          <td style="padding: 24px 24px 18px 24px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); background: #14110d;" class="email-padding">
            <div style="font-size: 11px; letter-spacing: 3px; color: #f59e0b; font-weight: bold; margin-bottom: 6px;">GDGC PCCOE PUNE // DEFENSE CORPS</div>
            <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
              BLACK<span style="color: #f59e0b;">☢</span>UT // CLEARANCE DOSSIER
            </h1>
            <div style="font-size: 11px; color: #9ca3af; letter-spacing: 1px; margin-top: 5px;">12-HOUR ALTERNATE-REALITY INVESTIGATION & HACKATHON</div>
          </td>
        </tr>

        <!-- Clearance Pass Badge -->
        <tr>
          <td style="padding: 24px;" class="email-padding">
            <div style="background: rgba(245, 158, 11, 0.08); border: 2px solid #f59e0b; border-radius: 4px; padding: 18px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">AUTHORIZED CLEARANCE ID</div>
              <div style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #f59e0b; margin: 8px 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);" class="clearance-token">
                ${clearanceToken}
              </div>
              <div style="font-size: 10px; color: #34d399; letter-spacing: 1.5px; font-weight: bold;">● STATUS: RECORDED IN HELIOS ARCHIVES</div>
            </div>

            <!-- Unit Dossier Details -->
            <div style="font-size: 12px; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 10px;">RECOVERY CELL DETAILS</div>
            <table role="presentation" width="100%" style="font-size: 12px; border-collapse: collapse; margin-bottom: 24px; background: rgba(0,0,0,0.35); border-radius: 4px;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 10px; color: #9ca3af; width: 40%;">CALL SIGN (TEAM)</td>
                <td style="padding: 10px; color: #ffffff; font-weight: bold;">${cellName}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 10px; color: #9ca3af;">LEAD OPERATIVE</td>
                <td style="padding: 10px; color: #ffffff; font-weight: bold;">${leadName}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 10px; color: #9ca3af;">INSTITUTION</td>
                <td style="padding: 10px; color: #ffffff;">${leadCollege}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #9ca3af;">SQUAD COMPOSITION</td>
                <td style="padding: 10px; color: #ffffff;">${teamSize} Operatives</td>
              </tr>
            </table>

            <!-- Squad Roster -->
            <div style="font-size: 12px; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 10px;">SQUAD ROSTER</div>
            <table role="presentation" width="100%" style="font-size: 11px; border-collapse: collapse; margin-bottom: 24px; background: rgba(0,0,0,0.35); border-radius: 4px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.08);">
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">UNIT ROLE</th>
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">NAME</th>
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">COMMS EMAIL</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.15);">
                  <td style="padding: 9px 12px; color: #f59e0b; font-weight: bold;">Operative 01 (Lead)</td>
                  <td style="padding: 9px 12px; color: #ffffff;">${leadName}</td>
                  <td style="padding: 9px 12px; color: #9ca3af;">${leadEmail}</td>
                </tr>
                ${companionListHtml}
              </tbody>
            </table>

            <!-- Mission Instructions -->
            <div style="background: rgba(52, 211, 153, 0.08); border-left: 3px solid #34d399; padding: 14px; font-size: 11px; line-height: 1.6; color: #d1d5db; margin-bottom: 24px;">
              <strong style="color: #34d399; display: block; margin-bottom: 4px;">MISSION CHECK-IN PROTOCOL:</strong>
              • Report to the verification desk at <strong>PCCOE Pune</strong> on event day.<br>
              • Present your Call Sign (<strong>${cellName}</strong>) and Clearance Token (<strong>${clearanceToken}</strong>).<br>
              • Keep this transmission accessible on your mobile terminal for entry authorization.
            </div>

            <!-- Barcode Graphic -->
            <div style="height: 16px; background: repeating-linear-gradient(90deg, #f59e0b, #f59e0b 2px, transparent 2px, transparent 4px, #f59e0b 4px, #f59e0b 6px, transparent 6px, transparent 8px); opacity: 0.6; margin-bottom: 16px;"></div>

            <div style="font-size: 10px; color: #6b7280; text-align: center; letter-spacing: 1px;">
              CRYPTOGRAPHIC AUTHENTICATION PROTOCOL // SECURE TRANSIT 2.0<br>
              DIRECTIVE AFTERLIGHT // GDGC PCCOE PUNE
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Read SMTP settings from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const senderEmail = process.env.SENDER_EMAIL || smtpUser || 'blackout@pccoe.ac.in';

    // If SMTP credentials are configured, dispatch via Nodemailer
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: senderEmail.includes('<') ? senderEmail : `"GDGC BLACKOUT" <${senderEmail}>`,
        to: recipientEmails.join(', '),
        subject: emailSubject,
        html: emailHtml,
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        dispatched: true,
        messageId: info.messageId,
        recipients: recipientEmails,
        clearanceToken,
        message: `Clearance transmission sent to ${recipientEmails.length} operative(s).`,
      }));
      return;
    }

    // If SMTP credentials are not yet configured in environment variables
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      dispatched: false,
      configured: false,
      recipients: recipientEmails,
      clearanceToken,
      message: 'Registration recorded; SMTP credentials pending in Vercel environment variables.',
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: err.message || 'Internal server error during email dispatch.',
    }));
  }
}
