/**
 * GitHub Service: robust parser and fetcher for student GitHub profiles and repositories.
 * Supports:
 * - Full Profile URLs: https://github.com/username
 * - Full Repo URLs: https://github.com/username/repository-name
 * - Short URLs: github.com/username or github.com/username/repo
 * - Usernames with @: @username
 * - Plain usernames: username
 */

export function parseGitHubInput(input) {
  if (!input || typeof input !== "string") {
    return { username: "", repoName: "", isUrl: false, cleanInput: "" };
  }

  let str = input.trim();
  const isUrl = str.toLowerCase().includes("github.com") || str.startsWith("http");

  // Remove protocol and domain
  str = str.replace(/^(https?:\/\/)?(www\.)?github\.com\/?/i, "");
  // Remove leading @
  str = str.replace(/^@+/, "");
  // Remove trailing .git and slashes
  str = str.replace(/\.git$/i, "").replace(/\/+$/, "");

  const parts = str.split("/").map((p) => p.trim()).filter(Boolean);
  const username = parts[0] || "";
  const repoName = parts[1] || "";

  return {
    username,
    repoName,
    isUrl,
    cleanInput: repoName ? `${username}/${repoName}` : username,
  };
}

export async function fetchStudentGitHubData(rawInput) {
  const { username, repoName } = parseGitHubInput(rawInput);

  if (!username) {
    throw new Error("Please enter a valid GitHub username or repository URL.");
  }

  const resultRepos = [];

  // 1. If a specific repository was entered, try to fetch it first
  if (repoName) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const repo = await res.json();
        resultRepos.push({
          name: repo.name,
          description: repo.description || "Verified GitHub repository submitted by student",
          language: repo.language || "JavaScript",
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          html_url: repo.html_url || `https://github.com/${username}/${repoName}`,
          updated_at: repo.updated_at || new Date().toISOString(),
        });
      }
    } catch {
      // Ignore network/rate-limit error and use fallback below
    }
  }

  // 2. Fetch user's public repositories
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((r) => {
          if (!resultRepos.some((existing) => existing.name === r.name)) {
            resultRepos.push({
              name: r.name,
              description: r.description || "Public repository from student GitHub profile",
              language: r.language || "JavaScript",
              stars: r.stargazers_count || 0,
              forks: r.forks_count || 0,
              html_url: r.html_url || `https://github.com/${username}/${r.name}`,
              updated_at: r.updated_at || new Date().toISOString(),
            });
          }
        });
      }
    }
  } catch {
    // Ignore network error and proceed to fallback if needed
  }

  // 3. If GitHub API was rate-limited or unreachable, return nothing — no fake repos.
  // Previously this block manufactured placeholder repos, which showed as "Verified"
  // even though no real data was fetched. Removed: honesty over false verification.
  if (resultRepos.length === 0) {
    throw new Error(
      `Could not reach GitHub for "@${username}". This may be due to GitHub API rate limiting or a network issue. ` +
      `Please try again in a few minutes or check that the username/URL is correct.`
    );
  }

  return {
    username,
    repoName,
    repos: resultRepos,
  };
}
