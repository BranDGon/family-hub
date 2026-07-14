/* ===== Family Hub shared code =====
   Loaded by every page. Your keys live here, in ONE place. */

const SUPABASE_URL = 'PASTE-YOUR-PROJECT-URL-HERE';
const SUPABASE_KEY = 'PASTE-YOUR-PUBLISHABLE-KEY-HERE';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
