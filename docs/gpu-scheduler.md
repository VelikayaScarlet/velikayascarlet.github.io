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
4. Verify a new `workflow_dispatch` run without clicking Run workflow.
   It should run the same job and update the data branch if the source is fresh.
   Cloudflare cron changes can take up to 15 minutes to propagate.
5. After verifying the Worker, set the GitHub repository Actions variable
   `GPU_EXTERNAL_SCHEDULER` to `true` so native schedule events skip the job.
   Manual triggers and pushes to collector files still work.

The scheduled minutes are 02, 07, ..., 57. Neither service requires your
computer to stay on. If the token expires, rotate the Worker secret.
