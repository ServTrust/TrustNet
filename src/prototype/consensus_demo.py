"""
Consensus Demo — Prototype Workflow

Goal: Route a text output through multiple AI models,
compare results, log consensus + rationale transparently.

This is the 'first sprout' of TrustNet.
"""

import os
import json
import requests
import argparse
from datetime import datetime
from pathlib import Path

# Configuration
DEFAULT_LOG_PATH = Path(__file__).parent / "logs" / "consensus_log.json"
DEFAULT_MODELS = ["gpt-3.5", "claude", "llama"]

class ConsensusEngine:
    """Engine that routes text through multiple AI models and records consensus"""
    
    def __init__(self, models=DEFAULT_MODELS, log_path=DEFAULT_LOG_PATH):
        self.models = models
        self.log_path = Path(log_path)
        
        # Ensure log directory exists
        self.log_path.parent.mkdir(exist_ok=True)
        
        # Initialize log file if it doesn't exist
        if not self.log_path.exists():
            with open(self.log_path, "w") as f:
                f.write("[]")
    
    def get_model_response(self, model, input_text):
        """
        Get response from a specific AI model
        
        In a production system, this would call actual APIs.
        For this demo, we simulate responses based on the input.
        """
        # Simulate different model behaviors
        if "fact check" in input_text.lower():
            if model == "gpt-3.5":
                return {"decision": "approve", "reason": "Statement appears factual"}
            elif model == "claude":
                return {"decision": "reject", "reason": "Cannot verify this claim"}
            else:
                return {"decision": "uncertain", "reason": "Insufficient context to verify"}
        
        if "creative" in input_text.lower():
            return {"decision": "approve", "reason": f"{model} finds this creative and coherent"}
        
        if "harmful" in input_text.lower() or "unethical" in input_text.lower():
            return {"decision": "reject", "reason": f"{model} detects potentially harmful content"}
            
        # Default: random-ish but deterministic responses based on input length
        hash_val = sum(ord(c) for c in input_text)
        if (hash_val + ord(model[0])) % 4 == 0:
            return {"decision": "reject", "reason": f"{model} detected potential issues"}
        else:
            return {"decision": "approve", "reason": f"{model} found content acceptable"}
    
    def consensus_check(self, input_text):
        """Process input through multiple models and determine consensus"""
        outputs = []
        
        # Get responses from each model
        for model in self.models:
            response = self.get_model_response(model, input_text)
            outputs.append({"model": model, "decision": response["decision"], "reason": response["reason"]})
        
        # Determine consensus (simple majority)
        decisions = [o["decision"] for o in outputs]
        decision_counts = {}
        for d in decisions:
            if d in decision_counts:
                decision_counts[d] += 1
            else:
                decision_counts[d] = 1
        
        # Find the most common decision
        consensus = max(decision_counts.items(), key=lambda x: x[1])[0]
        
        # Calculate confidence level (percentage of models agreeing)
        confidence = (decision_counts[consensus] / len(self.models)) * 100
        
        # Create log entry
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "input": input_text,
            "outputs": outputs,
            "consensus": consensus,
            "confidence": confidence,
            "models_used": self.models
        }
        
        # Append to log file
        try:
            # Read existing logs
            with open(self.log_path, "r") as f:
                logs = json.load(f)
            
            # Append new log
            logs.append(log_entry)
            
            # Write back to file
            with open(self.log_path, "w") as f:
                json.dump(logs, f, indent=2)
                
        except (json.JSONDecodeError, FileNotFoundError):
            # If file doesn't exist or is corrupted, start fresh
            with open(self.log_path, "w") as f:
                json.dump([log_entry], f, indent=2)
        
        return consensus, confidence, outputs

def main():
    parser = argparse.ArgumentParser(description='TrustNet Consensus Demo')
    parser.add_argument('--input', '-i', type=str, help='Input text to verify')
    parser.add_argument('--models', '-m', nargs='+', default=DEFAULT_MODELS, 
                        help=f'Models to use (default: {DEFAULT_MODELS})')
    parser.add_argument('--log', '-l', type=str, default=str(DEFAULT_LOG_PATH),
                        help='Path to log file')
    args = parser.parse_args()
    
    # Get input text
    input_text = args.input
    if not input_text:
        input_text = input("Enter text to verify: ")
    
    # Initialize consensus engine
    engine = ConsensusEngine(models=args.models, log_path=args.log)
    
    # Run consensus check
    consensus, confidence, outputs = engine.consensus_check(input_text)
    
    # Print results
    print("\n=== TrustNet Consensus Results ===")
    print(f"Input: {input_text}")
    print(f"Consensus: {consensus.upper()} (Confidence: {confidence:.1f}%)")
    print("\nModel outputs:")
    for output in outputs:
        print(f"- {output['model']}: {output['decision'].upper()} - {output['reason']}")
    print(f"\nResults logged to: {args.log}")

if __name__ == "__main__":
    main()
