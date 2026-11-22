const WORKFLOW =
  "https://api.github.com/repos/VelikayaScarlet/velikayascarlet.github.io/actions/workflows/gpu-weekly-usage.yml/dispatches";

export default {
  async scheduled(_controller, env) {
    if (!env.GITHUB_DISPATCH_TOKEN) throw new Error("Missing GitHub dispatch token");
    const response = await fetch(WORKFLOW, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "gpu-weekly-scheduler",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      body: JSON.stringify({ ref: "main" }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`GitHub dispatch rejected (HTTP ${response.status})`);
    await response.body?.cancel();
  },
};
