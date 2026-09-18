# Isaac Lee's portfolio

A personal portfolio built with React, TypeScript and Vite, published at
[isaacleejm.github.io](https://isaacleejm.github.io/). Project stories cover the
problem, implementation, technology and Isaac's contribution to each project.

The dark, editor-inspired interface uses blue and violet accents, a static
TypeScript profile panel, and expandable project notes. Navigation remains a
regular scrolling website. Project screenshots retain their original appearance;
only their surrounding frames and the architecture diagrams follow the site theme.

## Local development

Use Node.js **22.23.1**, matching CI, and npm.

```sh
npm ci
npm run dev
```

Before publishing, run the checks and inspect the production build:

```sh
npm run lint
npm run build
npm run preview
```

The build command checks TypeScript and writes the static site to `dist/`.
`preview` serves that build locally; GitHub Pages hosts the published site.

## Updating the site

| Location | Purpose |
| --- | --- |
| `src/data/portfolio.ts` | Profile, education, experience, project stories, contribution details and links |
| `src/components/` | Reusable interface components |
| `src/index.css` | Global styles, theme tokens and typography |
| `src/App.css` | Page layout and responsive styling |
| `public/projects/` | Project screenshots and other local project assets |
| `docs/content-sources.md` | Source evidence and project attribution notes |

Edit the content file to update copy and project links. Featured case studies use
the `projects` array; smaller project cards use `supportingProjects`. Education,
employment and community entries belong to `profile` and share typed layouts.
Add images to
`public/projects/`, then reference them with `/projects/...` paths and descriptive
alternative text in the typed project media. The editable social preview is
`public/social-card.svg`; its PNG export is used by the metadata in `index.html`.
Check phone and desktop layouts, keyboard navigation and
external links before committing.

Keep project descriptions grounded in repository evidence and personal
experience. Attribute team work accurately, distinguish implemented features from
plans, and identify proposed or unmerged contributions. Publish only appropriate
screenshots and working public links; keep private data and credentials out of
the site. Image captions should identify diagrams, widget renders or older
versions when relevant.

## GitHub Pages

[The deployment workflow](.github/workflows/deploy.yml) installs locked
dependencies, lints and builds pull requests and updates to `main`. Only successful
`main` builds are uploaded and deployed to the `github-pages` environment. The
workflow can also be run manually with `main` selected.

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source. The workflow publishes `dist/`; generated files
do not need to be committed. Build jobs receive read access to repository content,
and only the deploy job receives Pages deployment permissions.

Vite's default `/` base is correct for this user site. A future move to
`username.github.io/repository/` requires updating the Vite base and asset paths.
See the [official Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages).

## Learning history and attribution

This published version was built with AI assistance. The original React,
TypeScript and Vite starter is preserved at commit
[`2e59ebd`](https://github.com/isaacleejm/isaacleejm.github.io/commit/2e59ebd),
following the initial README commit. A future step-by-step learning rebuild can
start on a separate branch or worktree from that baseline while the portfolio
remains available.

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), with a
body explaining what changed and why for nontrivial changes.
