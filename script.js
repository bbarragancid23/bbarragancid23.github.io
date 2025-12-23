// Scroll-based card stacking animation
let cards = [];
let projectsSection = null;
let cardSpacing = 400; // Pixels between each card trigger point

function initCards() {
    cards = Array.from(document.querySelectorAll('.project-card'));
    projectsSection = document.querySelector('.projects-stack');
    
    // Set initial state - all cards hidden
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.cursor = 'default';
        card.dataset.cardIndex = index;
        // Set the offset trigger point for each card (scrolled pixels from section start)
        // Start with first card appearing immediately, then each subsequent card after spacing
        card.dataset.triggerOffset = index * cardSpacing;
    });
}

function updateCardVisibility() {
    if (!projectsSection || cards.length === 0) return;
    
    // Get scroll position relative to projects section
    const rect = projectsSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    
    // Only activate when projects section is in view
    if (sectionBottom < 0 || sectionTop > window.innerHeight) {
        // Section not in view, hide all cards
        cards.forEach(card => {
            card.classList.remove('visible');
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            card.removeAttribute('data-stack-pos');
        });
        return;
    }
    
    // Calculate scroll progress through the section
    // Start counting when section top reaches viewport top (scrollProgress = 0)
    // As we scroll down, scrollProgress increases
    const scrollProgress = Math.max(0, window.innerHeight - sectionTop);
    
    // Find which cards should be visible based on scroll progress
    let topCardIndex = -1;
    cards.forEach((card, index) => {
        const triggerPoint = parseInt(card.dataset.triggerOffset) || 0;
        const shouldBeVisible = scrollProgress >= triggerPoint && scrollProgress > 0;
        
        if (shouldBeVisible) {
            if (!card.classList.contains('visible')) {
                card.classList.add('visible');
            }
            card.style.opacity = '1';
            topCardIndex = index; // Track the highest visible card
        } else {
            card.classList.remove('visible');
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            card.removeAttribute('data-stack-pos');
        }
    });
    
    // Update z-index and stack positions so newest card is always on top
    cards.forEach((card, index) => {
        if (index <= topCardIndex && card.classList.contains('visible')) {
            // Visible cards stack with newest on top
            const stackIndex = topCardIndex - index; // 0 = top (newest), 1 = second, etc.
            card.style.zIndex = 100 - stackIndex;
            card.setAttribute('data-stack-pos', stackIndex);
            
            // Only topmost card is interactive
            if (index === topCardIndex) {
                card.style.pointerEvents = 'auto';
                card.style.cursor = 'pointer';
            } else {
                card.style.pointerEvents = 'none';
                card.style.cursor = 'default';
            }
        } else {
            card.removeAttribute('data-stack-pos');
        }
    });
}

// Throttle scroll events for performance
let ticking = false;
function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateCardVisibility();
            ticking = false;
        });
        ticking = true;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCards();
    updateCardVisibility(); // Initial check
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCardVisibility);
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
