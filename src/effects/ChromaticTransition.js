/**
 * ChromaticTransition — Scroll-Driven Background
 * Claridad Radical: Oscuridad → Informacion → Inteligencia
 *
 * Act I  (0-33%):  #080808 → #141414
 * Act II (33-66%): #141414 → #2d2d2d
 * Act III (66-100%): #1a1a1a + green overlay fades in
 */

import { createElement } from '../utils/dom.js';

export class ChromaticTransition {
    constructor() {
        // Green overlay for Act III
        this.overlay = createElement('div',
            'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(162,198,46,0) 0%,rgba(162,198,46,0.15) 100%);opacity:0;pointer-events:none;z-index:0',
            document.body, true
        );
        this.overlay.id = 'bx-green-overlay';

        this.init();
    }

    init() {
        window.ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                const p = self.progress;
                let bgColor;

                if (p < 0.33) {
                    bgColor = this.lerp('#080808', '#141414', p / 0.33);
                } else if (p < 0.66) {
                    bgColor = this.lerp('#141414', '#2d2d2d', (p - 0.33) / 0.33);
                } else {
                    bgColor = '#1a1a1a';
                    this.overlay.style.opacity = ((p - 0.66) / 0.34) * 0.3;
                }

                document.body.style.backgroundColor = bgColor;
            }
        });
    }

    lerp(c1, c2, f) {
        const a = this.hex2rgb(c1);
        const b = this.hex2rgb(c2);
        const r = Math.round(a[0] + f * (b[0] - a[0]));
        const g = Math.round(a[1] + f * (b[1] - a[1]));
        const bl = Math.round(a[2] + f * (b[2] - a[2]));
        return `rgb(${r},${g},${bl})`;
    }

    hex2rgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
}
