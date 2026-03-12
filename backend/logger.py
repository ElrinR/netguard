import os
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), "netguard.log")

def log_event(message):
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log = f"[{time}] ALERT: {message}"
    print(log)

    with open(LOG_FILE, "a") as file:
        file.write(log + "\n")
