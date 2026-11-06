# Publish WEPCO Digital Twin with GitHub Pages — no AppDeploy

## Current technical status
- Repository: https://github.com/Elsharnouby-87/wepco-esp-3d (public).
- GitHub Pages URL after activation: https://elsharnouby-87.github.io/wepco-esp-3d/
- Workflow: [Publish WEPCO Digital Twin](https://github.com/Elsharnouby-87/wepco-esp-3d/actions/workflows/pages.yml), configured in `.github/workflows/pages.yml`.
- Current limitation (checked 6 November 2026): GitHub Actions successfully builds the website with Node 22 and Vite but fails at `actions/configure-pages@v5` because the Pages site hasn't been enabled for this repository yet. This requires a **one-time repository setting** that can't be changed by ordinary contents/git-file tools.

## One-time activation — from your GitHub account
1. Open https://github.com/Elsharnouby-87/wepco-esp-3d/settings/pages while logged in as the repository owner.
2. Under **Build and deployment**, change **Source** to **GitHub Actions**. The existing workflow is already in the repository; do not create a new website or repository.
3. Open https://github.com/Elsharnouby-87/wepco-esp-3d/actions/workflows/pages.yml and select **Run workflow** → branch **main** → **Run workflow**. Alternatively, any new push to `main` after step 2 triggers deployment automatically.
4. Open the most recent workflow run. The expected successful steps are: Checkout → Node 22 → npm install → Vite build → Configure Pages → Upload Pages Artifact → Deploy Pages.
5. Once that run is green, open **https://elsharnouby-87.github.io/wepco-esp-3d/**. The GitHub Pages dashboard link also appears under repository **Settings → Pages**.

### Mobile interface note
On a phone, GitHub's **Settings** tab may be under the repository's **More / …** menu. Safari or Chrome's **Request Desktop Website** can expose the full **Settings → Pages** section if necessary.

## All future updates
- Modify files and commit them to the repository's `main` branch.
- The GitHub workflow automatically builds the static Three.js/Vite website and deploys the new version to GitHub Pages.
- No AppDeploy account, AppDeploy domain, AppDeploy API, or AppDeploy subscription is involved.
- Do not edit the compiled output by hand. Edit source files like `js/scene.js`, `js/main.js`, `js/dispatch.js`, `index.html` and `styles.css`.

## What the existing workflow does
- Builds the website via `npm install --no-audit --no-fund` and `npm run build`.
- Uploads the generated `dist/` folder as a GitHub Pages artifact.
- Deploys via the official `actions/deploy-pages@v4` action, using `pages: write` and `id-token: write` permissions.
- `vite.config.js` has `base: './'`, allowing the site to run under `/wepco-esp-3d/` rather than the root of a domain.

## Verification
The most recent checked workflow log showed **the Node dependency installation and Vite build succeeded**, producing `dist/index.html` and bundled local JS/CSS assets. The deployment failed later at the GitHub Pages configuration step with:

```
Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions.
Error: Not Found
```

This is **not a Three.js or JavaScript build failure**.

## Data governance
The repository is **public**, and the published GitHub Pages website is publicly accessible. It contains project assumptions and engineering/financial indicators. Ensure public sharing is approved by the relevant stakeholders.

## Rollback
Git history and saved checkpoint branches retain previous versions. A rollback is done on GitHub by restoring a prior verified commit to `main`, which then triggers a fresh GitHub Pages deployment.
