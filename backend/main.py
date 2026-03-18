from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import os
import json
from datetime import datetime as dt, timedelta
from scapy.all import sniff
from detector import analyze_packet, traffic_stats

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOG_FILE = os.path.join(os.path.dirname(__file__), "netguard.log")
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")

# Default config
current_config = {
    "syn_threshold": 20,
    "sensitivity": "Standard",
    "syn_enabled": True,
    "arp_enabled": True
}

def load_config():
    global current_config
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                loaded = json.load(f)
                current_config.update(loaded)
        except Exception:
            pass
    return current_config

load_config()

def packet_handler(packet):
    analyze_packet(packet, config=current_config)

def start_sniffer():
    try:
        print("[+] Scapy Sniffer started in background thread...")
        sniff(prn=packet_handler, store=False)
    except Exception as e:
        print(f"[-] Sniffer Error: {e}")

# Start sniffer in a separate thread
sniffer_thread = threading.Thread(target=start_sniffer, daemon=True)
sniffer_thread.start()

@app.get("/alerts")
async def get_alerts(limit: int = 200):
    if not os.path.exists(LOG_FILE):
        return []
    
    # Efficiently load only the last 'limit' lines from the log file
    import collections
    with open(LOG_FILE, "r") as f:
        last_lines = collections.deque(f, limit)
        
    # Return last 'limit' alerts properly stripped
    alerts = [line.strip() for line in last_lines]
        
    return alerts

@app.get("/stats")
async def get_stats():
    # Efficient stats calculation for large files
    stats = {
        "syn_floods": 0,
        "arp_spoofing": 0,
        "total_alerts": 0,
        "status": "SECURE",
        "sniffer_active": sniffer_thread.is_alive(),
        "traffic": traffic_stats.copy()
    }
    
    if not os.path.exists(LOG_FILE):
        stats["status"] = "OFFLINE" if not stats["sniffer_active"] else "SECURE"
        return stats

    try:
        # Use a single pass over the file without loading all lines into memory
        syn_count = 0
        arp_count = 0
        total = 0
        last_lines = []

        with open(LOG_FILE, "r") as f:
            for line in f:
                total += 1
                if "SYN flood" in line:
                    syn_count += 1
                elif "ARP Spoofing" in line:
                    arp_count += 1
                last_lines.append(line)
                if len(last_lines) > 50:
                    last_lines.pop(0)

        stats["total_alerts"] = total
        stats["syn_floods"] = syn_count
        stats["arp_spoofing"] = arp_count

        # Check only the most recent alerts for the WARNING status
        now = dt.now()
        recent_threats = False
        
        for line in reversed(last_lines):
            try:
                # [2026-02-27 16:40:08] ...
                if len(line) > 20 and line[0] == '[':
                    time_str = line[1:20] 
                    alert_time = dt.strptime(time_str, "%Y-%m-%d %H:%M:%S")
                    if now - alert_time < timedelta(seconds=60):
                        recent_threats = True
                        break
                    else: 
                        # Since logs are sequential, if we hit an old one, earlier ones are also old
                        break
            except Exception:
                continue

        if not stats["sniffer_active"]:
            stats["status"] = "OFFLINE"
        elif recent_threats:
            stats["status"] = "WARNING"
        else:
            stats["status"] = "SECURE"

    except Exception as e:
        print(f"Error in stats: {e}")

    return stats

@app.get("/settings")
async def get_settings():
    return current_config

@app.post("/settings")
async def update_settings(new_settings: dict):
    global current_config
    current_config.update(new_settings)
    with open(CONFIG_FILE, "w") as f:
        json.dump(current_config, f, indent=4)
    return {"status": "success", "config": current_config}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
