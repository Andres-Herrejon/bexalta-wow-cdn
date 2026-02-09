/**
 * Preloader — Boot Sequence
 * "Iniciando sistema..." → "Bexalta OS v1.0" → fade reveal
 * Runs ONCE per session (sessionStorage flag)
 */

import { createElement } from '../utils/dom.js';

export class Preloader {
    constructor() {
        this.hasPlayed = sessionStorage.getItem('bx-preloader-done');
    }

    async run() {
        if (this.hasPlayed) return Promise.resolve();

        return new Promise((resolve) => {
            // Create overlay
            this.overlay = createElement('div',
                'position:fixed;top:0;left:0;width:100%;height:100%;background:#080808;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:1',
                document.body
            );

            // Status text
            this.statusText = createElement('div',
                'font-family:monospace;font-size:14px;color:#727070;letter-spacing:2px;text-transform:uppercase;transition:all 0.6s ease',
                this.overlay
            );
            this.statusText.textContent = 'Iniciando sistema...';

            // Progress bar container
            const barContainer = createElement('div',
                'width:200px;height:1px;background:#2d2d2d;margin-top:24px;overflow:hidden',
                this.overlay
            );

            // Progress bar fill
            this.barFill = createElement('div',
                'width:0%;height:100%;background:linear-gradient(90deg,#727070,#a2c62e);transition:width 1.2s cubic-bezier(0.16,1,0.3,1)',
                barContainer
            );

            // Version text (hidden initially)
            this.versionText = createElement('div',
                'font-family:monospace;font-size:11px;color:#3d3d3d;letter-spacing:3px;text-transform:uppercase;margin-top:16px;opacity:0;transition:all 0.4s ease',
                this.overlay
            );
            this.versionText.textContent = 'Bexalta OS v1.0';

            // Animate sequence
            requestAnimationFrame(() => {
                // Phase 1: Fill bar
                this.barFill.style.width = '100%';

                setTimeout(() => {
                    // Phase 2: Show version
                    this.statusText.style.color = '#C7C6C6';
                    this.statusText.textContent = 'Sistema operativo listo';
                    this.versionText.style.opacity = '1';
                    this.versionText.style.color = '#a2c62e';
                }, 1200);

                setTimeout(() => {
                    // Phase 3: Fade out
                    this.overlay.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1)';
                    this.overlay.style.opacity = '0';

                    setTimeout(() => {
                        this.overlay.remove();
                        sessionStorage.setItem('bx-preloader-done', '1');
                        resolve();
                    }, 800);
                }, 2200);
            });
        });
    }
}
