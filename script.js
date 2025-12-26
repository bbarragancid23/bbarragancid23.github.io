// Scroll-in animations for section headers
const headerObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, headerObserverOptions);

// Projects card scroll animation
let projectCards = [];
let projectsSection = null;
const cardSpacing = 1200; // Distance between card triggers

function initProjects() {
    projectsSection = document.querySelector('.projects-container');
    if (!projectsSection) return;
    
    projectCards = Array.from(document.querySelectorAll('.project-card'));
    
    projectCards.forEach((card, index) => {
        card.dataset.index = index;
        card.classList.add('entering');
        card.style.position = 'absolute';
        card.style.top = 'auto';
        card.style.bottom = '0';
        card.style.left = '50%';
        card.style.transform = 'translateX(-50%) translateY(100%) scale(1.15)';
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
        card.style.pointerEvents = 'none';
        
        // Set trigger points for each card
        const triggerOffset = index * cardSpacing;
        card.dataset.triggerOffset = triggerOffset;
    });
}

function updateProjectCards() {
    if (!projectsSection || projectCards.length === 0) return;
    
    const rect = projectsSection.getBoundingClientRect();
    const containerTop = rect.top;
    const viewportHeight = window.innerHeight;
    
    // Only process if container is in view or approaching
    // Calculate scroll progress: distance from container top to viewport bottom
    // This increases as we scroll through the container
    // Start calculations only when container top is at or below viewport
    const scrollProgress = containerTop <= viewportHeight ? Math.max(0, viewportHeight - containerTop) : -1;
    
    // If we haven't entered the projects section yet, hide all cards
    if (scrollProgress < 0) {
        projectCards.forEach((card) => {
            card.classList.remove('placing', 'placed', 'clickable');
            card.classList.add('entering');
            card.style.position = 'absolute';
            card.style.top = 'auto';
            card.style.bottom = '0';
            card.style.left = '50%';
            card.style.transform = 'translateX(-50%) translateY(100%) scale(1.15)';
            card.style.pointerEvents = 'none';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
        });
        return;
    }
    
    let stickyCardIndex = -1;
    let placingCardIndex = -1;
    
    projectCards.forEach((card, index) => {
        const triggerOffset = parseInt(card.dataset.triggerOffset) || 0;
        const placementDuration = 1200; // Increase duration for slower movement
        const isTriggered = scrollProgress >= triggerOffset;
        const isCurrentlyPlacing = scrollProgress >= triggerOffset && scrollProgress < triggerOffset + placementDuration;
        const isPlaced = scrollProgress >= triggerOffset + placementDuration;
        
        if (isPlaced) {
            // Card is placed and sticky
            const thumbnail = card.querySelector('.project-thumbnail');
            const title = card.querySelector('.project-title');
            
            // Debug BEFORE making changes
            const beforeRect = card.getBoundingClientRect();
            const beforeStyles = window.getComputedStyle(card);
            
            card.classList.remove('entering', 'placing');
            card.classList.add('placed');
            stickyCardIndex = index;
            card.classList.add('clickable');
            
            // Clear ALL inline positioning styles - let CSS class handle everything
            // This is critical: inline styles override CSS, so we need to remove them
            // The CSS class .project-card.placed will handle all positioning
            card.style.position = '';
            card.style.top = '';
            card.style.left = '';
            card.style.transform = '';
            card.style.bottom = '';
            card.style.width = '';
            card.style.height = '';
            card.style.maxWidth = '';
            card.style.minHeight = '';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            
            // Force a reflow to ensure the browser recalculates layout
            void card.offsetHeight;
            
        } else if (isCurrentlyPlacing) {
            // Card is being placed (moving from bottom to center and shrinking)
            card.classList.remove('entering', 'placed');
            card.classList.add('placing');
            placingCardIndex = index;
            card.classList.add('clickable');
            
            // Calculate placement progress (0 to 1)
            const placeProgress = Math.min(1, (scrollProgress - triggerOffset) / placementDuration);
            const easedProgress = 1 - Math.pow(1 - placeProgress, 2); // Ease out quadratic
            
            // Start bigger (15% larger), shrink to final size
            const startScale = 1.15;
            const finalScale = 1;
            const currentScale = startScale - (startScale - finalScale) * easedProgress;
            
            // Move from bottom of viewport to center
            // Start at 100vh (bottom of viewport), end at 50vh (center)
            const startPosition = 150; // Bottom of viewport
            const endPosition = 50; // Center of viewport
            const currentPosition = startPosition - (startPosition - endPosition) * easedProgress;
            
            card.style.position = 'fixed'; // Fixed positioning during placement for smooth animation
            card.style.top = `${currentPosition}vh`;
            card.style.left = '50%';
            card.style.transform = `translateX(-50%) translateY(-50%) scale(${currentScale})`;
            card.style.bottom = 'auto';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
        } else if (!isTriggered) {
            // Card hasn't been triggered yet - keep it hidden below viewport
            card.classList.remove('placing', 'placed', 'clickable');
            card.classList.add('entering');
            card.style.position = 'absolute';
            card.style.top = 'auto';
            card.style.bottom = '0';
            card.style.left = '50%';
            card.style.transform = 'translateX(-50%) translateY(100%) scale(1.15)';
            card.style.pointerEvents = 'none';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
        }
    });
    
    // Only allow max 2 cards to be clickable: sticky card and placing card
    projectCards.forEach((card, index) => {
        if (index !== stickyCardIndex && index !== placingCardIndex) {
            card.classList.remove('clickable');
            card.style.pointerEvents = 'none';
        } else {
            card.classList.add('clickable');
            card.style.pointerEvents = 'auto';
        }
    });
}

// Scroll handler
let ticking = false;
function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateProjectCards();
            ticking = false;
        });
        ticking = true;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Observe section headers for scroll-in animation
    const aboutHeader = document.querySelector('.about-header');
    const projectsHeader = document.querySelector('.projects-header');
    
    if (aboutHeader) headerObserver.observe(aboutHeader);
    if (projectsHeader) headerObserver.observe(projectsHeader);
    
    // Initialize projects
    initProjects();
    updateProjectCards();
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProjectCards);
});

