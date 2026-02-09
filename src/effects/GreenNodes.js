/**
 * GreenNodes — Glow Markers on S3 Capabilities and S6 Roadmap
 * Data crystallizing into intelligence
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createElement } from '../utils/dom.js';

gsap.registerPlugin(ScrollTrigger);

export class GreenNodes {
    constructor() {
        this.init();
    }

    init() {
        this.createCapabilityNodes();
        this.createRoadmapNodes();
    }

    createCapabilityNodes() {
        const capabilities = document.querySelectorAll('.bx-capability');
        if (!capabilities.length) return;

        capabilities.forEach((cap, i) => {
            const node = createElement('div',
                'position:absolute;top:-8px;left:-8px;width:16px;height:16px;background:#a2c62e;border-radius:50%;box-shadow:0 0 20px rgba(162,198,46,0.8),0 0 40px rgba(162,198,46,0.4);opacity:0;transform:scale(0)',
                cap
            );

            cap.style.position = 'relative';

            // Entrance
            gsap.to(node, {
                scrollTrigger: { trigger: '#s3-bexalta-os', start: 'top 60%' },
                scale: 1,
                opacity: 1,
                duration: 0.6,
                delay: i * 0.15,
                ease: 'back.out(2)'
            });

            // Pulse
            gsap.to(node, {
                scale: 1.2,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.15 + 0.6
            });
        });
    }

    createRoadmapNodes() {
        const items = document.querySelectorAll('.bx-roadmap-item');
        if (!items.length) return;

        items.forEach((item, i) => {
            const node = createElement('div',
                'position:absolute;top:50%;left:-12px;width:12px;height:12px;background:#a2c62e;border-radius:50%;box-shadow:0 0 15px rgba(162,198,46,0.6);opacity:0;transform:translateY(-50%) scale(0)',
                item
            );

            item.style.position = 'relative';

            gsap.to(node, {
                scrollTrigger: { trigger: '#s6-foundtech', start: 'top 65%' },
                scale: 1,
                opacity: 1,
                duration: 0.5,
                delay: i * 0.1,
                ease: 'back.out(2)'
            });
        });
    }
}
