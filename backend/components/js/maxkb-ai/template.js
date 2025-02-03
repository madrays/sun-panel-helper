(function() {
    const config = {
        chatUrl: {CHAT_URL},
        logoPath: {LOGO_PATH},
        pc: {PC_CONFIG},
        mobile: {MOBILE_CONFIG}
    };

    class AIAssistant {
        constructor() {
            this.isMobile = this.checkMobile();
            this.config = config;  // 使用外部配置
            this.createStyles();
            this.createButton();
            this.createChatWindow();
            this.isOpen = false;
            this.currentSize = 'normal'; // normal, half, full
        }

        checkMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;
        }

        createStyles() {
            const deviceConfig = this.isMobile ? this.config.mobile : this.config.pc;
            const style = document.createElement('style');
            style.textContent = `
                .ai-float-button {
                    position: fixed;
                    ${deviceConfig.position.includes('right') ? 'right' : 'left'}: ${deviceConfig.offset.x}px;
                    ${deviceConfig.position.includes('bottom') ? 'bottom' : 'top'}: ${deviceConfig.offset.y}px;
                    width: ${deviceConfig.size.width}px;
                    height: ${deviceConfig.size.height}px;
                    cursor: pointer;
                    z-index: 9998;
                    transition: transform 0.3s;
                }
                .ai-float-button:hover {
                    transform: scale(1.1);
                }
                .ai-chat-window {
                    position: fixed;
                    right: 20px;
                    bottom: 0;
                    width: 480px;
                    height: 720px;
                    background: white;
                    border-radius: 12px 12px 0 0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    display: none;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .ai-chat-window.half-screen {
                    width: 50vw;
                    height: 100vh;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
                .ai-chat-window.full-screen {
                    width: 100vw;
                    height: 100vh;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
                .ai-chat-header {
                    height: 40px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 10px;
                    gap: 10px;
                }
                .ai-chat-content {
                    height: calc(100% - 40px);
                    width: 100%;
                }
                .ai-chat-content iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .ai-button {
                    padding: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }
                .ai-button:hover {
                    background: #eee;
                }
                .ai-button svg {
                    width: 20px;
                    height: 20px;
                }

                /* 移动端样式 */
                @media (max-width: 768px) {
                    .ai-float-button {
                        width: 60px;
                        height: 60px;
                        right: 15px;
                        bottom: 90px;
                    }
                    .ai-chat-window {
                        width: 100vw;
                        height: 100vh;
                        right: 0;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        border-radius: 0;
                    }
                    .ai-chat-header {
                        height: 50px;
                        padding: 0 15px;
                    }
                    .ai-chat-content {
                        height: calc(100% - 50px);
                    }
                    .ai-button {
                        padding: 8px;
                    }
                    .ai-button svg {
                        width: 24px;
                        height: 24px;
                    }
                    .resize-btn {
                        display: none !important;
                    }
                }

                /* 针对超小屏幕的额外调整 */
                @media (max-width: 320px) {
                    .ai-float-button {
                        width: 50px;
                        height: 50px;
                        right: 10px;
                        bottom: 85px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        createButton() {
            const button = document.createElement('img');
            button.className = 'ai-float-button';
            button.src = this.config.logoPath;
            button.onclick = () => this.toggleChat();
            document.body.appendChild(button);
        }

        createChatWindow() {
            const chatWindow = document.createElement('div');
            chatWindow.className = 'ai-chat-window';
            
            const header = document.createElement('div');
            header.className = 'ai-chat-header';
            
            if (!this.isMobile) {
                // Restore button
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'ai-button resize-btn';
                restoreBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
                restoreBtn.onclick = () => this.resize('normal');
                
                // Half screen button
                const halfScreenBtn = document.createElement('button');
                halfScreenBtn.className = 'ai-button resize-btn';
                halfScreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/></svg>`;
                halfScreenBtn.onclick = () => this.resize('half');
                
                // Full screen button
                const fullScreenBtn = document.createElement('button');
                fullScreenBtn.className = 'ai-button resize-btn';
                fullScreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
                fullScreenBtn.onclick = () => this.resize('full');

                header.appendChild(restoreBtn);
                header.appendChild(halfScreenBtn);
                header.appendChild(fullScreenBtn);
            }
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'ai-button';
            closeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
            closeBtn.onclick = () => this.toggleChat();
            
            header.appendChild(closeBtn);
            
            const content = document.createElement('div');
            content.className = 'ai-chat-content';
            const iframe = document.createElement('iframe');
            iframe.src = this.config.chatUrl;
            content.appendChild(iframe);
            
            chatWindow.appendChild(header);
            chatWindow.appendChild(content);
            document.body.appendChild(chatWindow);
            
            this.chatWindow = chatWindow;
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                if (this.isMobile) {
                    this.resize('full');  // 移动端始终全屏
                } else {
                    this.resize('normal');  // PC端恢复正常大小
                }
                this.chatWindow.style.display = 'block';
            } else {
                this.chatWindow.style.display = 'none';
            }
        }

        resize(size) {
            if (this.isMobile) {
                size = 'full'; // 移动端强制全屏
            }
            this.currentSize = size;
            this.chatWindow.className = 'ai-chat-window ' + 
                (size === 'half' ? 'half-screen' : size === 'full' ? 'full-screen' : '');
        }
    }

    // Initialize the assistant
    window.addEventListener('load', () => {
        new AIAssistant();
    });
})(); 