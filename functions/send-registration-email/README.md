# Appwrite Cloud Function: send-registration-email

Automatically dispatches a custom post-apocalyptic clearance confirmation email whenever a new squad registers for BLACKOUT: FALLOUT.

## Triggers
- Event: `databases.*.collections.registrations.documents.*.create`

## Environment Variables
Set these in **Function Settings > Variables** in the Appwrite Console:

### Option 1: Resend (Recommended)
- `RESEND_API_KEY`: API key from [resend.com](https://resend.com)
- `SENDER_EMAIL`: e.g. `onboarding@resend.dev` or `noreply@yourdomain.com`

### Option 2: Custom SMTP (Gmail, Brevo, SendGrid, etc.)
- `SMTP_HOST`: e.g. `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: your username/email
- `SMTP_PASS`: your SMTP or app password
- `SMTP_SECURE`: `false` (or `true` for port 465)
- `SENDER_EMAIL`: your sender email
