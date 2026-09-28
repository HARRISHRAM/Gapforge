// Base API helper for communicating with the SQLite backend (/api/*)
const BASE_URL = "/api";

function getAuthHeader() {
  try {
    const raw = localStorage.getItem("skillpath_active_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch {}
  return {};
}

export async function mockDelay(data, ms = 150) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function apiPost(path, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed: ${path} (${res.status})`);
  }
  return res.json();
}

export async function apiPut(path, body = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed: ${path} (${res.status})`);
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed: ${path} (${res.status})`);
  }
  return res.json();
}
