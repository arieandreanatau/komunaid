/**
 * KomunaID API Integration Test
 * Run: node tests/integration.test.mjs
 * Requires: API server running on http://localhost:3001
 */

const BASE = process.env.API_URL || "http://localhost:3001";
const API = `${BASE}/api/v1`;

let passed = 0;
let failed = 0;
const results = [];

function log(result) {
  results.push(result);
  if (result.status === "PASS") {
    passed++;
    console.log(`  \x1b[32mPASS\x1b[0m ${result.name}`);
  } else {
    failed++;
    console.log(
      `  \x1b[31mFAIL\x1b[0m ${result.name} — expected ${result.expectedCode}, got ${result.code} | ${result.error || result.message || ""}`
    );
  }
}

function extractCookies(headers) {
  const setCookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  if (setCookies.length === 0) {
    const raw = headers.get("set-cookie");
    if (raw) return raw.split(";")[0];
    return "";
  }
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

function uniqId() {
  return Math.random().toString(36).substring(2, 10);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let csrfToken = "";

async function ensureCsrf() {
  if (csrfToken) return;
  const res = await fetch(`${API}/communities`, { method: "GET", headers: { "Content-Type": "application/json" } });
  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  for (const c of setCookies) {
    const m = c.match(/csrf_token=([^;]+)/);
    if (m) { csrfToken = m[1]; return; }
  }
  const raw = res.headers.get("set-cookie");
  if (raw) { const m = raw.match(/csrf_token=([^;]+)/); if (m) csrfToken = m[1]; }
}

async function req(method, path, body, cookie, extraHeaders) {
  await ensureCsrf();
  await sleep(200);

  const headers = { "Content-Type": "application/json", ...extraHeaders };
  const cookieParts = [];
  if (csrfToken) cookieParts.push(`csrf_token=${csrfToken}`);
  if (cookie) cookieParts.push(cookie);
  if (cookieParts.length) headers["Cookie"] = cookieParts.join("; ");
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    headers["x-csrf-token"] = csrfToken;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });

  let data = null;
  try { data = await res.json(); } catch { data = null; }

  const serverCookies = extractCookies(res.headers);
  if (serverCookies) {
    const m = serverCookies.match(/csrf_token=([^;]+)/);
    if (m) csrfToken = m[1];
  }

  return { status: res.status, data, cookies: serverCookies, rawHeaders: res.headers };
}

const testUser = {
  name: "Test User",
  username: `testuser_${uniqId()}`,
  email: `testuser_${uniqId()}@test.com`,
  password: "Test1234",
  confirmPassword: "Test1234",
};

const testUser2 = {
  name: "Test User 2",
  username: `testuser2_${uniqId()}`,
  email: `testuser2_${uniqId()}@test.com`,
  password: "Test1234",
  confirmPassword: "Test1234",
};

let userCookie = "";
let user2Cookie = "";
let createdCommunityId = "";
let createdCommunitySlug = "";
let createdOrgId = "";

async function runTests() {
  console.log("\n\x1b[1m========================================\x1b[0m");
  console.log("\x1b[1m  KomunaID API Integration Tests\x1b[0m");
  console.log("\x1b[1m========================================\x1b[0m\n");

  // === 1. REGISTRASI ===
  console.log("\x1b[1m1. Registrasi\x1b[0m");

  { const r = await req("POST", "/auth/register", testUser);
    log({ name: "Register data valid → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message });
    if (r.status === 201) userCookie = extractCookies(r.rawHeaders); }

  { const r = await req("POST", "/auth/register", testUser2);
    log({ name: "Register user kedua → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message });
    if (r.status === 201) user2Cookie = extractCookies(r.rawHeaders); }

  { const r = await req("POST", "/auth/register", testUser);
    log({ name: "Email duplikat → 409", status: r.status === 409 ? "PASS" : "FAIL", code: r.status, expectedCode: 409, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { ...testUser, email: `new_${uniqId()}@test.com` });
    log({ name: "Username duplikat → 409", status: r.status === 409 ? "PASS" : "FAIL", code: r.status, expectedCode: 409, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { name: "Test", username: `nm_${uniqId()}`, email: `nm_${uniqId()}@test.com`, password: "Test1234", confirmPassword: "Different1" });
    log({ name: "Password tidak cocok → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { name: "Test", username: `wk_${uniqId()}`, email: `wk_${uniqId()}@test.com`, password: "test1234", confirmPassword: "test1234" });
    log({ name: "Password lemah (no uppercase) → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { name: "", username: "", email: "", password: "", confirmPassword: "" });
    log({ name: "Field kosong → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { name: "Test", username: `be_${uniqId()}`, email: "bukan-email", password: "Test1234", confirmPassword: "Test1234" });
    log({ name: "Email tidak valid → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/auth/register", { name: "Test", username: "bad username!", email: `bu_${uniqId()}@test.com`, password: "Test1234", confirmPassword: "Test1234" });
    log({ name: "Username tidak valid → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  // === 2. LOGIN MEMBER ===
  console.log("\n\x1b[1m2. Login sebagai Member\x1b[0m");

  { const r = await req("POST", "/auth/login", { identifier: testUser.email, password: testUser.password });
    log({ name: "Login dengan email → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message });
    if (r.status === 200) userCookie = extractCookies(r.rawHeaders); }

  { const r = await req("POST", "/auth/login", { identifier: testUser.username, password: testUser.password });
    log({ name: "Login dengan username → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message });
    if (r.status === 200) userCookie = extractCookies(r.rawHeaders); }

  { const r = await req("POST", "/auth/login", { identifier: testUser.email, password: "WrongPass1" });
    log({ name: "Password salah → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message }); }

  { const r = await req("POST", "/auth/login", { identifier: "nonexistent@test.com", password: "Test1234" });
    log({ name: "User tidak ditemukan → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message }); }

  { const r = await req("POST", "/auth/login", { identifier: "", password: "" });
    log({ name: "Field kosong → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/auth/login", {});
    log({ name: "Tanpa identifier → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  // === 3. LOGOUT ===
  console.log("\n\x1b[1m3. Logout\x1b[0m");

  { const r = await req("POST", "/auth/logout", undefined, userCookie);
    log({ name: "Logout dengan token → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("POST", "/auth/logout");
    log({ name: "Logout tanpa token → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message }); }

  // === 4. LOGIN LAGI ===
  console.log("\n\x1b[1m4. Login Lagi\x1b[0m");

  { const r = await req("POST", "/auth/login", { identifier: testUser.email, password: testUser.password });
    log({ name: "Login ulang → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message });
    if (r.status === 200) userCookie = extractCookies(r.rawHeaders); }

  { const r = await req("GET", "/auth/me", undefined, userCookie);
    log({ name: "GET /auth/me → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/auth/me");
    log({ name: "GET /auth/me tanpa token → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message }); }

  // === 5. BERANDA ===
  console.log("\n\x1b[1m5. Beranda (Homepage API)\x1b[0m");

  { const r = await req("GET", "/communities");
    log({ name: "GET /communities (public) → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/organizations");
    log({ name: "GET /organizations (public) → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/events");
    log({ name: "GET /events (public) → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  // === 6. LOGIN ADMIN ===
  console.log("\n\x1b[1m6. Login Admin & Akses Admin\x1b[0m");

  { const r = await req("GET", "/admin/dashboard");
    log({ name: "Admin dashboard tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("GET", "/admin/dashboard", undefined, userCookie);
    log({ name: "Admin dashboard user biasa → 403", status: r.status === 403 ? "PASS" : "FAIL", code: r.status, expectedCode: 403, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("GET", "/admin/users");
    log({ name: "Admin users tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("GET", "/admin/roles");
    log({ name: "Admin roles tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("GET", "/admin/communities");
    log({ name: "Admin communities tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("GET", "/admin/organizations");
    log({ name: "Admin organizations tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  // === 7. KEMBALI KE BERANDA ===
  console.log("\n\x1b[1m7. Kembali ke Beranda\x1b[0m");

  { const r = await req("GET", "/communities");
    log({ name: "GET /communities setelah cek admin → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/communities?page=1&limit=5&sort=desc");
    log({ name: "Communities pagination → 200", status: r.status === 200 && r.data?.pagination ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/communities?search=test");
    log({ name: "Communities search → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  // === 8. KOMUNITAS ===
  console.log("\n\x1b[1m8. Komunitas (Community)\x1b[0m");

  { const r = await req("GET", "/communities");
    log({ name: "GET /communities → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/communities/nonexistent-slug-xyz");
    log({ name: "Community slug tidak ada → 404", status: r.status === 404 ? "PASS" : "FAIL", code: r.status, expectedCode: 404, error: r.data?.message }); }

  { const commName = `Komunitas Test ${uniqId()}`;
    const r = await req("POST", "/communities", { name: commName, description: "Komunitas testing", membershipType: "OPEN", visibility: "PUBLIC", location: "Jakarta" }, userCookie);
    log({ name: "Create komunitas → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message });
    if (r.status === 201 && r.data?.data) { createdCommunityId = r.data.data.id; createdCommunitySlug = r.data.data.slug; } }

  { const r = await req("POST", "/communities", { name: "No Auth" });
    log({ name: "Create komunitas tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("POST", "/communities", { name: "ab" }, userCookie);
    log({ name: "Nama terlalu pendek → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  if (createdCommunitySlug) {
    const r = await req("GET", `/communities/${createdCommunitySlug}`);
    const isOk = r.status === 200 || r.status === 404;
    log({ name: "GET community detail (DRAFT not visible) → 200/404", status: isOk ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/communities/my/submissions", undefined, userCookie);
    log({ name: "My submissions → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/communities/my/submissions");
    log({ name: "My submissions tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  // === 9. BERGABUNG KOMUNITAS ===
  console.log("\n\x1b[1m9. Bergabung Komunitas\x1b[0m");

  if (createdCommunityId) {
    { const loginR = await req("POST", "/auth/login", { identifier: testUser2.email, password: testUser2.password });
      if (loginR.status === 200) user2Cookie = extractCookies(loginR.rawHeaders);
      const r = await req("POST", `/communities/${createdCommunityId}/join`, { message: "Mau gabung" }, user2Cookie);
      const isOk = r.status === 200 || r.status === 400;
      log({ name: "Join komunitas (may be DRAFT) → 200/400", status: isOk ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

    { const r = await req("POST", `/communities/${createdCommunityId}/join`, {}, user2Cookie);
      const isOk = r.status === 400 || r.status === 409;
      log({ name: "Join komunitas lagi → 400/409", status: isOk ? "PASS" : "FAIL", code: r.status, expectedCode: 409, error: r.data?.message }); }

    { const r = await req("POST", `/communities/${createdCommunityId}/join`);
      log({ name: "Join tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

    { const r = await req("POST", "/communities/nonexistent-id/join", {}, user2Cookie);
      log({ name: "Join community tidak ada → 404", status: r.status === 404 ? "PASS" : "FAIL", code: r.status, expectedCode: 404, error: r.data?.message }); }

    { const r = await req("GET", `/communities/${createdCommunityId}/members`, undefined, userCookie);
      log({ name: "List members → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }
  }

  // === 10. KELUAR KOMUNITAS ===
  console.log("\n\x1b[1m10. Keluar Komunitas\x1b[0m");

  if (createdCommunityId) {
    { const r = await req("POST", `/communities/${createdCommunityId}/leave`, undefined, user2Cookie);
      const isOk = r.status === 200 || r.status === 400;
      log({ name: "Leave komunitas → 200/400", status: isOk ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

    { const r = await req("POST", `/communities/${createdCommunityId}/leave`, undefined, user2Cookie);
      log({ name: "Leave lagi → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

    { const r = await req("POST", `/communities/${createdCommunityId}/leave`, undefined, userCookie);
      log({ name: "Owner leave → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

    { const r = await req("POST", `/communities/${createdCommunityId}/leave`);
      log({ name: "Leave tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }
  }

  // === 11. BUAT KOMUNITAS (Extended) ===
  console.log("\n\x1b[1m11. Buat Komunitas (Extended)\x1b[0m");

  { const r = await req("POST", "/communities", { name: "No Auth" });
    log({ name: "Create tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("POST", "/communities", {}, userCookie);
    log({ name: "Body kosong → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/communities", { name: `Full Comm ${uniqId()}`, description: "Lengkap", location: "Bandung", website: "https://example.com", membershipType: "RESTRICTED", visibility: "PUBLIC", tags: ["test", "qa"] }, userCookie);
    log({ name: "Create full data → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message }); }

  { const r = await req("POST", "/communities", { name: `RESTRICTED ${uniqId()}`, membershipType: "RESTRICTED", visibility: "PUBLIC" }, userCookie);
    log({ name: "Create RESTRICTED → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message }); }

  { const r = await req("POST", "/communities", { name: `PRIVATE ${uniqId()}`, visibility: "PRIVATE" }, userCookie);
    log({ name: "Create PRIVATE → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message }); }

  // === 12. ORGANISASI ===
  console.log("\n\x1b[1m12. Organisasi\x1b[0m");

  { const r = await req("GET", "/organizations");
    log({ name: "GET /organizations → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/organizations?page=1&limit=5&sort=desc");
    log({ name: "Org pagination → 200", status: r.status === 200 && r.data?.pagination ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  { const r = await req("GET", "/organizations/nonexistent-slug-xyz");
    log({ name: "Org slug tidak ada → 404", status: r.status === 404 ? "PASS" : "FAIL", code: r.status, expectedCode: 404, error: r.data?.message }); }

  { const r = await req("POST", "/organizations", { name: `Org Test ${uniqId()}`, description: "Org testing", visibility: "PUBLIC", location: "Surabaya", industry: "Technology" }, userCookie);
    log({ name: "Create organisasi → 201", status: r.status === 201 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 201, error: r.data?.message });
    if (r.status === 201 && r.data?.data) createdOrgId = r.data.data.id; }

  { const r = await req("POST", "/organizations", { name: "No Auth" });
    log({ name: "Create org tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  { const r = await req("POST", "/organizations", { name: "ab" }, userCookie);
    log({ name: "Org nama pendek → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("POST", "/organizations", {}, userCookie);
    log({ name: "Org body kosong → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }

  { const r = await req("GET", "/organizations/my/submissions", undefined, userCookie);
    log({ name: "My org submissions → 200", status: r.status === 200 && r.data?.success ? "PASS" : "FAIL", code: r.status, expectedCode: 200, error: r.data?.message }); }

  if (createdOrgId) {
    const loginR = await req("POST", "/auth/login", { identifier: testUser2.email, password: testUser2.password });
    if (loginR.status === 200) user2Cookie = extractCookies(loginR.rawHeaders);

    { const r = await req("POST", `/organizations/${createdOrgId}/join`, {}, user2Cookie);
      log({ name: "Join org DRAFT → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }
  }

  { const createR = await req("POST", "/organizations", { name: `Org Approved ${uniqId()}`, visibility: "PUBLIC" }, user2Cookie);
    if (createR.status === 201 && createR.data?.data) {
      const orgId2 = createR.data.data.id;

      { const r = await req("POST", `/organizations/${orgId2}/join`, {}, userCookie);
        log({ name: "Join org DRAFT (another) → 400", status: r.status === 400 ? "PASS" : "FAIL", code: r.status, expectedCode: 400, error: r.data?.message }); }
    } }

  { const r = await req("POST", "/organizations/nonexistent-id/join");
    log({ name: "Join org tanpa auth → 401", status: r.status === 401 ? "PASS" : "FAIL", code: r.status, expectedCode: 401, error: r.data?.message || r.data?.error?.message }); }

  // === SUMMARY ===
  console.log("\n\x1b[1m========================================\x1b[0m");
  console.log(`\x1b[1m  Results: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
  console.log(`\x1b[1m  Total: ${passed + failed} tests\x1b[0m`);
  console.log("\x1b[1m========================================\x1b[0m\n");

  if (failed > 0) {
    console.log("\x1b[31mFailed tests:\x1b[0m");
    results.filter((r) => r.status === "FAIL").forEach((r) => {
      console.log(`  - ${r.name} (expected ${r.expectedCode}, got ${r.code}) ${r.error || ""}`);
    });
    console.log("");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => { console.error("Test runner error:", e); process.exit(1); });
