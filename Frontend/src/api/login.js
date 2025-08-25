const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+"/Auth";

// Step 1 - Login
export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Step 2 - Start MFA Setup (generate secret / QR)
// -----------------------------
export async function setupMfa(email) {
  const res = await fetch(`${API_BASE_URL}/mfa/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Step 3 - Verify MFA Setup (enter code after scanning QR)
// -----------------------------
export async function verifyMfaSetup(email, totpCode) {
  const res = await fetch(`${API_BASE_URL}/mfa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email, TotpCode: totpCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Step 4 - Enable MFA (mark user as MFA enabled)
// -----------------------------
export async function enableMfa(email) {
  const res = await fetch(`${API_BASE_URL}/mfa/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Step 5 - Verify MFA during login
// -----------------------------
export async function verifyMfa(email, totpCode) {
  const res = await fetch(`${API_BASE_URL}/mfa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, totpCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Step 6 - Login with MFA
// -----------------------------
export async function loginMfa(email, totpCode) {
  const res = await fetch(`${API_BASE_URL}/login/mfa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, totpCode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Validate User Token
// -----------------------------
export async function validateRefresh(email, token) {
  const res = await fetch(`${API_BASE_URL}/validate-refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Register Patient
// -----------------------------
export async function registerPatient(data) {
  const res = await fetch(`${API_BASE_URL}/register/patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok; // true if valid, false if not
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};