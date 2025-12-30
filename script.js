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
        else {
            entry.target.classList.remove('visible');
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
            
            card.classList.remove('entering', 'placing');
            card.classList.add('placed');
            stickyCardIndex = index;
            card.classList.add('clickable');

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
    const contactHeader = document.querySelector('.contact-header');
    
    if (aboutHeader) headerObserver.observe(aboutHeader);
    if (projectsHeader) headerObserver.observe(projectsHeader);
    if (contactHeader) headerObserver.observe(contactHeader);
    
    // Initialize projects
    initProjects();
    updateProjectCards();
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProjectCards);
    
    // Typewriter animation for about text
    initTypewriter();
    
    // Initialize video playback control
    initVideoPlayback();
    
    // Prevent button click from bubbling to card link
    const viewMoreButtons = document.querySelectorAll('.view-more-btn');
    viewMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Get the parent card link and trigger navigation
            const cardLink = button.closest('.project-card');
            if (cardLink && cardLink.href) {
                window.location.href = cardLink.href;
            }
        });
    });
});

// Video playback control - only play videos when visible
function initVideoPlayback() {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                // Video is visible, play it
                video.play().catch(err => {
                    // Ignore autoplay errors
                    console.log('Video autoplay prevented:', err);
                });
            } else {
                // Video is not visible, pause it to save performance
                video.pause();
            }
        });
    }, {
        threshold: [0, 0.3, 0.7, 1.0],
        rootMargin: '0px'
    });
    
    // Observe all videos in project cards
    const videos = document.querySelectorAll('.project-thumbnail video');
    videos.forEach(video => {
        // Ensure videos are muted and looping
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        videoObserver.observe(video);
    });
}

// Typewriter animation for code content
function initTypewriter() {
    const codeElement = document.querySelector('.about-text .code-content');
    if (!codeElement) return;
    
    // Store original text
    const originalText = codeElement.textContent;
    
    // Clear the text initially
    codeElement.textContent = '';
    
    // Observer to trigger when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !codeElement.dataset.typed) {
                codeElement.dataset.typed = 'true';
                typeWriter(codeElement, originalText);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        observer.observe(aboutSection);
    }
}

function typeWriter(element, text, index = 0, hasHighlighted = false) {
    if (index < text.length) {
        const currentText = text.substring(0, index + 1);
        const char = text[index];
        
        // Once we've highlighted once, always use innerHTML (highlighted) to preserve colors
        // Before first highlight, use textContent for raw typing
        if (hasHighlighted) {
            // We've already highlighted, so set raw text and re-highlight to preserve colors
            element.textContent = currentText;
            highlightCodeSyntax();
        } else {
            // Not highlighted yet, just set raw text
            element.textContent = currentText;
            
            // Apply syntax highlighting after whitespace characters (spaces, newlines, tabs)
            // This makes it look like a real IDE with live syntax highlighting
            if (/\s/.test(char)) {
                highlightCodeSyntax();
                hasHighlighted = true; // Mark that we've started highlighting
            }
        }
        
        // Adjust speed - faster for regular characters, slower for newlines
        const delay = char === '\n' ? 40 : 20; // 20ms per character (quick)
        setTimeout(() => typeWriter(element, text, index + 1, hasHighlighted), delay);
    } else {
        // Typing complete - final syntax highlighting to catch anything at the end
        element.textContent = text;
        highlightCodeSyntax();
    }
}

// Syntax highlighting function for Python-like code
function highlightCodeSyntax() {
    const codeElements = document.querySelectorAll('.code-content');
    codeElements.forEach(element => {
        let text = element.textContent;
        
        // Store original text to avoid double highlighting
        const originalText = text;
        
        // First, handle strings (to avoid highlighting keywords inside strings)
        const stringPlaceholders = [];
        text = text.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
            const placeholder = `__STRING_${stringPlaceholders.length}__`;
            stringPlaceholders.push(match);
            return placeholder;
        });
        
        // Handle triple-quoted strings
        text = text.replace(/(["'`]{3})(?:(?=(\\?))\2.)*?\1/g, (match) => {
            const placeholder = `__STRING_${stringPlaceholders.length}__`;
            stringPlaceholders.push(match);
            return placeholder;
        });
        
        // Handle comments (to avoid highlighting keywords in comments)
        const commentPlaceholders = [];
        text = text.replace(/#.*$/gm, (match) => {
            const placeholder = `__COMMENT_${commentPlaceholders.length}__`;
            commentPlaceholders.push(match);
            return placeholder;
        });
        
        // Python keywords (blue) - but not def/class as we handle those separately
        const keywords = /\b(if|elif|else|for|while|return|import|from|as|try|except|finally|with|and|or|not|in|is|None|True|False|break|continue|pass|lambda|yield|async|await|global|nonlocal)\b/g;
        text = text.replace(keywords, '<span class="code-keyword">$&</span>');
        
        // Function definitions (def + function name in red)
        text = text.replace(/\bdef\s+(\w+)/g, '<span class="code-keyword">def</span> <span class="code-function">$1</span>');
        
        // Class definitions (class + class name in red)
        text = text.replace(/\bclass\s+(\w+)/g, '<span class="code-keyword">class</span> <span class="code-class">$1</span>');
        
        // Numbers (slightly purple)
        text = text.replace(/\b\d+\.?\d*\b/g, '<span class="code-number">$&</span>');

        // Self (slightly purple)
        text = text.replace(/\bself\b/g, '<span class="code-self">self</span>');
        
        // Restore comments with highlighting
        commentPlaceholders.forEach((comment, index) => {
            text = text.replace(`__COMMENT_${index}__`, `<span class="code-comment">${comment}</span>`);
        });
        
        // Restore strings with highlighting
        stringPlaceholders.forEach((str, index) => {
            text = text.replace(`__STRING_${index}__`, `<span class="code-string">${str}</span>`);
        });
        
        element.innerHTML = text;
    });
}

