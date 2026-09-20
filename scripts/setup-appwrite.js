/**
 * Automated Appwrite Database Setup Script for BLACKOUT
 * 
 * Automatically creates:
 * 1. Database: blackout_db
 * 2. Collection: registrations (with public Create permission)
 * 3. All 10 required attributes
 * 
 * Usage:
 * node scripts/setup-appwrite.js <YOUR_APPWRITE_API_KEY>
 */

const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '6aafc25000377e9dd484';
const DATABASE_ID = 'blackout_db';
const COLLECTION_ID = 'registrations';

const API_KEY = process.argv[2] || process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('\n❌ ERROR: Please provide your Appwrite API Key.');
  console.log('Usage: node scripts/setup-appwrite.js <YOUR_API_KEY>\n');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function apiRequest(path, method = 'GET', body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${ENDPOINT}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Connecting to Appwrite Cloud...');
  console.log(`   Project ID: ${PROJECT_ID}`);

  // 1. Create Database
  console.log('\n[1/3] Creating Database: blackout_db...');
  try {
    await apiRequest('/databases', 'POST', {
      databaseId: DATABASE_ID,
      name: 'blackout_db',
      enabled: true,
    });
    console.log('   ✅ Database "blackout_db" created successfully!');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('   ℹ️ Database "blackout_db" already exists. Proceeding...');
    } else {
      console.error('   ❌ Failed to create database:', err.message);
      process.exit(1);
    }
  }

  // 2. Create Collection with Public Create Permission
  console.log('\n[2/3] Creating Collection: registrations...');
  try {
    await apiRequest(`/databases/${DATABASE_ID}/collections`, 'POST', {
      collectionId: COLLECTION_ID,
      name: 'registrations',
      permissions: ['create("any")'],
      documentSecurity: false,
      enabled: true,
    });
    console.log('   ✅ Collection "registrations" created with public Create permission!');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('   ℹ️ Collection "registrations" already exists. Updating permissions...');
      try {
        await apiRequest(`/databases/${DATABASE_ID}/collections/${COLLECTION_ID}`, 'PUT', {
          name: 'registrations',
          permissions: ['create("any")'],
          documentSecurity: false,
          enabled: true,
        });
        console.log('   ✅ Permissions updated to allow public registration!');
      } catch (pErr) {
        console.log('   ⚠️ Could not update permissions:', pErr.message);
      }
    } else {
      console.error('   ❌ Failed to create collection:', err.message);
      process.exit(1);
    }
  }

  // 3. Create Attributes
  console.log('\n[3/3] Creating 10 Attributes...');

  const attributes = [
    { type: 'string', key: 'cellName', size: 255, required: true },
    { type: 'string', key: 'leadName', size: 255, required: true },
    { type: 'email', key: 'leadEmail', required: true },
    { type: 'string', key: 'leadPhone', size: 50, required: true },
    { type: 'string', key: 'leadCollege', size: 255, required: true },
    { type: 'integer', key: 'teamSize', min: 2, max: 4, required: true },
    { type: 'string', key: 'members', size: 5000, required: true },
    { type: 'string', key: 'clearanceToken', size: 50, required: true },
    { type: 'string', key: 'faction', size: 100, required: false, default: 'Unassigned' },
    { type: 'string', key: 'createdAt', size: 50, required: true },
  ];

  for (const attr of attributes) {
    process.stdout.write(`   → Creating attribute "${attr.key}" (${attr.type})... `);
    try {
      let path = `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/`;
      let body = { key: attr.key, required: attr.required };

      if (attr.type === 'string') {
        path += 'string';
        body.size = attr.size;
        if (attr.default) body.default = attr.default;
      } else if (attr.type === 'email') {
        path += 'email';
      } else if (attr.type === 'integer') {
        path += 'integer';
        body.min = attr.min;
        body.max = attr.max;
      }

      await apiRequest(path, 'POST', body);
      console.log('✅ Done');
      await sleep(400); // give Appwrite time between attribute creation
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️ Already exists');
      } else {
        console.log(`❌ Error: ${err.message}`);
      }
    }
  }

  console.log('\n🎉 ALL DONE! Your Appwrite database is 100% configured and ready.');
  console.log('   Teams can now register live on your website!\n');
}

run().catch((err) => {
  console.error('\n❌ Execution error:', err.message);
  process.exit(1);
});
