# TrustNet Prototype

This directory contains the first "sprout" of TrustNet - a working demonstration of AI-human consensus systems.

## Components

- **consensus_demo.py** - Core engine that routes text through multiple AI models and determines consensus
- **app.py** - Web interface for interacting with the consensus system
- **templates/** - HTML templates for the web interface
- **static/** - CSS and other static assets for the web interface
- **logs/** - Directory for storing consensus logs in JSON format

## Running the Demo

### Command Line Interface

```bash
# Simple usage with prompt
python consensus_demo.py  # or python3 consensus_demo.py on Linux/macOS

# Specify input directly
python consensus_demo.py --input "Text to verify"

# Use specific models
python consensus_demo.py --models gpt-3.5 claude llama --input "Text to verify"

# Specify custom log location
python consensus_demo.py --log "path/to/log.json" --input "Text to verify"
```

### Web Interface

#### From Root Directory

For convenience, you can use the run scripts from the project root:

**Windows:**
```
run_app.bat
```

**Linux/macOS:**
```bash
./run_app.sh
```

#### From Prototype Directory

```bash
# Start the web server (when already in the prototype directory)
python app.py  # or python3 app.py on Linux/macOS

# Then open http://localhost:5000 in your browser
```

### Environment Setup

If you're experiencing issues with missing dependencies, use the setup scripts in the root directory:

**Windows:**
```
setup.bat
```

**Linux/macOS:**
```bash
./setup.sh
```

## How It Works

1. Input text is routed through multiple AI models (simulated in this demo)
2. Each model makes an independent decision: approve, reject, or uncertain
3. Consensus is determined by majority vote
4. Results are logged transparently in JSON format
5. The web interface provides a user-friendly way to interact with the system

## Next Steps

- [ ] Connect to actual AI model APIs (OpenAI, Anthropic, etc.)
- [ ] Add more sophisticated consensus algorithms
- [ ] Implement user authentication for web interface
- [ ] Create dashboard for historical consensus data
- [ ] Add ability to explain decisions in more detail
- [ ] Integrate with governance system

## Contributing

This demo is designed to evolve through collaboration between humans and AI. See the main TrustNet README for information on how to contribute.
