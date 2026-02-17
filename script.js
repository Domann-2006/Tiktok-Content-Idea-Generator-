// ====================================
// ====================================
// DOM Elements
// ====================================
const themeToggle = document.getElementById('themeToggle');
const ctaButton = document.getElementById('ctaButton');
const generatorForm = document.getElementById('generatorForm');
const nicheInput = document.getElementById('nicheInput');
const contentStyle = document.getElementById('contentStyle');
const ideaCountInput = document.getElementById('ideaCount');
const charCounter = document.getElementById('charCounter');
const generateButton = document.getElementById('generateButton');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const clearButton = document.getElementById('clearButton');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const countButtons = document.querySelectorAll('.count-btn');

// ====================================
// Dark Mode Functionality
// ====================================
function initTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// ====================================
// Smooth Scrolling
// ====================================
ctaButton.addEventListener('click', () => {
    document.getElementById('generatorSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
});

// ====================================
// Character Counter
// ====================================
nicheInput.addEventListener('input', (e) => {
    const currentLength = e.target.value.length;
    const maxLength = e.target.getAttribute('maxlength');
    charCounter.textContent = `${currentLength}/${maxLength}`;
    
    // Change color when approaching limit
    if (currentLength > maxLength * 0.9) {
        charCounter.style.color = 'var(--error)';
    } else {
        charCounter.style.color = 'var(--text-secondary)';
    }
});

// ====================================
// Idea Count Selector
// ====================================
countButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        countButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update hidden input value
        ideaCountInput.value = button.getAttribute('data-count');
    });
});

// ====================================
// Toast Notification
// ====================================
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ====================================
// Groq API Integration (Lightning Fast!)
// ====================================

async function generateIdeas(niche, style, count) {
    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ niche, style, count })
        });

        if (!response.ok) {
            throw new Error("Failed to generate ideas");
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Server error:", error);
        throw error;
    }
}
// ====================================
// Parse Ideas from API Response
// ====================================
function parseIdeas(responseText) {
    // Split by numbered patterns (1. 2. 3. etc. or 1) 2) 3) etc.)
    const ideas = [];
    const lines = responseText.split('\n');
    let currentIdea = '';
    
    for (let line of lines) {
        // Check if line starts with a number followed by . or )
        const numberMatch = line.match(/^(\d+)[.)\s]+(.+)/);
        
        if (numberMatch) {
            // Save previous idea if exists
            if (currentIdea.trim()) {
                ideas.push(currentIdea.trim());
            }
            // Start new idea
            currentIdea = numberMatch[2];
        } else if (line.trim() && !line.toLowerCase().includes('generate') && !line.toLowerCase().includes('requirement')) {
            // Continue current idea (filter out meta-text)
            if (currentIdea) {
                currentIdea += ' ' + line.trim();
            }
        }
    }
    
    // Add the last idea
    if (currentIdea.trim()) {
        ideas.push(currentIdea.trim());
    }
    
    return ideas;
}

// ====================================
// Display Results
// ====================================
function displayResults(ideas) {
    resultsGrid.innerHTML = '';
    
    ideas.forEach((idea, index) => {
        const card = createResultCard(idea, index + 1);
        resultsGrid.appendChild(card);
    });
    
    // Show results section
    resultsSection.classList.add('show');
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// ====================================
// Create Result Card
// ====================================
function createResultCard(ideaText, number) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    card.innerHTML = `
        <div class="result-card-header">
            <div class="result-number">${number}</div>
            <div class="card-actions">
                <button class="icon-button copy-btn" title="Copy to clipboard">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="icon-button regenerate-btn" title="Regenerate this idea">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
            </div>
        </div>
        <p class="result-text">${ideaText}</p>
    `;
    
    // Add event listeners
    const copyBtn = card.querySelector('.copy-btn');
    const regenerateBtn = card.querySelector('.regenerate-btn');
    
    copyBtn.addEventListener('click', () => copyToClipboard(ideaText));
    regenerateBtn.addEventListener('click', () => regenerateIdea(card, number));
    
    return card;
}

// ====================================
// Copy to Clipboard
// ====================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy', 2000);
        }
        
        document.body.removeChild(textArea);
    }
}

// ====================================
// Regenerate Single Idea
// ====================================
async function regenerateIdea(card, number) {
    const niche = nicheInput.value.trim();
    const style = contentStyle.value;
    
    // Show loading state
    const resultText = card.querySelector('.result-text');
    const originalText = resultText.textContent;
    resultText.innerHTML = '<span style="color: var(--text-secondary);">⚡ Regenerating...</span>';
    
    try {
        const newIdea = await generateIdeas(niche, style, 1);
        const ideas = parseIdeas(newIdea);
        
        if (ideas.length > 0) {
            resultText.textContent = ideas[0];
            
            // Add animation
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = 'slideIn 0.4s ease';
            }, 10);
            
            showToast('⚡ Idea regenerated!');
        } else {
            resultText.textContent = originalText;
            showToast('Failed to regenerate idea', 2000);
        }
    } catch (error) {
        resultText.textContent = originalText;
        showToast('Error regenerating idea', 2000);
        console.error('Regenerate error:', error);
    }
}

// ====================================
// Form Submission
// ====================================
generatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const niche = nicheInput.value.trim();
    const style = contentStyle.value;
    const count = parseInt(ideaCountInput.value);
    
    // Validate input
    if (!niche) {
        showToast('Please enter a niche or topic', 2000);
        nicheInput.focus();
        return;
    }
    
    // Show loading state
    generateButton.classList.add('loading');
    generateButton.disabled = true;
    
    // Track start time to show speed
    const startTime = performance.now();
    
    try {
        // Generate ideas
        const response = await generateIdeas(niche, style, count);
        const ideas = parseIdeas(response);
        
        // Calculate response time
        const endTime = performance.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        // Check if we got ideas
        if (ideas.length === 0) {
            throw new Error('No ideas generated');
        }
        
        // Display results
        displayResults(ideas);
        showToast(`⚡ ${ideas.length} ideas generated in ${responseTime}s!`, 4000);
        
    } catch (error) {
        console.error('Generation error:', error);
        
        let errorMessage = 'Failed to generate ideas. ';
        
        if (error.message.includes('API key') || error.message.includes('invalid')) {
            errorMessage += 'Please check your Groq API key.';
        } else if (error.message.includes('rate') || error.message.includes('limit')) {
            errorMessage += 'Rate limit reached. Please wait a moment.';
        } else if (error.message.includes('quota')) {
            errorMessage += 'Free tier quota exceeded. Try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Network error. Please check your connection.';
        } else {
            errorMessage += 'Please try again.';
        }
        
        showToast(errorMessage, 4000);
    } finally {
        // Remove loading state
        generateButton.classList.remove('loading');
        generateButton.disabled = false;
    }
});

// ====================================
// Clear Results
// ====================================
clearButton.addEventListener('click', () => {
    resultsGrid.innerHTML = '';
    resultsSection.classList.remove('show');
    showToast('Results cleared');
    
    // Scroll back to form
    document.getElementById('generatorSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
});

// ====================================
// Initialize App
// ====================================
function init() {
    initTheme();
    console.log('⚡ TikTok Content Idea Generator - Groq Edition (Ultra Fast!)');
    console.log('Expected speed: 0.5-2 seconds per request!');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ====================================
// Keyboard Shortcuts
// ====================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === nicheInput) {
            generatorForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to clear results
    if (e.key === 'Escape' && resultsSection.classList.contains('show')) {
        clearButton.click();
    }
});
