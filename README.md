# Bexalta WOW Effects — CDN Bundle

Performance-First visual effects for the Bexalta OnePage (Webflow).

## Architecture
- **Three.js** + Custom GLSL Shaders (InstancedMesh / Points)
- **Lenis** — Smooth scroll engine synced with GSAP ScrollTrigger
- **GPU-accelerated** — 5,000 particles @ 60FPS

## Usage

Add to your `<head>` or before `</body>`:

```html
<script defer src="https://cdn.jsdelivr.net/gh/Andres-Herrejon/bexalta-wow-cdn@main/wow-bundle.iife.js"></script>
```

### Lenis CSS (required)
```html
<style>
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }
</style>
```

## CDN URLs
- **jsDelivr:** `https://cdn.jsdelivr.net/gh/Andres-Herrejon/bexalta-wow-cdn@main/wow-bundle.iife.js`
- **Raw GitHub:** `https://raw.githubusercontent.com/Andres-Herrejon/bexalta-wow-cdn/main/wow-bundle.iife.js`

---
Built with ❤️ by Foundtech
