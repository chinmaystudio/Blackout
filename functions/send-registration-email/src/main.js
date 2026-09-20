import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Appwrite Cloud Function: send-registration-email
 * 
 * Trigger: Event `databases.*.collections.registrations.documents.*.create`
 * 
 * Automatically sends an atmospheric, wasteland-themed clearance pass email
 * to the registered squad lead and companion operatives.
 */
export default async ({ req, res, log, error }) => {
  try {
    // 1. Parse incoming document payload from Appwrite trigger
    let data;
    if (typeof req.body === 'string') {
      try {
        data = JSON.parse(req.body);
      } catch {
        data = {};
      }
    } else {
      data = req.body || {};
    }

    // Appwrite sends document data directly or wrapped in $data
    const doc = data.$data || data;

    const cellName = doc.cellName || 'UNKNOWN UNIT';
    const leadName = doc.leadName || 'LEAD OPERATIVE';
    const leadEmail = doc.leadEmail;
    const leadCollege = doc.leadCollege || 'PCCOE Pune';
    const teamSize = doc.teamSize || 2;
    const clearanceToken = doc.clearanceToken || 'RC-TEMP-2026';

    if (!leadEmail) {
      log('No lead email found in registration document. Skipping email dispatch.');
      return res.json({ success: false, message: 'Missing leadEmail in payload.' });
    }

    // Parse companion members
    let members = [];
    if (typeof doc.members === 'string') {
      try {
        members = JSON.parse(doc.members);
      } catch {
        members = [];
      }
    } else if (Array.isArray(doc.members)) {
      members = doc.members;
    }

    log(`Processing registration confirmation for ${cellName} (${clearanceToken}) -> ${leadEmail}`);

    // Build recipient list (Lead email + companion emails if present)
    const recipientEmails = [leadEmail];
    members.forEach((m) => {
      if (m.email && m.email.trim() && !recipientEmails.includes(m.email.trim())) {
        recipientEmails.push(m.email.trim());
      }
    });

    // 2. Compose Wasteland-Themed HTML Email
    const companionListHtml = members.length > 0
      ? members.map((m, i) => `
          <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.15);">
            <td style="padding: 8px 12px; color: #f59e0b; font-weight: bold;">Operative 0${i + 2}</td>
            <td style="padding: 8px 12px; color: #ffffff;">${m.name || 'Pending'}</td>
            <td style="padding: 8px 12px; color: #9ca3af;">${m.email || '—'}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" style="padding: 8px 12px; color: #9ca3af;">No additional companions listed.</td></tr>';

    const emailSubject = `☢ [HELIOS CLEARANCE] Recovery Cell Authorized // Call Sign: ${cellName} [${clearanceToken}]`;

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Tactical Clearance Pass</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 24px; background-color: #080706; font-family: 'Courier New', Courier, monospace, sans-serif; color: #f3f4f6;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #0f0d0a; border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 6px; box-shadow: 0 10px 40px rgba(0,0,0,0.9);">
        
        <!-- Header Banner -->
        <tr>
          <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); background: #14110d;">
            <div style="font-size: 11px; letter-spacing: 3px; color: #f59e0b; font-weight: bold; margin-bottom: 6px;">GDGC PCCOE PUNE // DEFENSE CORPS</div>
            <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
              BLACK<span style="color: #f59e0b;">☢</span>UT // CLEARANCE DOSSIER
            </h1>
            <div style="font-size: 11px; color: #9ca3af; letter-spacing: 1px; margin-top: 4px;">12-HOUR ALTERNATE-REALITY INVESTIGATION & HACKATHON</div>
          </td>
        </tr>

        <!-- Clearance Pass Badge -->
        <tr>
          <td style="padding: 24px;">
            <div style="background: rgba(245, 158, 11, 0.08); border: 2px solid #f59e0b; border-radius: 4px; padding: 18px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">AUTHORIZED CLEARANCE ID</div>
              <div style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #f59e0b; margin: 8px 0; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);">
                ${clearanceToken}
              </div>
              <div style="font-size: 10px; color: #34d399; letter-spacing: 1.5px; font-weight: bold;">● STATUS: RECORDED IN HELIOS ARCHIVES</div>
            </div>

            <!-- Unit Dossier Details -->
            <div style="font-size: 12px; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 10px;">RECOVERY CELL DETAILS</div>
            <table role="presentation" width="100%" style="font-size: 12px; border-collapse: collapse; margin-bottom: 24px; background: rgba(0,0,0,0.3); border-radius: 4px;">
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

            <!-- Companion Roster -->
            <div style="font-size: 12px; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 10px;">SQUAD ROSTER</div>
            <table role="presentation" width="100%" style="font-size: 11px; border-collapse: collapse; margin-bottom: 24px; background: rgba(0,0,0,0.3); border-radius: 4px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.08);">
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">UNIT ROLE</th>
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">NAME</th>
                  <th style="padding: 8px 12px; text-align: left; color: #f59e0b;">COMMS EMAIL</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid rgba(245, 158, 11, 0.15);">
                  <td style="padding: 8px 12px; color: #f59e0b; font-weight: bold;">Operative 01 (Lead)</td>
                  <td style="padding: 8px 12px; color: #ffffff;">${leadName}</td>
                  <td style="padding: 8px 12px; color: #9ca3af;">${leadEmail}</td>
                </tr>
                ${companionListHtml}
              </tbody>
            </table>

            <!-- Mission Instructions -->
            <div style="background: rgba(52, 211, 153, 0.08); border-left: 3px solid #34d399; padding: 14px; font-size: 11px; line-height: 1.6; color: #d1d5db; margin-bottom: 24px;">
              <strong style="color: #34d399; display: block; margin-bottom: 4px;">MISSION CHECK-IN PROTOCOL:</strong>
              • Report to the verification desk at <strong>PCCOE Pune</strong> on event day.<br>
              • Provide your Call Sign (<strong>${cellName}</strong>) and Clearance Token (<strong>${clearanceToken}</strong>).<br>
              • Keep this transmission accessible on your mobile terminal for entry authorization.
            </div>

            <!-- Barcode Graphic -->
            <div style="height: 18px; background: repeating-linear-gradient(90deg, #f59e0b, #f59e0b 2px, transparent 2px, transparent 4px, #f59e0b 4px, #f59e0b 6px, transparent 6px, transparent 8px); opacity: 0.6; margin-bottom: 16px;"></div>

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

    // 3. Dispatch Email via Configured Provider
    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const senderEmail = process.env.SENDER_EMAIL || 'blackout@resend.dev';

    let dispatched = false;

    // Option 1: Resend Provider (Recommended)
    if (resendApiKey && resendApiKey.trim() !== '') {
      log('Dispatching email via Resend API...');
      const resend = new Resend(resendApiKey);

      const { data: sendResult, error: sendError } = await resend.emails.send({
        from: senderEmail.includes('<') ? senderEmail : `GDGC BLACKOUT <${senderEmail}>`,
        to: recipientEmails,
        subject: emailSubject,
        html: emailHtml,
      });

      if (sendError) {
        error(`Resend dispatch error: ${JSON.stringify(sendError)}`);
      } else {
        log(`Confirmation email successfully dispatched via Resend to ${recipientEmails.join(', ')} [ID: ${sendResult?.id}]`);
        dispatched = true;
      }
    }

    // Option 2: Standard SMTP / Nodemailer (Gmail, Brevo, Outlook, etc.)
    if (!dispatched && smtpHost && smtpUser && smtpPass) {
      log('Dispatching email via SMTP Transport...');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
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

      log(`Confirmation email successfully dispatched via SMTP [MessageID: ${info.messageId}]`);
      dispatched = true;
    }

    // Fallback: When no API key is yet configured, log for testing
    if (!dispatched) {
      log('NOTE: No RESEND_API_KEY or SMTP credentials configured in Function Variables.');
      log(`Prepared email for: ${recipientEmails.join(', ')} with subject: "${emailSubject}"`);
      log(`Clearance token: ${clearanceToken}`);
    }

    return res.json({
      success: true,
      dispatched,
      recipients: recipientEmails,
      clearanceToken,
      message: dispatched
        ? `Clearance confirmation dispatched to ${recipientEmails.length} operative(s).`
        : 'Clearance recorded; email delivery simulated (set RESEND_API_KEY or SMTP credentials in Appwrite to send live).',
    });
  } catch (err) {
    error(`Unexpected execution error: ${err.message}`);
    return res.json({ success: false, error: err.message });
  }
};
