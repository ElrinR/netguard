from scapy.all import sniff
from detector import analyze_packet

def packet_handler(packet):
    analyze_packet(packet)

print("[+] NetGuard started... Capturing packets")
sniff(prn=packet_handler, store=False)

