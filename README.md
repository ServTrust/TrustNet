
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ServTrust/TrustNet)

# TrustNet: Structural Knowledge Translation

Bridges expert domains to collective understanding by translating conceptual structure, not just words.

## What It Does

Reveals the structural pattern beneath specialized knowledge. You understand *how it works*, not just *what it says*.

### The Problem
Expert knowledge is locked behind:
- Domain-specific jargon
- Assumed prerequisites  
- Cultural context
- Unstated mental models

### The Solution
TrustNet identifies the **core structural pattern**, then finds **analogous structures** in everyday experience. Not simplification - **structural translation**.

## Why Structure Matters

**Manipulation hides in complexity** → Structure makes it visible  
**Expertise hides in jargon** → Structure makes it accessible  
**Truth hides in abstraction** → Structure makes it verifiable

### Example: AI Research → Accessible Understanding

**Before (Technical Paper):**
> "DeepAgent employs a Rule-Engine-Driven Data Fabrication strategy with dense retrieval over large tool registries, autonomous memory folding to prevent context overflow, and Tool Policy Optimization with token-level advantage attribution..."

**After (Structural Translation):**
> "Think of your best field technician who doesn't just follow flowcharts. They think through symptoms, realize they need a specialized meter they don't have, call around to find one, use it effectively, then compress their whole diagnosis into clear notes for the next shift."

The structure is now visible: adaptive problem-solving with dynamic tool discovery and intelligent memory management.

## How It Works

1. **Analyze Cognitive Distance**: What makes this hard? (jargon density, prerequisites, abstraction level)
2. **Extract Core Pattern**: What is this *really* about? (strip away domain specifics)
3. **Find Structural Bridges**: What familiar patterns match this structure?
4. **Progressive Translation**: Build understanding using those bridges

## UI/UX Design Specs

### Model Selection
- **Location**: Small dropdown in top-right corner of header (minimal visual prominence)
- **Persistence**: Model choice saved to `localStorage` and restored on page load
- **Options**: Anthropic Claude (default) or Google Gemini
- **Rationale**: Model choice is a technical detail, not a primary user decision

### Input Fields
1. **Optional Target Domain** (small text input)
   - Allows users to specify a domain of expertise for bridge analogies
   - Default: shared domain of ordinary experience
   - Example: "parenting", "cooking", "small business", "classroom", "sports"
   - Helper text explains it changes where analogies are drawn from

2. **Expert Knowledge Input** (large textarea)
   - Primary input field for technical/specialized content
   - Placeholder guides users on what to paste

3. **Optional Question or Focus** (small text input)
   - For follow-up questions or specific focus areas
   - Context-aware: previous translations are preserved for follow-ups
   - Example: "focus on decision-making tradeoffs" or "compare to startup funding"

### Context Preservation
- Translation history maintained in client-side state
- Follow-up questions automatically include prior context
- Enables conversational refinement of translations

### Future Direction
- **Browser Extension**: Designed to eventually live as a browser extension
  - Eliminates server timeout issues (direct API calls from browser)
  - User manages their own API keys (privacy-first)
  - No server infrastructure needed

## Use It

**Live Instance:** [Your deployed URL]  
**Rate Limit:** 20 translations/day (free for personal use)

**Self-Host:**
```bash
git clone https://github.com/ServTrust/TrustNet.git
cd TrustNet
npm install
# Add your API keys to .env:
# ANTHROPIC_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
npm run dev
```

## Examples

### Financial Regulation
**Technical:** "Deterministic-Masked Format-Preserving Encryption for SAR-triggering Smurfing scenarios..."  
**Structural:** "Fire drill simulations - practice realistic emergencies without actual danger"

### Healthcare Interoperability  
**Technical:** "CGAN-generated FHIR bundles with semantic consistency across LOINC codes..."  
**Structural:** "Movie studio back-lots - fake but realistic enough to test the cameras"

### Philosophy
**Technical:** "Does a tree falling in isolation generate auditory phenomena?"  
**Structural:** Reveals category confusion between physical events (vibrations) and subjective experience (hearing)

## The Pattern

Individual expert knowledge → Collective everyday understanding  
Specialized structure → Universal structure  
Hidden complexity → Visible pattern

## Technical Details

**Built with:**
- Next.js 14 (React framework)
- Anthropic Claude API or Google Gemini API (structural analysis)
- Tailwind CSS (styling)
- React hooks for state management and localStorage persistence

**Architecture:**
- Serverless functions (Vercel/Netlify)
- Dual API support (Anthropic Claude, Google Gemini)
- Model choice persisted in browser localStorage
- Context preservation for follow-up questions
- No data storage (privacy-first)
- Client-side state only

## Contributing

This is cognitive infrastructure. Contributions welcome:

- **Code improvements** (better UI, optimization)
- **Bridge examples** (domain-specific translations)
- **Documentation** (guides, tutorials)
- **Translations** (the tool itself to other languages)

## Sustainability

Free for personal use, forever.

Infrastructure costs covered by:
- Community donations: [Ko-fi/GitHub Sponsors link]
- Institutional grants
- Your support

Current costs: ~$50-200/month depending on usage

## Philosophy

Knowledge shouldn't be gatekept by jargon. Specialized understanding should be **structurally accessible** to anyone willing to learn.

This tool doesn't replace expertise - it makes expertise **verifiable** and **understandable**.

When structure is visible:
- Good arguments become clearer
- Bad arguments become obviously bad
- Manipulation loses its hiding place
- Truth becomes defensible

## License

MIT License - use freely, modify freely, deploy freely.

For commercial deployment at scale, please contribute to infrastructure costs.

---

Built with the belief that cognitive access is a right, not a privilege.


