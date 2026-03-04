# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is the configuration directory for a [gethomepage/homepage](https://gethomepage.dev) dashboard instance running at `https://homepage.fua.nu`. Homepage watches these files and hot-reloads on save — there is no build, lint, or test step.

## File roles

| File | Purpose |
|------|---------|
| `settings.yaml` | Global settings, layout definitions (groups, columns, styles) |
| `services.yaml` | Service cards and widgets, organized by the groups defined in `settings.yaml` |
| `widgets.yaml` | Top-of-page info widgets (search bar, clock, weather) |
| `bookmarks.yaml` | Bookmark links shown in the bookmarks section |
| `docker.yaml` | Docker socket/proxy connections (used for container status) |
| `custom.css` | CSS overrides injected into the dashboard |
| `custom.js` | JavaScript injected into the dashboard |

## Architecture

### Layout → Services mapping

Groups and their layout (columns, style, subgroups) are declared in `settings.yaml` under `layout:`. The matching top-level keys in `services.yaml` must exactly match those group names. Subgroups (e.g. `Infrastructure > NASnTunnel`) are nested YAML maps in `services.yaml` and referenced in `settings.yaml`.

### Widget patterns

Most dynamic data uses the `customapi` widget type, which fetches JSON and maps fields to display rows:

```yaml
widget:
  type: customapi
  url: <endpoint>
  method: POST
  headers:
    Authorization: Bearer <token>
  requestBody:
    template: |   # Jinja2 template (Home Assistant API)
      { "key": {{ states('sensor.name') | tojson }} }
  mappings:
    - field: key
      label: Label
      format: number   # or percent, relativeDate, string
      remap:           # optional value substitutions
        - value: ok
          to: ✅
```

Multiple widgets on a single service card use the plural `widgets:` key (list) instead of `widget:`.

### Home Assistant integration

All HA widgets call `http://192.168.3.40:8123/api/template` (POST) with a Jinja2 template body. The Bearer token is a long-lived HA token.

### Docker integration

`docker.yaml` defines `local-docker` pointing to `dockerproxy:2375`. Services reference it via `server: local-docker` + `container: <name>` to show container status badges.

### n8n webhook proxy

Some services (Superbits, Docker stats) fetch data from `http://n8n:5678/webhook/...` using a static `x-token` header. These are internal HTTP calls that go through an n8n automation server.

### Service IDs

A service can declare `id: <name>` to allow CSS targeting via `li#<name>`. Currently used for `#superbits` and `#deluge` in `custom.css` to apply monospace/tabular-nums styling to ratio columns.
