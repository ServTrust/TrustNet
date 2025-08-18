"""
TrustNet Web Interface - Simple Flask app to interact with the consensus demo
"""

from flask import Flask, render_template, request, jsonify
from pathlib import Path
import json
from consensus_demo import ConsensusEngine

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Ensure the templates directory exists
templates_dir = Path(__file__).parent / "templates"
templates_dir.mkdir(exist_ok=True)

# Ensure the static directory exists
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)

# Initialize the consensus engine
engine = ConsensusEngine()

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/consensus', methods=['POST'])
def get_consensus():
    """Process input text and return consensus results"""
    data = request.json
    input_text = data.get('input', '')
    
    # Process through consensus engine
    consensus, confidence, outputs = engine.consensus_check(input_text)
    
    return jsonify({
        'input': input_text,
        'consensus': consensus,
        'confidence': confidence,
        'outputs': outputs
    })

@app.route('/api/logs')
def get_logs():
    """Return the consensus logs"""
    try:
        with open(engine.log_path, 'r') as f:
            logs = json.load(f)
        return jsonify(logs)
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify([])

if __name__ == '__main__':
    print(f"TrustNet Web Interface starting...")
    print(f"- Access the application at: http://localhost:5000")
    print(f"- Log file location: {engine.log_path}")
    app.run(debug=True)
