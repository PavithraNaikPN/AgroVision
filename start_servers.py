#!/usr/bin/env python3
"""
Unified startup script for LeafSense servers.
Starts both Flask (port 5000) and Node.js (port 3000) servers.
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def print_banner():
    print("""
    ============================================================
           LeafSense - Unified Server Startup
    ============================================================
    
    This script starts both servers:
      1. Flask Backend (Python) - Port 5000
         MobileNetV2 + Cosine Similarity for disease prediction
      2. Node.js Backend - Port 3000
         Chat, Gemini API, dataset serving
    """)

def start_flask():
    """Start Flask backend server."""
    print("\n[1/2] Starting Flask backend on port 5000...")
    print("      Model: MobileNetV2 + Cosine Similarity")
    print("      This may take 1-2 minutes on first run to build features cache...")
    
    flask_process = subprocess.Popen(
        [sys.executable, "flask_app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Wait for Flask to start
    started = False
    for line in flask_process.stdout:
        print(f"      [Flask] {line.strip()}")
        if "Running on" in line or "Server running" in line:
            started = True
            break
        if "Error" in line or "Traceback" in line:
            print("      Flask failed to start!")
            return None
    
    if started:
        print("      Flask server started successfully!")
    
    return flask_process

def start_nodejs():
    """Start Node.js backend server."""
    print("\n[2/2] Starting Node.js backend on port 3000...")
    
    # Check if node_modules exists
    if not os.path.exists("node_modules"):
        print("      Installing Node.js dependencies...")
        npm_install = subprocess.run(
            ["npm", "install"],
            capture_output=True,
            text=True
        )
        if npm_install.returncode != 0:
            print(f"      npm install failed: {npm_install.stderr}")
            return None
    
    node_process = subprocess.Popen(
        ["node", "server.js"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Wait for Node.js to start
    started = False
    for line in node_process.stdout:
        print(f"      [Node] {line.strip()}")
        if "running at" in line.lower() or "listening" in line.lower():
            started = True
            break
        if "error" in line.lower() and "listening" not in line.lower():
            print("      Node.js failed to start!")
            return None
    
    if started:
        print("      Node.js server started successfully!")
    
    return node_process

def main():
    print_banner()
    
    processes = []
    
    try:
        # Start Flask
        flask = start_flask()
        if flask:
            processes.append(("Flask", flask))
            time.sleep(1)
        else:
            print("\nWarning: Flask server failed to start. Predictions will use Gemini fallback.")
        
        # Start Node.js
        node = start_nodejs()
        if node:
            processes.append(("Node.js", node))
        else:
            print("\nWarning: Node.js server failed to start. Chat will not work.")
        
        if not processes:
            print("\nError: No servers could be started!")
            sys.exit(1)
        
        print("\n" + "=" * 60)
        print("All servers are running!")
        print("=" * 60)
        print("\nAccess your application at:")
        print("  http://localhost:3000  (Main app)")
        print("  http://localhost:5000  (Flask API)")
        print("\nPress Ctrl+C to stop all servers.")
        print("=" * 60 + "\n")
        
        # Monitor processes
        while True:
            for name, proc in processes:
                ret = proc.poll()
                if ret is not None:
                    print(f"\nWarning: {name} server exited with code {ret}")
                    processes.remove((name, proc))
            
            if not processes:
                print("\nAll servers have stopped.")
                break
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n\nShutting down servers...")
        for name, proc in processes:
            print(f"  Stopping {name}...")
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        print("All servers stopped.")
    
    except Exception as e:
        print(f"\nError: {e}")
        for name, proc in processes:
            proc.terminate()
        sys.exit(1)

if __name__ == "__main__":
    main()
