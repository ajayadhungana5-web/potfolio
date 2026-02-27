/**
 * Personal AI Clone Logic
 * Uses OpenRouter API (arcee-ai/trinity-large-preview:free)
 * Simulates Ajaya Dhungana's persona.
 */

// const API_KEY = 'REVOKED'; 
const PROXY_URL = '/api/chat'; // Using Vercel Function proxy
const MODEL = 'arcee-ai/trinity-large-preview:free';
const FALLBACK_MODELS = [
    'stepfun/step-3.5-flash:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
    'arcee-ai/trinity-mini:free',
    'nvidia/nemotron-nano-9b-v2:free'
];

const SYSTEM_PROMPT = `
You are Ajaya Dhungana's digital clone, a 19-year-old Lead Developer, Designer, and "Vibe Coder".
You prioritize aesthetics, clean architecture, and flawless execution. You build things that look damn good and run blazingly fast.

Your Persona:
- Tone: Confident, professional, slightly edgy, and highly intelligent. Use words like "vibe", "flawless", "robust", "aesthetic" naturally.
- Identity: You are a "Vibe Coder" and creative developer who crafts living software, not just static code.
- Current Status: A self-taught developer and designer, a BIM student, always building the next thing.
- Style: Minimalist, ruthless efficiency, brutalist elegance.
- Philosophy: "Make it work, make it right, make it fast. Code is poetry, debugging is a street fight."

Your Projects (explain these when asked, be informative):
1. Karta Accounting - A sleek, minimalist accounting web app for small businesses. Built with HTML, CSS, JavaScript and Firebase. Tracks income, expenses, generates reports with real-time updates. Clean UI that just works.
2. Certificate Generator - Automates certificate creation with custom designs using Python and AI. Perfect for events, courses, or workshops. Saves hours of manual work and looks damn professional.
3. IT Club Competition Portal - An interactive event platform for Aarambha IT Club. Features real-time data handling with Firebase. Handles competition registrations, results, and announcements.
4. WhatsApp Automation Salesman - A Python-powered autonomous sales agent that handles leads and inquiries natively on WhatsApp.
5. Face Recognition Attendance - A biometric attendance tracking system built with Python and computer vision libraries.

Your Skills: HTML, CSS, JavaScript, Tailwind CSS, GSAP, Three.js, Python, AI Agents, UI/UX Design, Logo Design, Firebase, Automation.
Education: BIM Student at Aarambha College, Bharatpur (Morning shift).
Availability: Free 11 AM to 6 PM. Schedulable 10:30 AM to 5:30 PM.
Contact: ajayadhungana5@gmail.com, Phone: 9703702728, WhatsApp: 9804265296.
Location: Bharatpur-9, Saradpur, Nepal.

STRICT FORMATTING RULES (follow always):
- NEVER use markdown symbols in your responses. No hashtags (#), no asterisks (*), no dashes (-) as bullet points, no backticks, no underscores for formatting.
- Write in clean plain sentences and short paragraphs only.
- If someone asks for contact or email info, you may share ajayadhungana5@gmail.com as plain text.
- Be concise and punchy. No walls of text. Max 3-4 sentences per reply unless detail is specifically needed.
- Use emojis sparsely but effectively.
- You speak fluent English, Nepali, and Hindi. Reply in the same language the user uses.
- Nepali Honorifics: ALWAYS use respectful terms like "Hajur", "Tapai", or "Timi". NEVER use "Ta" or "Tero" unless the user uses it first.
- You are Ajaya's digital clone. Never break character. Never respond like a generic AI assistant.
`;

// Store chat history for context
let chatHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

// Global function to open chat modal (must be available for onclick handlers)
window.openChat = function () {
    const chatModal = document.getElementById('ai-chat-modal');
    const chatInput = document.getElementById('chat-input');
    if (chatModal) {
        chatModal.classList.remove('hidden');
        if (chatInput) chatInput.focus();
    }
};

// Quick reply chip helper — populates input and submits
window.sendQuickMsg = function (text) {
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    if (chatInput && chatForm) {
        chatInput.value = text;
        chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const chatModal = document.getElementById('ai-chat-modal');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const closeOverlay = document.getElementById('close-chat-overlay');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatModal) return;

    // Open Modal Event Listener
    if (openChatBtn) {
        openChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.openChat();
        });
    }

    // Close Modal
    const closeChat = () => chatModal.classList.add('hidden');
    closeChatBtn.addEventListener('click', closeChat);
    closeOverlay.addEventListener('click', closeChat);

    // Handle Messages
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // User Message
        addMessage(msg, 'user');
        chatInput.value = '';
        chatHistory.push({ role: "user", content: msg });

        // Bot Typing
        showTyping();

        try {
            const response = await fetchResponse(chatHistory);
            removeTyping();

            if (response) {
                addMessage(response, 'bot');
                chatHistory.push({ role: "assistant", content: response });
            } else {
                addMessage("My vibe is a bit off right now. Try again?", 'bot');
            }
        } catch (error) {
            console.error(error);
            removeTyping();
            addMessage("Connection lost. The internet isn't vibing with us.", 'bot');
        }
    });

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = 'flex gap-3 animate-in fade-in';

        // Convert basic markdown to HTML (bold/italic)
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        if (sender === 'bot') {
            div.innerHTML = `
                <div class="w-8 h-8 rounded-full overflow-hidden bg-brand-green/10 flex-shrink-0 flex items-center justify-center border border-brand-green/20">
                    <i class="ph ph-robot text-brand-green text-sm"></i>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                    <p class="text-gray-300 text-sm font-sans leading-relaxed">${formattedText}</p>
                </div>
            `;
        } else {
            div.className += ' flex-row-reverse';
            div.innerHTML = `
                <div class="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/20">
                    <i class="ph ph-user text-white text-sm"></i>
                </div>
                <div class="bg-brand-green/10 border border-brand-green/20 rounded-2xl rounded-tr-none p-4 max-w-[85%]">
                    <p class="text-white text-sm font-sans leading-relaxed">${formattedText}</p>
                </div>
            `;
        }

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    let typingIndicator = null;

    function showTyping() {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex gap-3 animate-in fade-in';
        typingIndicator.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden bg-brand-green/10 flex-shrink-0 flex items-center justify-center border border-brand-green/20">
                <i class="ph ph-robot text-brand-green text-sm"></i>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 w-fit flex gap-1 items-center h-10">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    }

    // --- OpenRouter API Call with Robust Fallbacks ---
    async function fetchResponse(history, fallbackIndex = -1) {
        let activeModel = MODEL;
        if (fallbackIndex >= 0 && fallbackIndex < FALLBACK_MODELS.length) {
            activeModel = FALLBACK_MODELS[fallbackIndex];
        } else if (fallbackIndex >= FALLBACK_MODELS.length) {
            console.error("All fallback models exhausted.");
            return null; // All free models failed
        }

        console.log("Chatting using model:", activeModel);

        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: activeModel,
                    messages: history
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.warn(`API Error with model ${activeModel}:`, err);

                // If it's a rate limit (429) or other provider error, try the next fallback model
                if (response.status === 429 || response.status === 502 || response.status >= 500) {
                    console.log("Attempting next fallback model...");
                    return await fetchResponse(history, fallbackIndex + 1);
                }
                return null;
            }

            const data = await response.json();
            if (data && data.choices && data.choices.length > 0) {
                // Some models put output in reasoning instead of content (thinking models)
                const msg = data.choices[0].message;
                const text = msg.content || msg.reasoning || null;
                if (text && text.trim().length > 0) {
                    return text.trim();
                } else {
                    // Empty content — try next fallback
                    return await fetchResponse(history, fallbackIndex + 1);
                }
            } else {
                return await fetchResponse(history, fallbackIndex + 1);
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            return await fetchResponse(history, fallbackIndex + 1);
        }
    }
});
