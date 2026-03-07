# A-Level Revision App

## Project Overview
Mobile-first revision platform for A-Level students (Maths, Biology, Chemistry). Built for real exam prep — no gimmicks, no streaks, no gamification. Pure academic utility.

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Math Rendering**: KaTeX (client-side, CSS via CDN)
- **AI Marking**: Gemini 2.5 Flash API (2-step: OCR then Grade)
- **Diagram Generation**: Gemini 2.5 Flash API (text → SVG)
- **Deployment**: Vercel (https://alevel-revision.vercel.app)

## Key Commands
```bash
npm run dev        # Dev server (Turbopack, port 3099)
npm run build      # Production build
npm run lint       # ESLint
node scripts/generate-diagrams.js  # Regenerate SVG diagrams (needs GEMINI_API_KEY in .env.local)
```

## Project Structure
```
src/
  app/
    page.tsx                  # Home page
    mcqs/page.tsx             # MCQ practice (subject select + quiz)
    questions/page.tsx        # Written questions practice
    flashcards/page.tsx       # Flashcard practice
    papers/page.tsx           # Past paper browser
    camera/page.tsx           # Camera marking (photo -> AI grade)
    progress/page.tsx         # Progress tracking dashboard
    api/mark/route.ts         # Gemini marking API endpoint
  components/
    RichText.tsx              # **CRITICAL** - LaTeX/math/formatting renderer
    MCQPractice.tsx           # MCQ quiz component
    QuestionPractice.tsx      # Written question component (renders SVG diagrams)
    FlashcardPractice.tsx     # Flashcard component
    PaperViewer.tsx           # Past paper viewer
  lib/
    progress.ts               # localStorage progress tracking
    sm2.ts                    # Spaced repetition algorithm
    strip-latex.ts            # Strip LaTeX for plain text contexts
  types/
    index.ts                  # TypeScript interfaces (includes diagram_svg field)
public/
  data/
    A-Level-Maths.json        # 462 MCQs + flashcards + questions + diagram SVGs
    A-Level-Biology.json      # 484 MCQs + flashcards + questions + diagram SVGs
    A-Level-Chemistry.json    # 408 MCQs + flashcards + questions + diagram SVGs
    papers-Maths.json         # Past paper questions
    papers-Biology.json       # Past paper questions
    papers-Chemistry.json     # Past paper questions
scripts/
  generate-diagrams.js        # Build script: Gemini API text -> SVG diagrams
  build-papers.js             # Build script: compile past paper data
```

## Data Stats
- **MCQs**: 1,354 total (462 Maths, 484 Bio, 408 Chem)
- **Flashcards**: 8,858 (merged from generated + original_flashcards, deduped by id)
- **Written Questions**: 872 with marking criteria
- **Past Papers**: 12,424 real exam questions (AQA/Edexcel/OCR)
- **SVG Diagrams**: 78/79 questions with diagrams now have generated SVGs

## Critical Component: RichText.tsx
This is the most complex component. It handles AI-generated text that has broken LaTeX patterns.

### Processing Pipeline
`cleanSymbols` -> `fixLatex` -> `renderMath` -> `unicodeToHtml` -> `processFormatting`

### fixLatex Strategy
1. Strip all backticks and zero-width spaces
2. Strip ALL `$` signs from text
3. Normalize merged LaTeX commands (e.g., `\intx` -> `\int x`) using known command list
4. Re-detect LaTeX regions via regex (commands like `\frac{}{}`, power/subscript like `x^{2}`)
5. Wrap detected regions with `$...$`
6. Merge adjacent `$...$` blocks separated by short math text (not English words)

### Key Regex Design Decisions
- Balanced brace matching: `(?:[^{}]|\{[^{}]*\})*` handles one level of nesting like `{-\frac{1}{2}}`
- Prefix pattern: only numeric math context `([([]?\s*)?(?:[-+]?\s*\d+\s*[+\-*/]\s*)*` — no letters to avoid capturing English words
- Merge step: skips separators with 3+ consecutive letters to avoid merging across English words

### Known Patterns That Must Work
- `\frac{dh}{dt}` — fractions
- `(1 + 4x)^{-\frac{1}{2}}` — nested braces in powers
- `\int x e^{x} dx` — integral with separated terms
- `e^{x}`, `x^{2}` — superscripts
- Unicode subscripts/superscripts (H₂O, cm³, K⁻¹, mol⁻¹)
- `**bold**` and `*italic*` markdown
- `\n` -> line breaks

## SVG Diagram System
- Questions with text-description diagrams get SVG renderings via Gemini API
- SVGs stored in `diagram_svg` field on each OriginalQuestion
- QuestionPractice.tsx renders SVG inline with `dangerouslySetInnerHTML`
- CSS: `[&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[400px]`
- Types: text tables, graphs, physics diagrams, Venn diagrams, molecular structures
- Fallback: questions without SVG show text description in styled gray box

## Design Rules
- **NO emojis** in the UI
- Light/white mode only
- Mobile-first, clean, polished, premium
- Minimum touch target: 44px height on mobile
- Use rounded-xl for cards, blue-600 for primary actions

## Environment
- Gemini API key: set in `.env.local` as `GEMINI_API_KEY` and on Vercel
- Data files fetched at runtime from `/data/` (not imported, to avoid Turbopack issues)
- MCQ options use seeded shuffle (question ID as seed) for stable randomization
- Gemini marking API handles multi-part responses (thinking + text parts)

## Completed Work
- [x] LaTeX rendering across all Maths/Bio/Chem topics (RichText.tsx fixLatex pipeline)
- [x] SVG diagram generation for 78/79 questions with diagrams
- [x] SVG diagram rendering in QuestionPractice.tsx
- [x] Duplicate topic names normalized (Forces and Newton's Laws, Work Energy and Power, Rates of Change and Kinematics)
- [x] Production build verified — compiles clean
- [x] Multi-part Gemini response handling in marking API
- [x] All pages visually verified via Playwright screenshots

## Known Issues / Remaining TODO

### Content Quality
- [ ] 1 Chemistry "Purification" question has no SVG (Gemini couldn't generate)
- [ ] 12 Chemistry questions have string "Null" in fields (filtered by existing code)
- [ ] 3 questions have empty marking criteria

### Testing
- [ ] End-to-end camera marking test (requires real photo upload)
- [ ] Test deployed Vercel version matches local after next deploy
- [ ] Test flashcard spaced repetition scheduling accuracy

## Testing Approach
Always use Playwright headless browser to take screenshots and visually verify UI changes. Never assume code changes work without seeing the rendered output. The accessibility snapshot alone misses visual rendering issues (tiny fractions, code-styled math, raw LaTeX).
