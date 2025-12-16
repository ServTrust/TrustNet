
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

## Use It

**Live Instance:** [cognitive-bridge.netlify.app]  
**Rate Limit:** 20 translations/day (free for personal use)

**Self-Host:**
```bash
git clone https://github.com/ServTrust/TrustNet.git
cd TrustNet
npm install
# Add your 
# Add your Google/Anthropic API key(s) to .env 
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
- Anthropic Claude API (structural analysis)
- Tailwind CSS (styling)

**Architecture:**
- Serverless functions (Vercel/Netlify)
- Rate limiting (IP-based, 20/day)
- No data storage (privacy-first)
- Client-side state only

**API Support:**
- Anthropic Claude API (primary)
- Google Gemini API (alternative)
- Model choice persisted in localStorage

**Functional Constraints (MVP):**
- **Text mode only:** Text input/output, no images or multimedia support
- **Output limits:** 
  - Anthropic Claude: 2,048 tokens (~1,500 words)
  - Gemini Flash: 8,192 tokens (~6,000 words)
- **Input size:** Recommended under 5,000 characters for optimal results
- **Response time:** 15-30 seconds typical (subject to serverless function timeout limits)
- **MVP status:** Core functionality only, some features may be limited

## Design Specifications

### UI Layout & Hierarchy

**Primary Focus:**
- Expert Knowledge Input (large textarea) - main content area
- Optional target domain input (small text field) - configures analogy domain
- Optional question/focus input (small text field) - for follow-up questions and specific guidance

**Secondary Elements:**
- Model selector (small dropdown) - persistent, visually de-emphasized, located below inputs
- Translate button - prominent call-to-action
- Output display - formatted translation result

### User Experience Features

**Context Preservation:**
- Translation history maintained in client-side state
- Follow-up questions can reference previous translations
- Target domain persists across conversation turns

**Model Selection:**
- Choice persisted in localStorage
- Small dropdown selector (not prominent buttons)
- Default: Anthropic Claude
- Options: Anthropic Claude, Google Gemini

**Target Domain Customization:**
- Optional text input for user-defined expertise domain
- Default: "shared everyday experience"
- Examples: parenting, cooking, small business, classroom, sports
- Guides the translation to find analogies in that specific domain

**Follow-up Questions:**
- Optional prompt input for additional guidance or questions
- Previous translation context automatically included
- Allows iterative refinement without re-entering expert text

### Future Direction

**Browser Extension:**
- Tool designed to eventually live as browser extension
- Direct API calls from extension (no server timeout limits)
- User-provided API keys stored locally in extension

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


