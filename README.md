# NetGuard - Network Security Dashboard

NetGuard is a comprehensive network security monitoring tool with a real-time web dashboard.

## Features
- **Real-time Packet Analysis**: Detects SYN Flood attacks and ARP Spoofing.
- **Modern Dashboard**: High-fidelity dark mode UI built with React.
- **Live Threat Ticker**: Real-time logging of network events.
- **Traffic Visualization**: Interactive charts showing threat activity.

## Project Structure
- `/backend`: FastAPI server and Scapy-based network sniffer.
- `/frontend`: Vite + React dashboard UI.

## How to Run

### 1. Prerequisites
- Python 3.x
- Node.js & npm
- Npcap (on Windows, for Scapy packet sniffing)

### 2. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Note: You may need to run this as Administrator to allow Scapy to capture packets.*

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

## Running with Docker (Recommended)

You can run the entire stack with Docker Compose. This handles all dependencies and environment setup.

1. **Build and Start**:
   ```bash
   docker-compose up --build
   ```
2. **Access the Dashboard**:
   - Web UI: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:8000](http://localhost:8000)

*Note: For the backend to capture packets correctly on Windows/macOS, it is recommended to run the backend natively as Administrator. On Linux, Docker works seamlessly with `network_mode: host`.*

## Technology Stack
- **Backend**: Python, FastAPI, Scapy
- **Frontend**: React, Vite, Lucide React (Icons), Recharts (Visualizations)
- **Styling**: Vanilla CSS (Cyberpunk aesthetic)
