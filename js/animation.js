/**
 * Scroll-Triggered Animation System
 * 
 * This script provides a reusable animation system that triggers
 * when elements become visible in the viewport. It uses the
 * Intersection Observer API for optimal performance.
 * 
 * Immediate animation triggering:
 * - All screen sizes: threshold 0.01, rootMargin -5%
 * - Triggers animation as soon as any part of element is visible
 * - No delay or lag - immediate visual feedback
 * - Snappy and responsive element appearance
 * - Works globally across all pages (Home, About, Services, etc.)
 */

class ScrollAnimation {
    constructor() {
        // Animation classes that will be automatically applied
        this.animationClasses = [
            'fade-in-up',
            'fade-in-down', 
            'fade-in-left',
            'fade-in-right',
            'scale-in'
        ];
        
        // Elements that should be animated
        this.targetElements = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div',
            'form', 'input', 'textarea', 'button',
            '.card', '.service-card', '.stat-card',
            '.contact__item', '.about__text', '.hero__text',
            '.footer__section:not(.footer__bottom)', '.social-link',
            '.services-overview__title', '.why-choose-services__title', '.service-process__title',
            '.cta__title', '.services-hero__title'
        ];
        
        // Elements that should NOT be animated (always visible)
        this.excludedElements = [
            '.footer__bottom',
            '.footer__bottom *',
            '.footer__copyright',
            '.footer__bottom-links',
            '.footer__bottom-content'
        ];
        
        // Intersection Observer options - optimized for mobile responsiveness
        this.observerOptions = {
            root: null, // Use viewport as root
            rootMargin: this.getRootMargin(), // Dynamic margin based on screen size
            threshold: this.getThreshold() // Dynamic threshold based on screen size
        };
        
        this.init();
    }
    
    /**
     * Get root margin for immediate animation triggering
     * @returns {string} - CSS margin value
     */
    getRootMargin() {
        // Start animation immediately as element approaches viewport
        return '0px 0px -5% 0px';
    }
    
    /**
     * Get threshold for immediate animation triggering
     * @returns {number} - Threshold value between 0 and 1
     */
    getThreshold() {
        // Trigger animation as soon as any part of element is visible
        return 0.01;
    }
    
    /**
     * Initialize the animation system
     */
    init() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            this.fallbackAnimation();
            return;
        }
        
        // Create the observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );
        
        // Start observing elements
        this.observeElements();
        
        // Handle dynamic content (if any)
        this.handleDynamicContent();
        
        // Handle screen resize for responsive animation settings
        this.handleResize();
    }
    
    /**
     * Handle intersection observer entries
     * @param {IntersectionObserverEntry[]} entries - Array of intersection entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Use requestAnimationFrame for smoother animation triggering
                requestAnimationFrame(() => {
                    // Add active class to trigger animation
                    element.classList.add('active');
                    
                    // Stop observing this element (animate only once)
                    this.observer.unobserve(element);
                    
                    // Add a data attribute to mark as animated
                    element.setAttribute('data-animated', 'true');
                });
            }
        });
    }
    
    /**
     * Start observing elements for animation
     */
    observeElements() {
        // Collect all elements that should be animated
        const elementsToAnimate = [];
        
        this.targetElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                // Skip if already animated
                if (element.getAttribute('data-animated') === 'true') {
                    return;
                }
                
                // Skip if element is in excluded list
                if (this.isElementExcluded(element)) {
                    return;
                }
                
                // Check if element has any animation class
                const hasAnimationClass = this.animationClasses.some(className => 
                    element.classList.contains(className)
                );
                
                // If no animation class is present, add a default one
                if (!hasAnimationClass) {
                    element.classList.add('fade-in-up');
                }
                
                elementsToAnimate.push(element);
            });
        });
        
        // Batch observe elements for better performance
        elementsToAnimate.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    /**
     * Handle screen resize for consistent animation settings
     */
    handleResize() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            // Debounce resize events for better performance
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-observe elements to ensure animations work after resize
                this.observeElements();
            }, 250); // Wait 250ms after resize stops
        });
    }
    
    /**
     * Handle dynamically added content
     */
    handleDynamicContent() {
        // Create a MutationObserver to watch for new elements
        const mutationObserver = new MutationObserver((mutations) => {
            let shouldReobserve = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the new element should be animated (and not excluded)
                            const shouldAnimate = this.shouldAnimateElement(node) && !this.isElementExcluded(node);
                            if (shouldAnimate) {
                                shouldReobserve = true;
                            }
                        }
                    });
                }
            });
            
            // Re-observe elements if new content was added
            if (shouldReobserve) {
                this.observeElements();
            }
        });
        
        // Start observing the document body for changes
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Check if an element should be animated
     * @param {Element} element - The element to check
     * @returns {boolean} - Whether the element should be animated
     */
    shouldAnimateElement(element) {
        // Check if element matches any of our target selectors
        return this.targetElements.some(selector => {
            if (selector.startsWith('.')) {
                return element.classList.contains(selector.slice(1));
            } else {
                return element.tagName.toLowerCase() === selector.toLowerCase();
            }
        });
    }
    
    /**
     * Check if an element should be excluded from animation
     * @param {Element} element - The element to check
     * @returns {boolean} - Whether the element should be excluded
     */
    isElementExcluded(element) {
        // Check if element matches any of our excluded selectors
        return this.excludedElements.some(selector => {
            if (selector.includes('*')) {
                // Handle wildcard selectors like '.footer__bottom *'
                const baseSelector = selector.replace(' *', '');
                return element.closest(baseSelector) !== null;
            } else if (selector.startsWith('.')) {
                return element.classList.contains(selector.slice(1));
            } else {
                return element.tagName.toLowerCase() === selector.toLowerCase();
            }
        });
    }
    
    /**
     * Fallback animation for browsers without Intersection Observer
     */
    fallbackAnimation() {
        console.warn('Intersection Observer not supported. Using fallback animation.');
        
        // Simple fallback: animate all elements on page load
        setTimeout(() => {
            this.targetElements.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!element.classList.contains('active')) {
                        element.classList.add('fade-in-up', 'active');
                    }
                });
            });
        }, 100);
    }
    
    /**
     * Manually trigger animation for specific elements
     * @param {string|Element} selector - CSS selector or element
     */
    triggerAnimation(selector) {
        const elements = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];
            
        elements.forEach(element => {
            if (!element.classList.contains('active')) {
                element.classList.add('active');
                element.setAttribute('data-animated', 'true');
            }
        });
    }
    
    /**
     * Reset animations (for testing or dynamic content)
     */
    resetAnimations() {
        this.targetElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.remove('active');
                element.removeAttribute('data-animated');
            });
        });
        
        // Re-observe elements
        this.observeElements();
    }
}

// Initialize the animation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully rendered before starting observations
    setTimeout(() => {
        // Create global instance for potential external access
        window.scrollAnimation = new ScrollAnimation();
        
        // Optional: Add to window for debugging
        if (window.location.search.includes('debug=animations')) {
            console.log('Scroll Animation System initialized:', window.scrollAnimation);
        }
    }, 50);
});

// Handle page visibility changes (for better performance)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.scrollAnimation) {
        // Re-observe elements when page becomes visible again
        setTimeout(() => {
            window.scrollAnimation.observeElements();
        }, 100);
    }
}); 