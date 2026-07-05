# Portfolio Update — beawesome8.github.io

## Purpose
Two changes layered on top of each other: (1) bring the site's content up to date with actual career state as of July 2026, and (2) rebuild the interface itself into an interactive, terminal-themed design distinctive to an AI/data engineering profile, replacing the prior static dark-theme template.

## Design Rationale
Direction: a terminal/systems aesthetic grounded in real working habits (git tagging discipline, CI/CD practice, pipeline-shaped projects), not a generic "dark mode with a gradient" treatment. Signature element: a live, typeable terminal a recruiter can run commands in (`whoami`, `skills`, `projects`, `timeline`, `contact`, `sudo hire-me`).

Token system used:
- Color: ink-navy `#0A0E14` background, `#121826` card surface, `#E6E8EB` primary text, `#7C8598` muted text, amber accent `#F0A93E`, data-cyan `#4FD1C5`
- Type: JetBrains Mono (headers, labels, terminal), Inter (body copy)
- Structure: About = `cat about.md` output, Skills = filterable stack manifest, Timeline = `git log --graph` with expandable commits, Projects = repo cards with phase badges and real metrics, Contact = command prompt
- Motion: one orchestrated boot-sequence type animation on load, scroll-triggered reveals per section, restrained hover states. All motion respects `prefers-reduced-motion`.

## Scope of Changes

### Structure (this pass)
- Full rebuild of `index.html`, `style.css` into a three-file structure: `index.html`, `style.css`, `script.js` (previously inline navigation only, no JS).
- Sticky nav with mobile hamburger menu (prior version had no mobile nav toggle).
- Hero: animated terminal boot sequence (`whoami` → role → status) plus profile photo and CTA buttons.
- About: rendered as a fake `about.md` file viewer, paired with a stat-card grid (years of experience, active projects, cost-reduction metric, language levels).
- Skills: filterable chip grid by category (AI engineering / backend & frontend / MLOps & cloud / data & ML / visualization).
- Timeline: rendered as a `git log --graph` commit list; each entry expands on click to show the equivalent of resume bullet detail.
- Projects: repo-card grid with phase/status badges (`phase 5/6`, `-60.8% cost`, `live`, `thesis`) and language-dot metadata, matching GitHub's own visual vocabulary without copying its layout.
- New interactive terminal section with a real command parser (`help`, `whoami`, `skills`, `projects`, `timeline`, `contact`, `resume`, `clear`, `sudo hire-me`).
- Contact section restyled as a command-prompt card grid.

### Content (carried over from prior update, unchanged in substance)
- Dual title: AI Engineer / Data Scientist.
- "Open to work" status stated explicitly (Infineon full-time role ended March 2026).
- Full career timeline including previously missing Data Analytics Internship (Apr–Aug 2025) and Business Analyst Full-Time (Sep 2025–Mar 2026) roles, plus Edinburgh Napier double degree.
- German proficiency corrected and confirmed at B2.
- Six new projects added: DocuVet, PromptGuard, LLM Cost Optimizer, Recurring Research Agent with Memory, Job Search Automation Pipeline, and the ISM thesis repo — alongside all previously listed projects.

## Action Items (Owner)
1. **Add image asset**: only `Images/Profile_Photo.jpg` is referenced now (project card images were dropped in favor of repo-card metadata badges — decide if you want thumbnail screenshots added back in; the current design intentionally treats projects as repo listings, not visual galleries).
2. **Verify new GitHub repo links resolve** — `LLM-Cost-Optimizer`, `Recurring-Research-Agent`, `Job-Search-Automation-Pipeline` slugs were inferred from project names, not confirmed. Fix before pushing live.
3. **Confirm Books Recommendation System repo status** before deciding whether to re-add it — omitted pending confirmation it's still public.
4. **Test the live terminal on mobile** — command input via on-screen keyboard should work, but verify the `Enter` key behavior on iOS Safari specifically, which sometimes intercepts it differently.
5. **Re-run this same content sync** after DocuVet Phase 6, PromptGuard Phases 6–7, and the GCP ML Engineer certification complete.

## Files in This Delivery
- `index.html` — full replacement
- `style.css` — full replacement
- `script.js` — new file, required for the interactive terminal, filters, expandable timeline, and scroll reveals
- `README.md` — this document

