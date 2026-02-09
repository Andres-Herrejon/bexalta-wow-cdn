/**
 * ChromaticSpine — Left Edge Progress Indicator
 * 3px fixed bar tracking scroll with gradient fill
 * Dark base → Light-to-Green fill with glow
 */

import { createElement } from '../utils/dom.js';

export class ChromaticSpine {
    constructor() {
        // Spine container
        this.spine = createElement('div',
            'position:fixed;left:0;top:0;width:3px;height:100vh;background:linear-gradient(180deg,#080808 0%,#2d2d2d 50%,#1a1a1a 100%);z-index:9999;pointer-events:none',
            document.body
        );
        this.spine.id = 'bx-spine';

        // Fill bar
        this.fill = createElement('div',
            'position:absolute;left:0;top:0;width:100%;height:0%;background:linear-gradient(180deg,#C7C6C6 0%,#a2c62e 100%)',
            this.spine
        );
        this.fill.id = 'bx-spine-fill';

        // Glow dot at progress point
        this.dot = createElement('div',
            'position:absolute;left:-2px;bottom:0;width:7px;height:7px;background:#a2c62e;border-radius:50%;box-shadow:0 0 12px rgba(162,198,46,0.8),0 0 24px rgba(162,198,46,0.4);opacity:0;transition:opacity 0.3s',
            this.fill
        );

        this.init();
    }

    init() {
        window.ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
                const p = self.progress;
                this.fill.style.height = `${p * 100}%`;

                // Show dot after 5% scroll
                this.dot.style.opacity = p > 0.05 ? '1' : '0';
            }
        });
    }
}
