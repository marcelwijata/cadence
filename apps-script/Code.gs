// Cadence — Google Apps Script backend
// Deploy as: Web App > Execute as: Me > Who has access: Only myself
//
// One-time setup:
//   1. Go to script.google.com → New project → name it "AYANA Today"
//   2. Paste this file as Code.gs
//   3. Add a new HTML file named "Index" → paste asana-today.html contents
//   4. Edit saveToken() below → paste your Asana PAT → run once → delete the string
//   5. Deploy → New deployment → Web app → Execute as Me → Only myself
//   6. Bookmark the URL on your phone

const CACHE_KEY = 'asana_tasks_v2';
const CACHE_TTL = 300; // 5 minutes

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Cadence')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Called from client via google.script.run.getTasksAndProfile()
 * Returns { user: {...}, tasks: [...] }
 */
function getTasksAndProfile() {
  const cache = CacheService.getUserCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);

  const pat = PropertiesService.getUserProperties().getProperty('ASANA_PAT');
  if (!pat) throw new Error('NO_TOKEN');

  const headers = { Authorization: 'Bearer ' + pat };

  // User profile
  const meRes = UrlFetchApp.fetch(
    'https://app.asana.com/api/1.0/users/me?opt_fields=gid,name,photo,workspaces',
    { headers, muteHttpExceptions: true }
  );
  if (meRes.getResponseCode() !== 200) throw new Error('INVALID_TOKEN');
  const me = JSON.parse(meRes.getContentText()).data;
  const wsGid = me.workspaces[0].gid;

  // Fetch all incomplete tasks (paginated)
  let tasks = [], offset = null;
  do {
    const params = {
      assignee: 'me',
      workspace: wsGid,
      opt_fields: 'gid,name,due_on,projects.name',
      completed_since: 'now',
      limit: '100'
    };
    if (offset) params.offset = offset;
    const url = 'https://app.asana.com/api/1.0/tasks?' +
      Object.entries(params).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
    const res = UrlFetchApp.fetch(url, { headers, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('Asana fetch error: ' + res.getResponseCode());
    const data = JSON.parse(res.getContentText());
    tasks = tasks.concat(data.data);
    offset = data.next_page ? data.next_page.offset : null;
  } while (offset);

  const result = { user: me, tasks };
  cache.put(CACHE_KEY, JSON.stringify(result), CACHE_TTL);
  return result;
}

/**
 * Run once from the Apps Script editor to store your PAT.
 * Paste your token, run this function, then delete the string.
 */
function saveToken() {
  const token = 'PASTE_YOUR_PAT_HERE';
  PropertiesService.getUserProperties().setProperty('ASANA_PAT', token);
  CacheService.getUserCache().remove(CACHE_KEY);
  Logger.log('Token saved. Delete the token string from saveToken() now.');
}

function checkToken() {
  const t = PropertiesService.getUserProperties().getProperty('ASANA_PAT');
  Logger.log(t ? 'Token present: ' + t.slice(0, 8) + '...' : 'No token set.');
}

function clearCache() {
  CacheService.getUserCache().remove(CACHE_KEY);
  Logger.log('Cache cleared.');
}
