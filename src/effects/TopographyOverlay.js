/**
 * TopographyOverlay — Industrial contour lines on Act I (S1-S2)
 * Subtle texture overlay representing non-digitized infrastructure
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createElement } from '../utils/dom.js';

gsap.registerPlugin(ScrollTrigger);

export class TopographyOverlay {
    /**
     * @param {string} assetUrl - URL of texture_topografia.svg from Webflow assets
     */
    constructor(assetUrl) {
        this.assetUrl = assetUrl;
        if (!this.assetUrl) return;
        this.init();
    }

    init() {
        // Find hero and S2
        const hero = document.querySelector('.bx-hero');
        const s2 = document.querySelector('#s2-vision') || document.querySelectorAll('.bx-section')[0];

        [hero, s2].forEach(section => {
            if (!section) return;
            section.style.position = 'relative';

            const overlay = createElement('div',
                `position:absolute;top:0;left:0;width:100%;height:100%;background-image:url(${this.assetUrl});background-size:cover;background-position:center;mix-blend-mode:overlay;opacity:0;pointer-events:none;z-index:0`,
                section, true
            );

            gsap.to(overlay, {
                scrollTrigger: { trigger: section, start: 'top 80%' },
                opacity: 0.2,
                duration: 2,
                ease: 'power2.inOut'
            });
        });
    }
}
