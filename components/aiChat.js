
export class AIChat {
    constructor() {
        this.isOpen = false;
        this.messages = JSON.parse(localStorage.getItem('chat_history') || '[]');
        this.dailyCount = parseInt(localStorage.getItem('chat_daily_count') || '0');
        this.lastDate = localStorage.getItem('chat_date');

        // Reset daily limit if new day
        const today = new Date().toDateString();
        if (this.lastDate !== today) {
            this.dailyCount = 0;
            localStorage.setItem('chat_date', today);
            localStorage.setItem('chat_daily_count', '0');
        }

        this.init();
    }

    init() {
        this.injectStyles();
        this.injectHTML();
        this.bindEvents();
        this.renderMessages();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Chat Button - Theme-aware colors */
            .ai-chat-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                /* Light mode: silver bg + black text, Dark mode: silver bg + white text */
                background: var(--bg-soft, #FAFAFA);
                color: var(--text-main, #000000);
                border: 2px solid var(--border-color, #000000);
                border-radius: 50%;
                box-shadow: var(--shadow-card);
                cursor: pointer;
                z-index: 9990;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, border-width 0.2s;
            }
            .ai-chat-btn:hover {
                transform: scale(1.1);
                box-shadow: var(--shadow-hover);
                border-width: 4px;
            }
            .ai-chat-btn:active {
                transform: scale(0.95);
            }
            .ai-chat-btn i {
                color: currentColor;
            }

            /* Chat Window - Monochrome High Contrast */
            .ai-chat-window {
                position: fixed;
                bottom: 100px;
                right: 30px;
                width: 380px;
                height: 550px;
                background: var(--bg-card, #ffffff);
                border: 3px solid var(--border-color, #000000);
                border-radius: var(--radius-md, 24px);
                box-shadow: var(--shadow-hover);
                display: flex;
                flex-direction: column;
                z-index: 9991;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px) scale(0.98);
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .ai-chat-window.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }

            /* Header */
            .ai-header {
                padding: 20px;
                background: var(--bg-dark, #000000);
                color: var(--text-light, #ffffff);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid var(--border-color, #000000);
            }
            .ai-info h4 {
                margin: 0;
                font-family: var(--font-head);
                font-size: 1.1rem;
                font-weight: 700;
            }
            .ai-status {
                font-size: 0.7rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .status-dot {
                width: 10px;
                height: 10px;
                background: var(--accent-highlight, #FF0000);
                border-radius: 50%;
                border: 2px solid var(--text-light);
            }

            /* Body */
            .ai-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: var(--bg-soft, #fafafa);
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .ai-msg {
                max-width: 85%;
                padding: 12px 18px;
                border-radius: 16px;
                font-size: 0.95rem;
                line-height: 1.5;
                font-weight: 500;
                border: 2px solid var(--border-color);
            }
            .ai-msg.bot {
                background: var(--bg-card, #ffffff);
                color: var(--text-main, #000000);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            .ai-msg.user {
                background: var(--bg-dark, #000000);
                color: var(--text-light, #ffffff);
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                border: none;
            }

            /* Typing Indicator - Pure Monochrome */
            .typing-indicator {
                display: flex;
                gap: 6px;
                padding: 12px 18px;
                background: var(--bg-card);
                border: 2px solid var(--border-color);
                border-radius: 16px;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                display: none;
            }
            .typing-dot {
                width: 8px;
                height: 8px;
                background: var(--text-main);
                border-radius: 50%;
                animation: typing 1s infinite alternate ease-in-out;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-5px); opacity: 0.3; }
            }

            /* Footer */
            .ai-footer {
                padding: 15px;
                background: var(--bg-card);
                border-top: 3px solid var(--border-color);
                display: flex;
                gap: 12px;
            }
            .ai-input {
                flex: 1;
                padding: 12px 20px;
                border: 2px solid var(--border-color);
                border-radius: var(--radius-pill);
                font-family: inherit;
                font-size: 0.95rem;
                background: var(--bg-soft);
                color: var(--text-main);
                outline: none;
                transition: border-width 0.2s;
            }
            .ai-input:focus {
                border-width: 3px;
                border-color: var(--accent-highlight);
            }
            .ai-send-btn {
                background: var(--bg-dark);
                color: var(--text-light);
                border: none;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, background-color 0.2s;
            }
            .ai-send-btn:hover {
                transform: scale(1.1);
                background-color: var(--accent-highlight);
            }
            
            @media (max-width: 480px) {
                .ai-chat-window {
                    width: 100%; height: 100%;
                    bottom: 0; right: 0;
                    border-radius: 0; border: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectHTML() {
        // Chat Button
        this.btn = document.createElement('button');
        this.btn.className = 'ai-chat-btn';
        this.btn.setAttribute('aria-label', 'Open AI Chat');
        this.btn.innerHTML = '<i class="fas fa-comment-dots" role="img" aria-hidden="true"></i>';
        document.body.appendChild(this.btn);

        // Chat Window
        this.window = document.createElement('div');
        this.window.className = 'ai-chat-window';
        this.window.innerHTML = `
            <div class="ai-header">
                <div class="ai-info">
                    <h4>Riyad AI Assistant</h4>
                    <div class="ai-status"><span class="status-dot"></span> Online</div>
                </div>
            </div>
            <div class="ai-body" id="ai-messages">
                <div class="ai-msg bot">Hello! I am Riyad's portfolio assistant. How can I help you today?</div>
                <div class="typing-indicator" id="ai-typing">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
            <div class="ai-footer">
                <input type="text" class="ai-input" placeholder="Type a message..." maxlength="100" aria-label="Chat input">
                <button class="ai-send-btn" aria-label="Send message"><i class="fas fa-paper-plane" role="img" aria-hidden="true"></i></button>
            </div>
        `;
        document.body.appendChild(this.window);

        this.input = this.window.querySelector('.ai-input');
        this.msgContainer = this.window.querySelector('#ai-messages');
        this.typingIndicator = this.window.querySelector('#ai-typing');
        this.sendBtn = this.window.querySelector('.ai-send-btn');
    }

    bindEvents() {
        this.btn.addEventListener('click', () => this.toggleChat());

        const send = () => {
            const txt = this.input.value.trim();
            if (txt) this.handleUserMessage(txt);
        };

        this.sendBtn.addEventListener('click', send);
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') send();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.toggleChat();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.btn.classList.toggle('open', this.isOpen);

        if (this.isOpen) {
            this.btn.innerHTML = '<i class="fas fa-times" role="img" aria-hidden="true"></i>';
            setTimeout(() => this.input.focus(), 300);
        } else {
            this.btn.innerHTML = '<i class="fas fa-comment-dots" role="img" aria-hidden="true"></i>';
        }
    }

    renderMessages() {
        this.messages.forEach(msg => this.appendMessage(msg.text, msg.sender, false));
        this.scrollToBottom();
    }

    appendMessage(text, sender, save = true) {
        const div = document.createElement('div');
        div.className = `ai-msg ${sender}`;

        // Handle icons in text if needed, but for now just text
        div.textContent = text;

        // Insert before typing indicator
        this.msgContainer.insertBefore(div, this.typingIndicator);
        this.scrollToBottom();

        if (save) {
            this.messages.push({ text, sender, timestamp: Date.now() });
            localStorage.setItem('chat_history', JSON.stringify(this.messages));
        }
    }

    handleUserMessage(text) {
        this.input.value = '';
        this.appendMessage(text, 'user');

        // Check Limit
        if (this.dailyCount >= 10) {
            setTimeout(() => {
                this.appendMessage("Daily message limit reached. Please try again tomorrow!", 'bot');
                // Could prepend an icon here if desired, but request says replace emojis
            }, 500);
            return;
        }

        this.dailyCount++;
        localStorage.setItem('chat_daily_count', this.dailyCount.toString());

        // Show typing
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();

        // Simulate reply time
        setTimeout(() => {
            this.typingIndicator.style.display = 'none';
            this.appendMessage("The bot is currently in development. Please check back soon!", 'bot');
        }, 1500);
    }

    scrollToBottom() {
        this.msgContainer.scrollTop = this.msgContainer.scrollHeight;
    }
}
