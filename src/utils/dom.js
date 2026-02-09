/**
 * DOM utility helpers for Bexalta WOW effects
 */

/** Wait for an element to exist in DOM */
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

/** Get current scroll progress 0-1 */
export function getScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? scrollTop / docHeight : 0;
}

/** Detect mobile */
export function isMobile() {
    return window.innerWidth < 768;
}

/** Create and inject a DOM element */
export function createElement(tag, styles, parent = document.body, prepend = false) {
    const el = document.createElement(tag);
    if (typeof styles === 'string') {
        el.style.cssText = styles;
    } else if (typeof styles === 'object') {
        Object.assign(el.style, styles);
    }
    if (prepend) {
        parent.prepend(el);
    } else {
        parent.appendChild(el);
    }
    return el;
}
