# AmiRa V4 — Living Love Universe

AmiRa is a private, mobile-first romantic web experience created by Rahul for Amita.

## V4 architecture
- Living universe instead of a page collection
- Home objects act as room portals
- Time-aware greeting and night mode
- Mood-aware comfort, romance, play and surprise flows
- Local-first adaptive state under `amira_v4`
- Weighted/no-immediate-repeat experience selection
- 25 mini-games and expandable content collections
- Love letters, Why I Love You, Kiss, CLOSER, If You Were Here and Stay Awhile
- Future meeting scenes are explicitly imagination, never fabricated memories
- Touch-first Hug interaction with haptics where supported
- Local Web Audio interaction sounds with browser-safe user-gesture initialization
- Music room accepts only user-owned/licensed files placed in `public/music/`
- Page Visibility handling resumes music only when it was playing before the tab was hidden
- Reduced-motion support
- GitHub Pages deployment from `public/`
- Existing Node/Express/SQLite backend remains untouched; the public V4 experience does not require it

## Music
The repository intentionally does not bundle copyrighted commercial songs. Add your own licensed/user-owned files such as:
- `public/music/romantic.mp3`
- `public/music/missing-you.mp3`
- `public/music/late-night.mp3`
- `public/music/stay-with-me.mp3`

If a file is missing, the Music Room fails gracefully instead of breaking the app.

## Local state
V4 stores experience progress, recent selections, unlocks, achievements, music preference and local answers in the browser only. No private romantic content is sent to a remote service by the public frontend.

## GitHub Pages
The Pages workflow publishes `./public` using GitHub Actions. All frontend asset paths are project-relative so the app works at a repository Pages URL.

## Browser audio behavior
Modern browsers may block audible autoplay. AmiRa initializes Web Audio from user interaction and exposes sound/music controls rather than bypassing browser policy.

## Content rule
The app does not invent physical memories. Rahul and Amita's first physical meeting, first real hug and future shared travel remain future experiences until they actually happen.
