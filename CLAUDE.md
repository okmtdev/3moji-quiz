# CLAUDE.md

## Project Overview

3もじ くいず (3moji-quiz) — A children's hiragana learning game. Players answer 3-character hiragana quizzes from a pool of choices. Built with vanilla HTML/CSS/JavaScript, zero external dependencies.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES5-compatible)
- **Runtime**: Node.js 18+ (for dev server and build)
- **Package manager**: npm
- **No frameworks, no bundler, no transpiler**

## Commands

- `npm run dev` — Start development server on http://localhost:3000
- `npm run build` — Copy src/ to dist/
- `npm run deploy` — Deploy dist/ to Google Cloud Storage via gsutil

## Project Structure

```
src/
  index.html      # Main HTML markup (lang="ja")
  style.css       # Styles with responsive design (mobile-first)
  app.js          # Game logic, wrapped in IIFE with "use strict"
  questions.json  # Quiz question database (30+ questions)
build.js          # Build script (copies src → dist)
server.js         # Dev HTTP server
```

## Code Conventions

- JavaScript uses IIFE pattern: `(function() { "use strict"; })();`
- Variable declarations use `var`
- Comments are written in Japanese
- No linter or formatter configured
- No test suite

## Key Details

- All UI text is in Japanese
- Score history stored in localStorage (max 20 records)
- LINE share integration for results
- Responsive: mobile (≤480px), tablet/desktop (≥768px), short screens (≤600px height)
