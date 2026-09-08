# AmiRa ❤️

AmiRa is a private, mobile-first romantic web experience for Rahul and Amita.

## Version 1

The user-facing experience requires **no login, registration, password, account, or personal information**. Open the website and enter the experience.

Included:

- Cinematic black/deep-red opening: Amita → Baby → Babu → Aaja mere paas
- AmiRa ❤️ identity and mobile-first home
- `I NEED RAHUL ❤️` randomized experience engine
- 40+ romantic, reassurance, missing-you, playful, nighttime and future messages
- LocalStorage anti-repeat memory across visits
- Hold-for-hug interaction with touch/pointer support and optional vibration
- Feel Me Near You guided interaction
- Device-time-aware nighttime / 2 AM mode
- When You're Sad reassurance
- Why I Love You reveal sequence
- Our Little Universe story, using only the supplied real relationship context
- One Day future section
- Passionate-but-tasteful romantic section
- User-replaceable Hindi romantic music slot at `public/music/romantic.mp3`
- Subtle idle surprises
- Reduced-motion support
- GitHub Pages workflow for free static hosting

## Run locally

Node 20+:

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

The existing Express/SQLite/authentication backend is retained for future private/admin expansion, but Version 1 does not call it for the public experience.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes the `public` directory. Enable GitHub Pages for **GitHub Actions** in repository Settings if it is not already enabled. After the first successful workflow run, the project URL will normally be:

`https://fx4raa-eng.github.io/amira/`

## Music

Add a user-owned or licensed MP3 as `public/music/romantic.mp3`. The player is already wired to that path.
