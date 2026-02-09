
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class HorizontalScroll {
    constructor(containerId, contentId) {
        this.container = document.getElementById(containerId);
        this.content = document.getElementById(contentId);
        if (!this.container || !this.content) return;

        this.init();
    }

    init() {
        const scrollWidth = this.content.offsetWidth - window.innerWidth;

        gsap.to(this.content, {
            x: -scrollWidth,
            ease: "none",
            scrollTrigger: {
                trigger: this.container,
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => `+=${scrollWidth}`,
                invalidateOnRefresh: true
            }
        });
    }
}
