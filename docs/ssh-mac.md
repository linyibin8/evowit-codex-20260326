# Passwordless SSH to the Mac

## If you already have the private key

Save the private key locally:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat > ~/.ssh/evowit_mac <<'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZWQyNTUx
OQAAACBsccPD4ccq1OXtB8MHnrIpL65TbkVVieFJJk939SlwhgAAAIid2T3dndk93QAAAAtzc2gt
ZWQyNTUxOQAAACBsccPD4ccq1OXtB8MHnrIpL65TbkVVieFJJk939SlwhgAAAEDfxVNgyU1KrR8q
AQbMpDBYZcrvAWFohf5Qp9qXR0Yyomxxw8PhxyrU5e0HwweesikvrlNuRVWJ4UkmT3f1KXCGAAAA
AAECAwQF
-----END OPENSSH PRIVATE KEY-----
EOF
chmod 600 ~/.ssh/evowit_mac
```

Add SSH config:

```bash
cat >> ~/.ssh/config <<'EOF'
Host evowit-mac
  HostName 120.197.118.22
  User gray
  Port 22
  IdentityFile ~/.ssh/evowit_mac
  ServerAliveInterval 30
  ServerAliveCountMax 3
EOF
chmod 600 ~/.ssh/config
```

Test it:

```bash
ssh evowit-mac
```

## If you want to generate a new key pair

On the client machine:

```bash
ssh-keygen -t ed25519 -C "evowit-mac-access" -f ~/.ssh/evowit_mac_new
```

Then copy the public key to the Mac:

```bash
cat ~/.ssh/evowit_mac_new.pub
```

Append that line to:

```bash
~/.ssh/authorized_keys
```

on the Mac, then run:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## If SSH still fails

Check these items on the Mac/router side:

- router forwards external port `22` to the Mac's LAN IP
- `Remote Login` is enabled in macOS Settings
- firewall allows SSH
- the Mac is not asleep
- the iPhone trust dialog has already been accepted if you want device builds
