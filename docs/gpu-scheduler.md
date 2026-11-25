# Cloud fallback for GPU sampling

The GitHub workflow runs on its native five-minute schedule by default.
Cloudflare is only needed if GitHub does not deliver scheduled events.
The Worker dispatches only the existing workflow; it does not read the GPU
dashboard, store data, or host an HTTP endpoint.

1. Push the workflow changes to the default `main` branch.
2. In GitHub, create a fine-grained personal access token for this repository
   only, with **Actions: Read and write**. Set an expiration.
3. From the repository root, sign in to Cloudflare and run:

   ```sh
   npx wrangler login
   npx wrangler deploy --config scripts/gpu-scheduler.toml
   npx wrangler secret put GITHUB_DISPATCH_TOKEN --config scripts/gpu-scheduler.toml
   ```

   Paste the token at the secret prompt, not into a file or command argument.
4. Verify a new `GPU weekly usage (cloudflare)` run without clicking Run workflow.
   It should run the same job and update the data branch if the source is fresh.
   Cloudflare cron changes can take up to 15 minutes to propagate.
5. After verifying the Worker, set the GitHub repository Actions variable
   `GPU_EXTERNAL_SCHEDULER` to `true` so native schedule events skip the job.
   Manual triggers and pushes to collector files still work.

Cloudflare dispatches every three minutes and samples are weighted by three
minutes. The native GitHub fallback uses five minutes. Neither service requires
your computer to stay on. If the token expires, rotate the Worker secret.

## Usage history

The data branch keeps the latest weekly ranking and rolling daily/hourly
history (about 30 days) in `weekly.json`. It also retains the latest four hours
of five-minute buckets. On the first collection after a month ends in JST,
the collector saves that month's available daily and hourly buckets in
`archive/YYYY-MM.json`. It merges by bucket key before removing older buckets
from `weekly.json`, and commits both files together. Archives are not pruned.

Use the date picker in the board's single-day view to retrieve older hourly
data on demand. Existing data still present in `weekly.json` is archived
automatically; data already dropped before this change is not backfilled.
