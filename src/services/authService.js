// SQLite Authentication Service
// Communicates with SQLite backend API (/api/auth/*)

export async function loginUser(email, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to log in");
    }

    return data; // { user, token }
  } catch (err) {
    // If backend endpoint is unavailable, provide seamless mock fallback
    if (err.message.includes("Failed to fetch")) {
      if (email.toLowerCase() === "alex@example.com" && password === "password123") {
        return {
          user: {
            id: "user_demo_alex",
            name: "Alex Rivers",
            email: "alex@example.com",
            career: "fullstack",
          },
          token: "s_demo_token_fallback",
        };
      }
      throw new Error("Invalid credentials (demo: alex@example.com / password123)");
    }
    throw err;
  }
}

export async function registerUser({ name, email, password, career }) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, career }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to register account");
    }

    return data; // { user, token }
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      return {
        user: {
          id: `usr_${Date.now().toString(36)}`,
          name,
          email,
          career: career || "fullstack",
        },
        token: `s_${Date.now().toString(36)}`,
      };
    }
    throw err;
  }
}

export async function logoutUser(token) {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore network errors on logout
  }
  return true;
}

export async function getCurrentUser(token) {
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
