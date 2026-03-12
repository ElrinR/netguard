from scapy.layers.inet import TCP, IP
from scapy.layers.l2 import ARP
from logger import log_event
import time

syn_counter = {}
last_reset = time.time()
arp_table = {}
traffic_stats = {
    "incoming": 0,
    "outgoing": 0,
    "total": 0
}

def analyze_packet(packet, config=None):
    if config is None:
        config = {"syn_threshold": 20}
    global traffic_stats, syn_counter, last_reset
    
    # Rate limit: Reset counters every 60 seconds to make it "Packets per Minute"
    now = time.time()
    if now - last_reset > 60:
        syn_counter = {}
        last_reset = now

    traffic_stats["total"] += 1
    
    # Try to determine direction (rough estimation for local demo)
    if packet.haslayer(IP):
        src = packet[IP].src
        if src.startswith("192.168") or src.startswith("10.") or src == "127.0.0.1":
            traffic_stats["outgoing"] += 1
        else:
            traffic_stats["incoming"] += 1
    # -------- SYN Flood Detection --------
    try:
        if packet.haslayer(TCP) and packet.haslayer(IP):
            # Check for the SYN flag (0x02 bit)
            flags = packet[TCP].flags
            if (isinstance(flags, str) and "S" in flags) or (not isinstance(flags, str) and flags & 0x02):
                src = packet[IP].src
                syn_counter[src] = syn_counter.get(src, 0) + 1

                # Adjust threshold based on sensitivity
                raw_threshold = config.get("syn_threshold", 20)
                sensitivity = config.get("sensitivity", "Standard")
                
                if sensitivity == "High":
                    effective_threshold = raw_threshold * 0.5
                elif sensitivity == "Low":
                    effective_threshold = raw_threshold * 2.0
                else:
                    effective_threshold = raw_threshold

                if syn_counter[src] > effective_threshold:
                    # Log only the first time it crosses the threshold in this minute
                    if syn_counter[src] == int(effective_threshold) + 1:
                        log_event(f"SYN flood suspected from {src} (Burst: {syn_counter[src]} pkts/min, Mode: {sensitivity})")
    except Exception:
        pass 

    # -------- ARP Spoofing Detection --------
    if packet.haslayer(ARP):
        ip = packet[ARP].psrc
        mac = packet[ARP].hwsrc

        if ip in arp_table and arp_table[ip] != mac:
            log_event(f"ARP Spoofing detected for IP {ip}")
        else:
            arp_table[ip] = mac

