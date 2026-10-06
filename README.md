# CYPHER 4.0 — Local Backup MVP

This is a dependency-light backup implementation of the CYPHER 4.0 hackathon platform.

It intentionally uses `localStorage` instead of Supabase so the complete workflow can be tested locally before the real backend is connected.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints.

## Demo access

- Organizer code: `CYPHER-ADMIN`
- Judge codes are created dynamically in Organizer.
- Student "Google" login is simulated locally using an email field. This is deliberately a temporary development substitute for Supabase Google OAuth.

## Included

- 18-hour organizer-controlled timer
- Student submissions
- One submission per simulated Google account
- Domain selection
- PDF/PPT filename capture
- GitHub/demo links
- Dynamic judges
- Judge access codes
- Domain-specific project visibility
- Five 0–10 judging criteria
- Automatic total /50
- Reviewed checkmarks
- Organizer submission list
- Public ranking without scores
- Detailed submission CSV
- Results CSV

## Supabase later

The data operations are isolated in `src/main.js` under the `store` object. Replace those persistence functions with Supabase calls later; the UI flow does not need to be redesigned.
