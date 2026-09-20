# ☢ BLACKOUT // APPWRITE BACKEND & AUTOMATED EMAIL SETUP GUIDE

This guide walks you through connecting your **Appwrite Cloud** database to the BLACKOUT registration form and enabling automated custom confirmation emails.

---

## Part 1: Appwrite Cloud Database Setup (5 Minutes)

### 1. Log in to Appwrite Cloud
- Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
- Sign in or create a free account.
- Create a new project (e.g., **`BLACKOUT`**).
- Copy your **Project ID** from the project dashboard.

### 2. Create the Database
1. Go to **Databases** in the left sidebar.
2. Click **+ Create database**.
3. Name: `blackout_db`
4. Database ID: `blackout_db` (Click the pencil/custom ID icon and type `blackout_db`).
5. Click **Create**.

### 3. Create the Collection
1. Inside `blackout_db`, click **+ Create collection**.
2. Name: `registrations`
3. Collection ID: `registrations` (Custom ID: `registrations`).
4. Click **Create**.

### 4. Create the Collection Attributes
Inside the `registrations` collection, click the **Attributes** tab, then add the following 10 attributes:

| Type | Key | Size / Limits | Required | Default Value |
| :--- | :--- | :--- | :--- | :--- |
| **String** | `cellName` | 255 | ✅ Yes | — |
| **String** | `leadName` | 255 | ✅ Yes | — |
| **Email** | `leadEmail` | — | ✅ Yes | — |
| **String** | `leadPhone` | 50 | ✅ Yes | — |
| **String** | `leadCollege` | 255 | ✅ Yes | — |
| **Integer** | `teamSize` | min: 2, max: 4 | ✅ Yes | — |
| **String** | `members` | 5000 | ✅ Yes | — |
| **String** | `clearanceToken` | 50 | ✅ Yes | — |
| **String** | `faction` | 100 | ❌ No | `Unassigned` |
| **String** | `createdAt` | 50 | ✅ Yes | — |

> 💡 *Note: `members` is stored as a JSON string containing companion operative names and emails.*

### 5. Configure Permissions (CRITICAL)
1. Still inside the `registrations` collection, click the **Settings** tab.
2. Scroll down to **Permissions**.
3. Click **+ Add role** and choose **`Any`** (or type `any`).
4. Check **`Create`** ONLY.
   - ⚠️ Do **NOT** check `Read`, `Update`, or `Delete` for `Any`. This protects registered students' private emails and contact numbers from being read by unauthenticated visitors.
5. Click **Update** at the bottom right.

---

## Part 2: Connect Frontend to Appwrite

Open the [`.env`](file:///.env) file in your project root and paste your **Project ID**:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_actual_project_id_here
VITE_APPWRITE_DATABASE_ID=blackout_db
VITE_APPWRITE_COLLECTION_ID=registrations
```

Save the file and restart your dev server if needed (`npm run dev`).

---

## Part 3: Automated Custom Confirmation Email Function

We have already created the complete cloud function code inside:
[`functions/send-registration-email/`](file:///functions/send-registration-email/)

### Deploying the Function in Appwrite:

#### Step 1: Create the Function in Appwrite Console
1. In your Appwrite project dashboard, click **Functions** in the left sidebar.
2. Click **+ Create function**.
3. Name: `send-registration-email`
4. Runtime: **`Node.js 18.0`** (or `Node.js 20.0`)
5. Click **Next**.

#### Step 2: Set the Execution Event Trigger
1. In the **Events** configuration:
2. Add event:
   ```text
   databases.blackout_db.collections.registrations.documents.*.create
   ```
   *(Or click "Add Event" > Select `databases.[any].collections.[any].documents.[any].create`)*
3. This ensures the function runs automatically whenever a new team registers!

#### Step 3: Configure Email Credentials (Environment Variables)
Under the function's **Settings > Variables**, add your email provider credentials:

##### Choice A: Using Resend (Recommended - 3,000 free emails/month, 1 API key)
Get a free key at [https://resend.com](https://resend.com):
- `RESEND_API_KEY` = `re_your_api_key_here`
- `SENDER_EMAIL` = `onboarding@resend.dev` *(or your verified domain like `contact@yourdomain.com`)*

##### Choice B: Using Gmail or Brevo SMTP
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = `your-email@gmail.com`
- `SMTP_PASS` = `your-16-digit-app-password` *(from Google Account > Security > 2-Step Verification > App passwords)*
- `SENDER_EMAIL` = `your-email@gmail.com`

#### Step 4: Upload Function Code
- **Method 1 (Git Deployment)**: If this repo is linked to GitHub in Appwrite, select the `functions/send-registration-email` directory as root directory.
- **Method 2 (Manual Zip)**:
  1. Compress the contents of `functions/send-registration-email/` into a `.tar.gz` or `.zip`.
  2. In Appwrite Function > **Deployments** > Click **Create deployment** > Upload.
  3. Entrypoint: `src/main.js`

---

## Part 4: Verification & Live Test

1. Open [http://localhost:5173/#/register](http://localhost:5173/#/register) in your browser.
2. Fill in a test registration:
   - Call Sign: `Apex Protocol`
   - Squad: `2 Operatives`
   - Lead Name: Your Name
   - Comms Email: Your actual email address
   - Phone: `+91 98765 43210`
   - Companion Name & Email
3. Click **TRANSMIT SQUAD ENLISTMENT >>**.
4. Results to verify:
   - **Frontend**: Shows the tactical clearance badge with your unique token (e.g. `RC-7F9A-2026`).
   - **Appwrite Console**: Go to **Databases > registrations > Documents** — the document will be saved!
   - **Your Email**: Check your inbox — you will receive the custom clearance dossier email with your team details!
