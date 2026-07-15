/* ===== Family Hub shared code =====
   Loaded by every page. Your keys live here, in ONE place. */

const SUPABASE_URL = 'https://lsfnfvanmidcesklxpoz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NUiXhSLwm5fNIzGll1QlOA_Hhr9MHe7';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ----- Family account IDs -----
   Copy each kid's UUID from Authentication -> Users in Supabase.
   Used to stamp assignments with the account they belong to,
   which is what the security policies check. */
const FAMILY_IDS = {
  'Avery': '9c775046-7ac0-4e98-96c0-871169d4f1e7',
  'Evan':  '9d9f6a26-f4b3-4966-a0da-83a152810bf2'
};

/* ----- Helpers ----- */

/* Create an element with a class and text in one line */
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* "elena@example.com" -> "Elena" */
function displayName(user) {
  const name = user.email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* "2026-08-15" -> "Aug 15" */
function fmtDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString.slice(0, 10) + 'T00:00:00')
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* Give each subject a consistent chip color: the same subject
   always hashes to the same number, so "Math" is the same color
   everywhere, every day, on every page. */
function subjectChipClass(subject) {
  let sum = 0;
  for (const ch of subject.toLowerCase()) sum += ch.charCodeAt(0);
  return 'chip chip-' + (sum % 6);
}

/* ----- Profile photos (Supabase Storage) ----- */

/* Ask Storage for a temporary, family-only link to this
   person's photo. Returns null if they haven't uploaded one. */
async function avatarUrl(userId) {
  const { data, error } = await db.storage
    .from('avatars')
    .createSignedUrl(userId + '.jpg', 3600);   /* link lasts 1 hour */
  return error ? null : data.signedUrl;
}

/* Shrink a chosen photo to a small square BEFORE uploading,
   so a 4 MB phone photo becomes a ~30 KB avatar. */
async function shrinkImage(file, size = 256) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;   /* crop to centered square */
  const sy = (bitmap.height - side) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d').drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}

/* ----- Auth guard -----
   Every protected page calls this first. If nobody is signed in,
   the visitor is sent to the login page. Otherwise the signed-in
   user is returned and the page continues.                        */
async function requireAuth() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    window.location.href = 'index.html';
    return null;
  }
  return data.session.user;
}

/* ----- Navigation -----
   Builds the same nav bar on every page. To add a page to the
   whole site, add one line to this list.                        */
const PAGES = [
  ['index.html',  'Goals'],
  ['avery.html',  'Avery'],
  ['evan.html',   'Evan'],
  ['parent.html', 'Parents']
];

function mountNav(activeFile) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  for (const [file, label] of PAGES) {
    const link = el('a', file === activeFile ? 'active' : null, label);
    link.href = file;
    nav.appendChild(link);
  }
}
