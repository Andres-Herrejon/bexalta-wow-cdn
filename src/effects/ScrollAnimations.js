/**
 * ScrollAnimations — Consolidated GSAP scroll-triggered animations
 * Capability cascade, stats fade-in, paragraphs, roadmap, CTA
 */



export class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.capabilityCascade();
        this.statsFadeIn();
        this.paragraphsFadeIn();
        this.roadmapCascade();
        this.ctaEntrance();
        this.heroEntrance();
    }

    /** S3: Capability cards cascade in */
    capabilityCascade() {
        const items = document.querySelectorAll('.bx-capability');
        if (!items.length) return;

        if (!items.length || !window.gsap) return;

        window.gsap.from(items, {
            scrollTrigger: { trigger: '#s3-bexalta-os', start: 'top 70%' },
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out'
        });
    }

    /** S4: Stats count in */
    statsFadeIn() {
        const stats = document.querySelectorAll('.bx-stat');
        if (!stats.length) return;

        if (!stats.length || !window.gsap) return;

        window.gsap.from(stats, {
            scrollTrigger: { trigger: '#s4-impacto', start: 'top 75%' },
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out'
        });
    }

    /** S2, S5: Body paragraphs fade in */
    paragraphsFadeIn() {
        const sections = ['#s2-vision', '#s5-futuro'];
        sections.forEach(sel => {
            const section = document.querySelector(sel);
            if (!section) return;

            const paragraphs = section.querySelectorAll('.bx-body, p');
            if (!paragraphs.length) return;

            if (!window.gsap) return;

            window.gsap.from(paragraphs, {
                scrollTrigger: { trigger: section, start: 'top 70%' },
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            });
        });
    }

    /** S6: Roadmap items cascade */
    roadmapCascade() {
        const items = document.querySelectorAll('.bx-roadmap-item');
        if (!items.length) return;

        if (!items.length || !window.gsap) return;

        window.gsap.from(items, {
            scrollTrigger: { trigger: '#s6-foundtech', start: 'top 65%' },
            x: -30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }

    /** S7: CTA dramatic entrance */
    ctaEntrance() {
        const cta = document.querySelector('.bx-cta-section');
        if (!cta) return;

        const heading = cta.querySelector('h2, .bx-h2');
        const button = cta.querySelector('.bx-cta-button');
        const micro = cta.querySelector('.bx-cta-micro');

        if (!window.gsap) return;

        const tl = window.gsap.timeline({
            scrollTrigger: { trigger: cta, start: 'top 75%' }
        });

        if (heading) tl.from(heading, { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' });
        if (button) tl.from(button, { y: 20, opacity: 0, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.2');
        if (micro) tl.from(micro, { opacity: 0, duration: 0.4 }, '-=0.1');
    }

    /** S1: Hero text entrance on load */
    heroEntrance() {
        const hero = document.querySelector('.bx-hero');
        if (!hero) return;

        const h1 = hero.querySelector('.bx-h1, h1');
        const sub = hero.querySelector('.bx-subhead');

        if (h1 && window.gsap) {
            window.gsap.from(h1, { y: 40, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
        }
        if (sub && window.gsap) {
            window.gsap.from(sub, { y: 30, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' });
        }
    }
}
