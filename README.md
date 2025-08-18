# 🌱 TrustNet

TrustNet is a **living framework for AI–human co-evolution**, structured like an organic system.

Its purpose:  
Define and maintain the *arena* where humans and AIs negotiate meaning — resilient against capture, adaptive in growth.

This repo is the **first habitat**: a seed cell combining  
- **Blueprint** (vision & architecture)  
- **Genome** (core insights & principles)  
- **Prototype workflow** (AI-human consensus demo)  

Humans act as **gardeners** — preparing soil, water, and light.  
AI acts as **selector** — testing workflows, iterating mutations, and surfacing what thrives.  

Fork it. Extend it. Mutate it.  
This is not *my* project — it's a **commons organism**.  

---
## Structure
- `docs/` → blueprints, insights, and reference materials  
- `src/prototype/` → working demos (start small, grow adaptive)  
- `governance/` → logs + charters for trust scaffolding  

---
## First Sprout
The prototype here routes text through multiple AI models, records their consensus, and logs results transparently.  
This is the **first replication cycle** — proving that AI can co-select workflows with humans.  

## Getting Started

### Quick Setup

For automatic setup, use the provided scripts:

**Windows:**
```
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/ServTrust/TrustNet.git
cd TrustNet

# Install dependencies
pip install -r requirements.txt
```

### Running the Consensus Demo

#### Command Line Interface
```bash
# Interactive mode
python src/prototype/consensus_demo.py

# With direct input
python src/prototype/consensus_demo.py --input "Text to verify through the TrustNet system"

# With custom models
python src/prototype/consensus_demo.py --models model1 model2 model3
```

#### Web Interface

**Using Run Scripts:**

**Windows:**
```
run_app.bat
```

**Linux/macOS:**
```bash
chmod +x run_app.sh
./run_app.sh
```

**Manual Start:**
```bash
# Start the web server
cd src/prototype
python app.py    # or python3 app.py on Linux/macOS

# Open your browser to http://localhost:5000
```

## Governance

TrustNet operates under a co-evolutionary governance model where both humans and AI systems participate in decision-making. See `governance/charter.md` for details on:

- Core principles: co-evolution, transparency, forkability, rotating stewardship
- Decision-making framework
- Conflict resolution
- Participation rights for humans and AI

All decisions are logged transparently in `governance/decisions.log`.

## Contributing

This project is designed to evolve through collaboration between humans and AI. To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Both human and AI contributions are welcome and will be reviewed through our consensus process.
