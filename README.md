# homelab-homepage

Configuration files for the [gethomepage/homepage](https://gethomepage.dev) dashboard running at `https://fua.nu`.

## Stack

- **Homepage** — dashboard app (Docker container)
- **Docker proxy** — `dockerproxy:2375` for container status badges
- **Home Assistant** — `http://192.168.3.40:8123` for home automation widgets
- **n8n** — `http://n8n:5678` webhook proxy for Superbits, Docker stats, and Media Status (public: `https://automation.fua.nu`)
- **Cloudflare Tunnel** — public access via `fua.nu` domain

## Dashboard sections

| Section | Contents |
|---------|----------|
| Home Automation | Temperature sensors, solar/battery system, Roborock vacuum, Sector Alarm, Home Assistant |
| Media | Plex media server |
| Media Status | Deviation table: items present in some but not all of Radarr, Sonarr, Plex, Jellyfin |
| Torrents | Superbits tracker stats (ratio, HnR warnings, bonus points) |
| TbT | Infrastructure (NAS, Cloudflare tunnel, UniFi UDMs) and Monitoring (Docker stats) |
| Automation / AI | *(reserved)* |

## Configuration files

| File | Purpose |
|------|---------|
| `settings.yaml` | Global settings, layout groups and column definitions |
| `services.yaml` | Service cards and widgets — structure mirrors `settings.yaml` layout |
| `widgets.yaml` | Top bar widgets: search, clock, weather (Open-Meteo, Tjörn) |
| `bookmarks.yaml` | Bookmark links (Developer, Media Management, Tools, Config & Management) |
| `docker.yaml` | Docker socket/proxy connection (`local-docker`) |
| `custom.css` | CSS overrides: tabular-nums for ratio columns, `.mdt*` styles for Media Status table |
| `custom.js` | Client-side injection: Media Status deviation table via `MutationObserver` + n8n webhook |

## Key patterns

### Layout → Services

Groups defined under `layout:` in `settings.yaml` must exactly match top-level keys in `services.yaml`. Subgroups (e.g. `Infrastructure > NASnTunnel`) are nested maps in both files.

### customapi widgets

Most dynamic data uses `type: customapi`. Home Automation widgets POST a Jinja2 template to the HA template API and map the JSON response to display rows:

```yaml
widget:
  type: customapi
  url: http://192.168.3.40:8123/api/template
  method: POST
  headers:
    Authorization: Bearer <long-lived-ha-token>
    Content-Type: application/json
  requestBody:
    template: |
      { "value": {{ states('sensor.name') | tojson }} }
  mappings:
    - field: value
      label: My Label
      format: number        # number | percent | relativeDate | string
      remap:                # optional value substitutions
        - value: ok
          to: ✅
```

Services with multiple independent widgets use the plural `widgets:` key (a list).

### Docker status badges

Add `server: local-docker` and `container: <name>` to any service to show a live container status badge.

### Service CSS/JS targeting

A service with `id: myservice` can be targeted in `custom.css` via `li#myservice` or enhanced via `document.getElementById('myservice')` in `custom.js`.

Currently used:
- `#superbits`, `#deluge` — monospace tabular-nums for ratio columns
- `#media-diff` — `custom.js` fetches the n8n deviation webhook and injects a `<table class="mdt">` with ✓/✗ columns for Radarr, Sonarr, Plex, and Jellyfin

### Media Status deviation table

`custom.js` uses a `MutationObserver` to detect when `li#media-diff` is added to the DOM, then fetches `https://automation.fua.nu/webhook/d41a998b-...` and renders the response into an HTML table inside the card. The n8n workflow returns a `deviations` array (one entry per mismatched item) and a `counts` summary. Styles are defined in `custom.css` under `.mdt*` and `#media-diff-table`.

## Environment

Hosted on a Synology NAS inside a `linuxserver/code-server` container. Config is on the shared `/config` volume, edited via VS Code at `https://vscode.fua.nu/?folder=/config/workspace/homepage`. Homepage hot-reloads on file save.

## Git

```bash
# Remote
git remote add origin git@github.com:kallsbo/homelab-homepage.git

# Identity
git config user.name "kallsbo"
git config user.email "kallsbo@users.noreply.github.com"
```

SSH key at `~/.ssh/id_ed25519` (shared across containers via `/config` volume).
