// FriendAI App Logic - No AI Required!

// State management
let currentMode = 'warm';
let templates = {};
let usageCount = 0;

// Load templates on page load
async function loadTemplates() {
    try {
        const templateFiles = [
            'warm_replies',
            'confident_replies',
            'simple_replies',
            'smalltalk_starters',
            'calm_scripts'
        ];

        for (const file of templateFiles) {
            const response = await fetch(`templates/${file}.json`);
            templates[file] = await response.json();
        }

        console.log('Templates loaded successfully!');
    } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback templates if files don't load
        loadFallbackTemplates();
    }
}

// Fallback templates in case JSON files fail to load
function loadFallbackTemplates() {
    templates = {
        warm_replies: {
            responses: [
                "That sounds lovely! I'd really enjoy that 😊",
                "I'd love to! Thanks so much for thinking of me.",
                "Yes! That would be wonderful.",
                "Absolutely! That sounds like so much fun."
            ]
        },
        confident_replies: {
            responses: [
                "Sounds good! I'm in.",
                "Yes, let's do it.",
                "Count me in!",
                "That works for me."
            ]
        },
        simple_replies: {
            responses: [
                "Sure!",
                "Yes, that works.",
                "Sounds good!",
                "I'm in."
            ]
        },
        smalltalk_starters: {
            starters: [
                "How's your week going?",
                "What have you been up to?",
                "How have you been?",
                "What's new with you?"
            ]
        },
        calm_scripts: {
            scripts: [
                "Take a breath. You've got this. They reached out because they want to connect with you.",
                "It's okay to feel nervous. Whatever you send will be appreciated.",
                "Pause. Breathe. You don't have to be perfect."
            ]
        }
    };
}

// DOM elements
const messageInput = document.getElementById('message-input');
const modeButtons = document.querySelectorAll('.mode-btn');
const generateBtn = document.getElementById('generate-btn');
const resultsSection = document.getElementById('results-section');
const suggestionsContainer = document.getElementById('suggestions-container');
const regenerateBtn = document.getElementById('regenerate-btn');

// Mode selection
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    });
});

// Generate suggestions
generateBtn.addEventListener('click', () => {
    const inputText = messageInput.value.trim();

    if (!inputText && currentMode !== 'smalltalk' && currentMode !== 'calm') {
        alert('Please paste a message first, or choose "Start Small Talk" mode!');
        return;
    }

    generateSuggestions(inputText);
    trackUsage();
});

// Regenerate button
regenerateBtn.addEventListener('click', () => {
    const inputText = messageInput.value.trim();
    generateSuggestions(inputText);
});

// Main generation logic
function generateSuggestions(inputText) {
    let suggestions = [];

    switch (currentMode) {
        case 'warm':
            suggestions = getWarmReplies(inputText);
            break;
        case 'confident':
            suggestions = getConfidentReplies(inputText);
            break;
        case 'simple':
            suggestions = getSimpleReplies(inputText);
            break;
        case 'smalltalk':
            suggestions = getSmalltalkStarters();
            break;
        case 'calm':
            suggestions = getCalmScripts();
            break;
    }

    displaySuggestions(suggestions);
}

// Get warm replies
function getWarmReplies(inputText) {
    const context = detectContext(inputText);
    let pool = [...templates.warm_replies.responses];

    // Add context-specific replies if available
    if (context && templates.warm_replies.context[context]) {
        pool = [...pool, ...templates.warm_replies.context[context]];
    }

    return getRandomItems(pool, 4);
}

// Get confident replies
function getConfidentReplies(inputText) {
    const context = detectContext(inputText);
    let pool = [...templates.confident_replies.responses];

    if (context && templates.confident_replies.context[context]) {
        pool = [...pool, ...templates.confident_replies.context[context]];
    }

    return getRandomItems(pool, 4);
}

// Get simple replies
function getSimpleReplies(inputText) {
    const isQuestion = inputText.includes('?');
    const pool = isQuestion ?
        templates.simple_replies.yes_variants :
        templates.simple_replies.responses;

    return getRandomItems(pool, 5);
}

// Get smalltalk starters
function getSmalltalkStarters() {
    return getRandomItems(templates.smalltalk_starters.starters, 5);
}

// Get calm scripts
function getCalmScripts() {
    const scripts = getRandomItems(templates.calm_scripts.scripts, 2);
    const quickCalms = getRandomItems(templates.calm_scripts.quick_calms, 3);
    return [...scripts, ...quickCalms];
}

// Context detection
function detectContext(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('great') || lowerText.includes('amazing') ||
        lowerText.includes('awesome') || lowerText.includes('good job')) {
        return 'compliment';
    }

    if (lowerText.includes('?')) {
        return 'question';
    }

    if (lowerText.includes('meet') || lowerText.includes('coffee') ||
        lowerText.includes('lunch') || lowerText.includes('dinner')) {
        return 'meeting';
    }

    if (lowerText.includes('can you') || lowerText.includes('could you') ||
        lowerText.includes('help')) {
        return 'favor';
    }

    return null;
}

// Display suggestions
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';

    suggestions.forEach((text, index) => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <div class="suggestion-text">${text}</div>
            <div class="copy-hint">👆 Click to copy</div>
        `;

        card.addEventListener('click', () => {
            copyToClipboard(text, card);
        });

        suggestionsContainer.appendChild(card);
    });

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Copy to clipboard
function copyToClipboard(text, cardElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        cardElement.classList.add('copied');
        cardElement.innerHTML = `
            <div class="suggestion-text">${text}</div>
            <div class="copied-message">✅ Copied to clipboard!</div>
        `;

        setTimeout(() => {
            cardElement.classList.remove('copied');
            cardElement.innerHTML = `
                <div class="suggestion-text">${text}</div>
                <div class="copy-hint">👆 Click to copy</div>
            `;
        }, 2000);
    }).catch(err => {
        alert('Copy failed. Please select and copy manually.');
    });
}

// Utility: Get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
}

// Track usage (stored locally)
function trackUsage() {
    usageCount++;
    localStorage.setItem('friendai_usage', usageCount);

    // Show encouragement milestones
    if (usageCount === 1) {
        console.log('🎉 First message! You\'re doing great!');
    } else if (usageCount === 10) {
        console.log('🌟 10 messages generated! You\'re building confidence!');
    } else if (usageCount === 50) {
        console.log('💪 50 messages! Social anxiety doesn\'t stand a chance!');
    }
}

// Load saved usage count
function loadUsageCount() {
    const saved = localStorage.getItem('friendai_usage');
    if (saved) {
        usageCount = parseInt(saved);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();
    loadUsageCount();
    console.log('FriendAI loaded! Ready to help. 💙');
});