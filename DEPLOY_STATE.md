# DEPLOY_STATE.md — DeeVisualNovel

Per the workspace discipline (C:\Dev\CLAUDE.md): any project with more than one
hosting/deploy path records who serves what.

## Canonical vs. deployed

- **Canonical source:** `C:\Dev\VisualNovels` (series workspace; the Dee pack lives at
  `protagonists/dee/`, the shared engine at `engine/`). All editing happens THERE.
- **This repository** (`C:\Dev\DeeVisualNovel` → github.com/t3dy/DeeVisualNovel) is a
  **generated deploy artifact**, assembled by
  `VisualNovels/tools/build_deploy.py`. Do not edit files here by hand — they will be
  overwritten on the next export. The export flattens `../../engine/` to `./engine/` in
  index.html and regenerates `portal/` from RenaissanceMagicDB + the pack's docs.

## Production URLs

- Game: https://t3dy.github.io/DeeVisualNovel/
- Portal: https://t3dy.github.io/DeeVisualNovel/portal/
- Companion sites (separate repos, already live):
  - https://t3dy.github.io/JohnDeeSummaries/ (repo t3dy/JohnDeeSummaries; source at
    E:\pdf\renaissance magic\Dee\JohnDeeSummaries-deploy)
  - https://t3dy.github.io/RMDB/ (repo t3dy/RMDB; source at C:\Dev\renaissance magic)

## Update procedure

```bash
cd C:/Dev/VisualNovels && python tools/build_deploy.py
cd C:/Dev/DeeVisualNovel && git add -A && git commit -m "Export from VisualNovels" && git push
```

## Gotchas

- GitHub Pages serves with `Cache-Control: max-age=600` — a browser that loaded the page
  within ~10 minutes of a push can keep showing the previous deploy. Cache-bust or wait
  before declaring a deploy broken (learned the hard way in TurkaGame; see its
  DECISIONS.md).
- The portal generator reads `C:\Dev\renaissance magic\db\renmagic.db` read-only at
  BUILD time; the deployed portal is fully static and has no runtime dependency on it.
- `.nojekyll` is required (paths contain no underscores today, but keep it anyway).

## AngelPOV (added 2026-09-04)

`AngelPOV/` is the sister game, "Spoken Backward" — https://t3dy.github.io/DeeVisualNovel/AngelPOV/

Like everything else in this repo it is **generated**: canonical source is
`C:\Dev\VisualNovelsngelpov\`, and `build_deploy.py` copies it to `AngelPOV/`.
Do not edit it here.

It is self-contained (own engine, content, assets, tools) and shares nothing with the Dee
game at runtime, so changing one cannot break the other. Its 2.8 MB of plates are a
deliberate copy of the Dee plates rather than a `../assets/` reference, so the same
relative paths work in the canonical tree and here.

**Gotcha fixed the same day:** `clean_target()` in `build_deploy.py` deletes everything in
this repo except its `KEEP` set, and `KEEP` was `{".git"}`. Since the script never
generates `README.md` or `DEPLOY_STATE.md`, every export was quietly deleting both. `KEEP`
is now `{".git", "README.md", "DEPLOY_STATE.md", ".nojekyll"}`. Anything else you
hand-maintain in this repo must be added to `KEEP` too.

## Gotcha: never run the export with anything open inside the deploy tree

`clean_target()` empties `DeeVisualNovel/` of everything outside `KEEP` before rebuilding
it. On Windows a directory cannot be deleted while any process has it as a working
directory, so a terminal sitting in `DeeVisualNovel/AngelPOV/`, an editor with a file open
there, or a `python -m http.server` serving it will make the delete fail.

It used to fail *halfway*: on 2026-09-04 an export gutted `AngelPOV/` (28 files) and then
aborted, because a shell was cd'd into it. Nothing was lost -- the canonical source is
here -- but the deploy tree was left broken.

`clean_target()` is now **all-or-nothing**: it renames every entry out of the way first,
which fails against exactly the same locks a delete would but destroys nothing, rolls the
renames back, and exits with a message naming the likely cause. Only once every entry has
been renamed does it delete. Verified by holding a lock and confirming a seeded 75-file
tree came through untouched.

If you see `build_deploy: aborted with ... untouched`, close whatever is inside the deploy
tree and run it again. Nothing was deleted.
