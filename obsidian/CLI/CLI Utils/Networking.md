---
tags: [cli, networking, snippet]
---

# Networking

## Ports & Processes

```bash
lsof -i:PORT_NUMBER          # which process holds a port
lsof -nP -iTCP -sTCP:LISTEN  # all listening TCP sockets
```

## DNS & HTTP

```bash
dig +short example.com         # resolve A record
dig example.com MX             # mail records
curl -I https://example.com    # response headers only
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' https://example.com
```

## Discovery & Scanning

```bash
# Scan local network for IPs and names (brew install arp-scan)
sudo arp-scan --interface=en0 --localnet

nmap -sn 10.0.0.0/24                # host discovery (ping sweep)
nmap -sT -p 80,443 10.0.0.0/24      # TCP connect scan (use -sS for SYN/stealth, needs sudo)
nmap -A 10.0.0.115                  # OS + service/version detection
nmap --script vuln <ip>            # vulnerability scripts
```

## Path & Reachability

```bash
traceroute example.com
ping -c 4 example.com
nc -vz host 443                     # test if a TCP port is open
```

> [!warning] Only scan networks you own or are authorized to test.
