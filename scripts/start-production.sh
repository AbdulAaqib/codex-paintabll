#!/usr/bin/env bash
set -euo pipefail
cd "$HOME/ghost-arena"
test -f server.env
docker rm -f ghost-arena-server 2>/dev/null || true
docker run -d --name ghost-arena-server --restart unless-stopped --memory=512m --cpus=1 --read-only --tmpfs /tmp:rw,noexec,nosuid,size=16m --cap-drop ALL --security-opt no-new-privileges --env-file server.env -p 127.0.0.1:3011:3011 ghost-arena-server:latest
python3 scripts/ensure-proxy.py
# Retain other user jobs; this idempotent route restorer only adds this game's host.
(crontab -l 2>/dev/null | sed '\|ghost-arena/scripts/ensure-proxy.py|d'; printf '* * * * * /usr/bin/python3 %s/ghost-arena/scripts/ensure-proxy.py >> %s/ghost-arena/proxy.log 2>&1\n' "$HOME" "$HOME") | crontab -
