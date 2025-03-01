// Sun-Panel-Helper Markdown Editor
// Author: Madrays
// Website: https://cocohe.cn
// GitHub: https://github.com/madrays

// 在文件顶部声明全局变量
let md;

(function() {
    // 检测是否为移动设备
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    // 如果是移动设备,直接返回不加载
    if (isMobileDevice()) {
        console.log('移动设备不支持此功能');
        return;
    }

    // 检查依赖
    function loadDependencies() {
        return new Promise((resolve, reject) => {
            // 按顺序加载依赖
            const dependencies = [
                {
                    type: 'style',
                    url: 'https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css'
                },
                {
                    type: 'style',
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'
                },
                {
                    type: 'script',
                    url: 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js'
                },
                {
                    type: 'script',
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
                }
            ];

            function loadScript(url) {
                return new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = res;
                    script.onerror = rej;
                    document.head.appendChild(script);
                });
            }

            function loadStyle(url) {
                return new Promise((res, rej) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    link.onload = res;
                    link.onerror = rej;
                    document.head.appendChild(link);
                });
            }

            // 按顺序加载主要依赖
            Promise.all(dependencies.map(dep => {
                if (dep.type === 'script') {
                    return loadScript(dep.url);
                } else {
                    return loadStyle(dep.url);
                }
            }))
            .then(resolve)
            .catch(reject);
        });
    }

    // 用户配置
    const users = {USERS_CONFIG};
    const API_PREFIX = '{API_PREFIX}';  // 从配置中读取
    
    // 本地存储键名
    const STORAGE_KEYS = {
        NOTES: 'sun-panel-markdown-notes',
        USER: 'sun-panel-markdown-user'
    };

    // 切换编辑模式
    function toggleEditMode(enable) {
        isEditMode = enable;
        const editorContainer = document.querySelector('.editor-container');
        editorContainer.classList.toggle('edit-mode', enable);
        titleInput.readOnly = !enable;
        markdownInput.readOnly = !enable;
        saveButton.style.display = enable ? 'flex' : 'none';
        editButton.innerHTML = enable ? 
            '<span class="mdi mdi-eye"></span>预览' : 
            '<span class="mdi mdi-pencil"></span>编辑';
    }

    // 初始化 markdown-it
    function initializeMarkdownIt() {
        md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
            highlight: function (str, lang) {
                // 如果指定了语言且该语言存在
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, { language: lang }).value;
                    } catch (__) {}
                }
                
                // 自动检测语言
                try {
                    const detectedLang = detectLanguage(str);
                    return hljs.highlight(str, { language: detectedLang }).value;
                } catch (__) {}
                
                // 如果都失败了，使用普通转义
                return md.utils.escapeHtml(str);
            }
        });

        // 修改渲染规则
        md.renderer.rules.heading_open = function(tokens, idx) {
            const tag = tokens[idx].tag;
            const styles = {
                h1: 'font-size: 2.5em; margin: 1em 0; font-weight: bold; color: #2c3e50;',
                h2: 'font-size: 2em; margin: 0.8em 0; font-weight: bold; color: #2c3e50;',
                h3: 'font-size: 1.5em; margin: 0.6em 0; font-weight: bold; color: #2c3e50;'
            };
            return `<${tag} style="${styles[tag] || ''}">`;
        };

        // 修改列表渲染规则
        md.renderer.rules.bullet_list_open = function() {
            return '<ul style="margin: 1em 0; padding-left: 2em; list-style-type: disc;">';
        };

        md.renderer.rules.ordered_list_open = function(tokens, idx) {
            let start = tokens[idx].attrGet('start');
            start = start ? ` start="${start}"` : '';
            return `<ol style="margin: 1em 0; padding-left: 2em; list-style-type: decimal;"${start}>`;
        };

        md.renderer.rules.list_item_open = function() {
            return '<li style="margin: 0.5em 0;">';
        };

        // 修改行内代码渲染规则
        md.renderer.rules.code_inline = function(tokens, idx) {
            const code = tokens[idx].content;
            return `<code class="inline-code">${md.utils.escapeHtml(code)}</code>`;
        };
    }

    // 更新预览函数
    function updatePreview() {
        try {
            const text = markdownInput.value.trim();
            if (!text) {
                preview.innerHTML = '';
                return;
            }

            preview.innerHTML = md.render(text);

            requestAnimationFrame(() => {
                handleCodeBlocks();
                handleInlineCode();
            });
        } catch (error) {
            preview.innerHTML = '<div class="error">预览更新失败</div>';
        }
    }

    // API 请求封装
    async function fetchApi(url, options = {}) {
        try {
            let apiUrl;
            if (url.startsWith('http')) {
                apiUrl = url;
            } else {
                // 移除 API_PREFIX 末尾的斜杠
                const baseUrl = API_PREFIX.replace(/\/+$/, '');
                // 移除 url 开头的斜杠
                const cleanUrl = url.replace(/^\/+/, '');
                // 拼接完整 URL
                apiUrl = `${baseUrl}/${cleanUrl}`;
            }

            const response = await fetch(apiUrl, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // 仅在首次切换到本地存储时提示
            if (!window.localStorageMode) {
                console.warn('已切换到本地存储模式');
                window.localStorageMode = true;
            }
            
            if (url.includes('/notes/')) {
                const username = url.split('/').pop();
                const localNotes = localStorage.getItem(`notes-${username}`);
                return localNotes ? JSON.parse(localNotes) : [];
            }
            if (options.method === 'POST' && url.includes('/notes/')) {
                const username = url.split('/').pop();
                localStorage.setItem(`notes-${username}`, JSON.stringify(options.body));
                return { success: true };
            }
            return null;
        }
    }

    // 笔记存储类
    class NoteStorage {
        constructor(username, anonymous = false) {
            this.username = username;
            this.anonymous = anonymous;
            this.notes = [];
        }

        async initUser() {
            try {
                await fetchApi(`/custom/helper/md/init/${this.username}`, {
                    method: 'POST'
                });
            } catch (error) {
                throw error;
            }
        }

        async loadNotes() {
            try {
                const notes = await fetchApi(`/custom/helper/md/notes/${this.username}`);
                this.notes = notes;
                return notes;
            } catch (error) {
                const savedNotes = localStorage.getItem(`notes-${this.username}`);
                this.notes = savedNotes ? JSON.parse(savedNotes) : [];
                return this.notes;
            }
        }

        async saveNotes(notes) {
            try {
                await fetchApi(`/custom/helper/md/notes/${this.username}`, {
                    method: 'POST',
                    body: JSON.stringify(notes)
                });
                localStorage.setItem(`notes-${this.username}`, JSON.stringify(notes));
            } catch (error) {
                localStorage.setItem(`notes-${this.username}`, JSON.stringify(notes));
                throw error;
            }
        }
    }

    // 全局变量
    let noteStorage;
    let currentNoteId = null;
    let isEditMode = false;
    let notepad, openButton, closeButton, markdownInput, preview,
        saveButton, titleInput, editButton, deleteButton,
        importButton, exportButton, newNoteButton, fileList;

    // 初始化 DOM 元素引用
    function initializeDOMElements() {
        notepad = document.getElementById('notepad');
        openButton = document.getElementById('openNotepad');
        closeButton = document.getElementById('closeNotepad');
        markdownInput = document.getElementById('markdown-input');
        preview = document.getElementById('preview');
        saveButton = document.getElementById('saveNote');
        titleInput = document.getElementById('noteTitle');
        editButton = document.getElementById('editNote');
        deleteButton = document.getElementById('deleteNote');
        importButton = document.getElementById('importNote');
        exportButton = document.getElementById('exportNote');
        newNoteButton = document.getElementById('newNote');
        fileList = document.getElementById('fileList');

        // 检查必要的 DOM 元素
        const requiredElements = {
            notepad, openButton, closeButton, markdownInput, preview,
            saveButton, titleInput, editButton, deleteButton,
            importButton, exportButton, newNoteButton, fileList
        };

        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                throw new Error(`必要的 DOM 元素未找到: ${name}`);
            }
        }
    }

    // 用户状态管理
    const userState = {
        currentUser: null,
        
        getCurrentUser() {
            if (!this.currentUser) {
                const stored = localStorage.getItem(STORAGE_KEYS.USER);
                if (stored) {
                    try {
                        this.currentUser = JSON.parse(stored);
                        const isValid = users.some(u => u.username === this.currentUser.username);
                        if (!isValid) {
                            this.currentUser = null;
                            localStorage.removeItem(STORAGE_KEYS.USER);
                        }
                    } catch (error) {
                        console.error('解析用户数据失败:', error);
                        this.currentUser = null;
                        localStorage.removeItem(STORAGE_KEYS.USER);
                    }
                }
            }
            return this.currentUser;
        },

        async login(username, password) {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                this.currentUser = { username };
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                this.updateLoginButton();
                return true;
            }
            return false;
        },

        logout() {
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEYS.USER);
            this.updateLoginButton();
            
            // 修改登出逻辑，不再重新初始化编辑器
            if (notepad) {
                // 清空当前笔记
                currentNoteId = null;
                titleInput.value = '';
                markdownInput.value = '';
                preview.innerHTML = '';
                
                // 加载匿名模式的笔记
                noteStorage = new NoteStorage('anonymous');
                noteStorage.loadNotes().then(notes => {
                    renderNoteList(notes);
                    if (notes.length > 0) {
                        loadNote(notes[0].id);
                    }
                });
            }
        },

        // 新增：更新登录按钮状态
        updateLoginButton() {
            const loginBtn = document.getElementById('loginBtn');
            if (!loginBtn) return;

            if (this.currentUser) {
                loginBtn.innerHTML = `
                    <span class="mdi mdi-account-check"></span>${this.currentUser.username}
                    <span class="mdi mdi-chevron-down"></span>
                `;
                loginBtn.onclick = (e) => {
                    e.stopPropagation();
                    // 移除可能存在的旧菜单
                    const oldMenu = document.querySelector('.login-menu');
                    if (oldMenu) oldMenu.remove();

                    const menu = document.createElement('div');
                    menu.className = 'login-menu';
                    menu.innerHTML = '<div class="login-menu-item logout"><span class="mdi mdi-logout"></span>登出</div>';
                    
                    // 修改菜单定位和样式
                    Object.assign(menu.style, {
                        position: 'fixed', // 改为 fixed 定位
                        backgroundColor: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        zIndex: '10000',
                        padding: '4px 0',
                        minWidth: '100px', // 减小最小宽度
                        width: 'auto' // 自适应宽度
                    });

                    menu.querySelector('.logout').onclick = (e) => {
                        e.stopPropagation();
                        this.logout();
                        menu.remove();
                    };

                    // 点击其他地方关闭菜单
                    const closeMenu = (e) => {
                        if (!menu.contains(e.target) && !loginBtn.contains(e.target)) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    };
                    document.addEventListener('click', closeMenu);

                    // 将菜单添加到 body
                    document.body.appendChild(menu);
                    
                    // 调整菜单位置
                    const btnRect = loginBtn.getBoundingClientRect();
                    menu.style.top = `${btnRect.bottom + 5}px`;
                    menu.style.left = `${btnRect.right - menu.offsetWidth}px`;
                };
            } else {
                loginBtn.innerHTML = '<span class="mdi mdi-account"></span>登录';
                loginBtn.onclick = () => {
                    const loginDialog = document.getElementById('loginDialog');
                    if (loginDialog) loginDialog.classList.add('show');
                };
            }
        }
    };

    // 修改悬浮按钮样式
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: var(--bg-color);
            }

            :root {
                --primary-color: #2563eb;
                --primary-hover: #1d4ed8;
                --bg-color: #f8fafc;
                --surface-color: #ffffff;
                --text-primary: #1e293b;
                --text-secondary: #64748b;
                --border-color: #e2e8f0;
                --hover-bg: #f1f5f9;
            }

            .floating-button {
                position: fixed;
                bottom: 150px;  /* 改为距底部150px */
                right: 0px;   
                transform: none;
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                background: none;
                border: none;
                outline: none;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
            }

            .floating-button span {
                font-size: 48px;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                animation: noteAnimation 3s ease-in-out infinite;
                transform-origin: center;
            }

            @keyframes noteAnimation {
                0% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
                }
                25% {
                    transform: translateY(-5px) rotate(-5deg);
                    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
                }
                50% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
                }
                75% {
                    transform: translateY(-3px) rotate(3deg);
                    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
                }
                100% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
                }
            }

            .notepad {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 95%;
                max-width: 1400px;
                height: 90vh;
                background: var(--surface-color);
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .notepad.show {
                opacity: 1;
            }

            .notepad-header {
                padding: 16px;
                background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-title {
                display: flex;
                align-items: center;
            }

            .header-title h2 {
                color: white;
                font-weight: 600;
                font-size: 1.5rem;
            }

            .author-links {
                display: inline-flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                margin-left: 16px;
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                white-space: nowrap;
            }

            .author {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                font-style: italic;
            }

            .author-links a {
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 4px;
            }

            .author-links .divider {
                color: rgba(255, 255, 255, 0.3);
                margin: 0 4px;
            }

            .header-buttons {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .action-button {
                background: rgba(255, 255, 255, 0.1);
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                border-radius: 8px;
                border: none;
                padding: 8px 16px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }

            .action-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: white;
                padding: 4px 8px;
            }

            .notepad-container {
                display: flex;
                height: calc(100% - 64px);
                overflow: hidden;
            }

            .file-list {
                width: 250px;
                min-width: 250px;
                flex-shrink: 0;
                border-right: 1px solid var(--border-color);
                background: var(--bg-color);
                display: flex;
                flex-direction: column;
                max-height: 100%;
                overflow: hidden;
                z-index: 2;
                transform: translate3d(0, 0, 0);
            }

            .file-list-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
                background: var(--surface-color);
                flex-shrink: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 1;
            }

            .new-note-btn {
                background: var(--primary-color);
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
            }

            .new-note-btn:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
            }

            .file-list-content {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 8px;
                background: var(--bg-color);
                max-height: calc(100% - 60px);
                transform: translate3d(0, 0, 0);
            }

            .file-item {
                margin: 4px 0;
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--surface-color);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                transform: translate3d(0, 0, 0);
                transition: transform 0.2s ease, background-color 0.2s ease;
            }

            .file-info {
                flex: 1;
                min-width: 0;
            }

            .file-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: var(--text-primary);
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            .file-date {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 2px;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            .file-item:hover {
                background: var(--hover-bg);
                transform: translate3d(2px, 0, 0);
            }

            .file-item.active {
                background: var(--primary-color);
                transform: translate3d(0, 0, 0);
            }

            .file-item span.mdi {
                font-size: 18px;
                color: #666;
            }

            .file-item.active span.mdi {
                color: white;
            }

            .editor-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
                overflow: hidden;
                background: var(--surface-color);
                transform: translate3d(0, 0, 0);
            }

            .editor-header {
                padding: 16px;
                border-bottom: 1px solid #eee;
            }

            .title-input {
                width: 100%;
                padding: 8px;
                font-size: 1.25rem;
                border: none;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
                color: var(--text-primary);
            }

            .title-input:focus {
                border-bottom-color: var(--primary-color);
            }

            .editor-toolbar {
                display: flex;
                gap: 8px;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            .toolbar-btn {
                background: none;
                border: none;
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #666;
                transition: all 0.2s ease;
            }

            .toolbar-btn:hover {
                background: var(--hover-bg);
                transform: translateY(-1px);
            }

            .toolbar-btn span {
                font-size: 18px;
            }

            .editor-section {
                flex: 1;
                overflow-y: auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }

            #markdown-input {
                width: 100%;
                height: 100%;
                border: none;
                resize: none;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.6;
                padding: 20px;
            }

            #markdown-input:focus {
                outline: none;
            }

            .preview-section {
                flex: 1;
                overflow-y: auto;
                min-height: 0;
                padding: 20px;
                background: var(--bg-color);
                border-radius: 8px;
                margin: 16px;
                box-shadow: none;
                transform: translate3d(0, 0, 0);
            }

            #preview {
                padding: 10px;
                max-width: 100%;
                overflow-wrap: break-word;
                transform: translate3d(0, 0, 0);
            }

            /* 代码块样式 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            /* 滚动条样式 */
            .code-block pre::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .code-block pre::-webkit-scrollbar-corner {
                background: transparent;
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                text-rendering: optimizeLegibility !important;
                letter-spacing: 0 !important;
                transform: none !important;
                z-index: 6;
            }

            /* 展开/折叠按钮 */
            .code-block .expand-button {
                position: absolute;
                top: 8px;
                right: 88px;  /* 移到复制按钮左边 */
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #abb2bf;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                opacity: 0;
                transition: all 0.2s ease;
                z-index: 2;
            }

            .code-block:hover .expand-button {
                opacity: 1;
            }

            .code-block .expand-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 复制按钮 */
            .code-block .copy-button {
                position: absolute;
                top: 8px;
                right: 8px;
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #abb2bf;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                opacity: 0;
                transition: all 0.2s ease;
                z-index: 2;
            }

            .code-block:hover .copy-button {
                opacity: 1;
            }

            .copy-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 滚动条样式 */
            .code-block pre::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .code-block pre::-webkit-scrollbar-corner {
                background: transparent;
            }

            .code-language {
                position: absolute;
                top: 8px;
                left: 8px;
                padding: 4px 8px;
                font-size: 12px;
                color: #abb2bf;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 2;
                user-select: none;
            }

            .code-language:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            /* 语言选择下拉菜单 */
            .language-dropdown {
                position: fixed;
                background: #282c34;
                border: 1px solid #4b5263;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                min-width: 120px;
                max-height: 300px;
                overflow-y: auto;
                z-index: 10000;
            }

            .language-item {
                padding: 8px 12px;
                color: #abb2bf;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                user-select: none;
            }

            .language-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .language-item.active {
                background: rgba(97, 175, 239, 0.2);
                color: #61afef;
            }

            /* 确保下拉菜单在滚动时保持可见 */
            .code-block {
                position: relative;
            }

            .code-language {
                position: absolute;
                top: 8px;
                left: 8px;
                z-index: 2;
            }

            /* 代码对话框 */
            .code-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .code-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .code-dialog h3 {
                margin: 0 0 16px 0;
                color: #2c3e50;
            }

            .code-dialog select {
                width: 100%;
                padding: 8px;
                margin-bottom: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }

            .code-dialog textarea {
                width: 100%;
                height: 200px;
                padding: 12px;
                margin-bottom: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                resize: vertical;
            }

            .dialog-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .dialog-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .dialog-buttons .cancel-btn {
                background: #f8f9fa;
                border: 1px solid #ddd;
            }

            .dialog-buttons .confirm-btn {
                background: #1a73e8;
                color: white;
            }

            /* 删除对话框 */
            .delete-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .delete-dialog.show {
                display: flex;
            }

            .delete-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
            }

            .delete-dialog-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                justify-content: flex-end;
            }

            .delete-dialog-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .delete-dialog-buttons .confirm-delete {
                background-color: #dc3545;
                color: white;
            }

            .delete-dialog-buttons .cancel-delete {
                background-color: #f8f9fa;
                border: 1px solid #ddd;
            }

            /* 通知提示 */
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                background: #10b981;
                color: white;
                font-size: 14px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                z-index: 10000;
            }

            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            .notification.error {
                background: #ef4444;
            }

            /* 编辑模式样式 */
            .editor-container.edit-mode .editor-toolbar {
                display: flex;
            }

            .editor-container:not(.edit-mode) .editor-toolbar {
                display: none;
            }

            .editor-container:not(.edit-mode) #saveNote {
                display: none;
            }

            .editor-container:not(.edit-mode) .editor-section {
                display: none;
            }

            .editor-container:not(.edit-mode) .preview-section {
                height: calc(100% - 60px);
                border-top: none;
            }

            .title-input[readonly],
            #markdown-input[readonly] {
                background-color: transparent;
                cursor: default;
            }

            .title-input[readonly] {
                border-color: transparent;
            }

            #deleteNote {
                background: rgba(250, 60, 60, 0.9) !important;
                color: white !important;
            }

            #deleteNote:hover {
                background: rgba(240, 80, 80, 0.95) !important;
            }

            #deleteNote span {
                color: white !important;
            }

            /* 美化滚动条 */
            .file-list-content::-webkit-scrollbar {
                width: 6px;
            }

            .file-list-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .file-list-content::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .file-list-content::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            /* 优化文件列表布局 */
            .file-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }

            .file-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .file-date {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 2px;
            }

            .file-item.active .file-date {
                color: rgba(255, 255, 255, 0.8);
            }

            /* 美化代码块滚动条 */
            .code-block pre::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: transparent;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            /* 文件列表滚动条 */
            .file-list-content::-webkit-scrollbar {
                width: 6px;
            }

            .file-list-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .file-list-content::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .file-list-content::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            /* 修复字体渲染 */
            .notepad * {
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                text-rendering: optimizeLegibility !important;
            }

            /* 修复列表标题样式 */
            .file-list-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* 代码块样式优化 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                text-rendering: optimizeLegibility !important;
                letter-spacing: 0 !important;
            }

            /* 代码块按钮样式 */
            .code-block .expand-button,
            .code-block .copy-button,
            .code-block .code-language {
                position: absolute;
                top: 8px;
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #ffffff !important;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .code-block .code-language {
                left: 8px;
                z-index: 2;
            }

            .code-block .expand-button {
                right: 88px;
                opacity: 0;
            }

            .code-block .copy-button {
                right: 8px;
                opacity: 0;
            }

            .code-block:hover .expand-button,
            .code-block:hover .copy-button {
                opacity: 1;
            }

            .code-block .expand-button:hover,
            .code-block .copy-button:hover,
            .code-block .code-language:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 文件列表样式优化 */
            .file-list-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .file-item {
                margin: 4px 0;
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--surface-color);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                transform: translate3d(0, 0, 0);
                transition: transform 0.2s ease, background-color 0.2s ease;
                will-change: transform, background-color;
            }

            .file-item.active {
                background: var(--primary-color);
                transform: translate3d(0, 0, 0);
            }

            .file-item.active .file-title,
            .file-item.active .file-date,
            .file-item.active .mdi {
                color: white !important;
            }

            /* 代码块样式优化 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            /* 删除按钮样式 */
            #deleteNote {
                background: rgba(250, 60, 60, 0.9) !important;
                color: white !important;
            }

            #deleteNote:hover {
                background: rgba(240, 80, 80, 0.95) !important;
            }

            #deleteNote span {
                color: white !important;
            }

            /* 确保所有文本渲染清晰 */
            * {
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* 移除所有可能导致模糊的属性 */
            .preview-section,
            #preview,
            .file-list,
            .file-list-content,
            .editor-container,
            .code-block,
            .code-block pre,
            .code-block code {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                filter: none !important;
            }

            /* 修复单行代码样式 */
            .inline-code {
                background-color: #282c34 !important;
                color: #e06c75 !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 0.9em !important;
                white-space: pre-wrap !important;
                display: inline !important;
            }

            .inline-code-wrapper {
                position: relative !important;
                display: inline-flex !important;  /* 改为inline-flex */
                align-items: center !important;
                margin: 0 2px !important;
                padding-right: 24px !important;
            }

            .inline-copy-button {
                position: absolute !important;
                right: 2px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;  /* 添加最小宽度 */
                padding: 2px !important;
                border: none !important;
                background: rgba(255, 255, 255, 0.9) !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                opacity: 0;
                transition: opacity 0.2s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                color: #666 !important;
                z-index: 2 !important;
                pointer-events: auto !important;  /* 确保按钮可点击 */
            }

            .inline-code-wrapper:hover .inline-copy-button {
                opacity: 1 !important;
            }

            .inline-copy-button:hover {
                background: rgba(255, 255, 255, 1) !important;
            }

            /* 重新设计行内代码样式 */
            .inline-code-container {
                position: relative;
                display: inline-block;
                margin: 0 2px;
            }

            .inline-code {
                background-color: #282c34;
                color: #e06c75;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 0.9em;
                white-space: pre-wrap;
            }

            .inline-copy-btn {
                position: absolute;
                right: -22px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 3px;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
                z-index: 100;
                padding: 0;
            }

            .inline-code-container:hover .inline-copy-btn {
                display: flex;
            }

            .inline-copy-btn:hover {
                background: #f5f5f5;
            }

            .inline-copy-btn.success {
                color: #10b981;
            }

            .inline-copy-btn.error {
                color: #ef4444;
            }

            /* 登录对话框样式 */
            .login-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .login-dialog.show {
                display: flex;
            }

            .login-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                width: 300px;
            }

            .login-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .login-form input {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .login-buttons {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .login-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .login-buttons button:first-child {
                background: var(--primary-color);
                color: white;
            }

            .login-buttons button:last-child {
                background: #f8f9fa;
                border: 1px solid #ddd;
            }

            /* 登录菜单样式 */
            .login-menu {
                padding: 8px 0;
                min-width: 120px;
            }

            .login-menu-item {
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .login-menu-item:hover {
                background-color: #f5f5f5;
            }

            .login-menu-item.logout {
                color: #dc2626;
            }

            #loginBtn {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // 注入HTML结构
    function injectHTML() {
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="floating-button" id="openNotepad">
                <span class="mdi mdi-notebook-edit"></span>
            </div>

            <div class="notepad" id="notepad">
                <div class="notepad-header">
                    <div class="header-title">
                        <h2>Sun-Panel-Helper随手记</h2>
                        <div class="author-links">
                            <span class="author">by 
                                <a href="https://github.com/madrays" target="_blank">Madrays</a>
                            </span>
                            <span class="divider">|</span>
                            <a href="https://cocohe.cn" target="_blank" class="blog-link">
                                <span class="mdi mdi-web"></span>Blog
                            </a>
                        </div>
                    </div>
                    <div class="header-buttons">
                        <button class="action-button" id="loginBtn">
                            <span class="mdi mdi-account"></span>登录
                        </button>
                        <button class="action-button" id="editNote">
                            <span class="mdi mdi-pencil"></span>编辑
                        </button>
                        <button class="action-button" id="deleteNote">
                            <span class="mdi mdi-delete"></span>删除
                        </button>
                        <button class="action-button" id="importNote">
                            <span class="mdi mdi-file-import"></span>导入
                        </button>
                        <button class="action-button" id="exportNote">
                            <span class="mdi mdi-file-export"></span>导出
                        </button>
                        <button class="action-button" id="saveNote">
                            <span class="mdi mdi-content-save"></span>保存
                        </button>
                        <button class="close-button" id="closeNotepad">×</button>
                    </div>
                </div>
                <div class="notepad-container">
                    <div class="file-list">
                        <div class="file-list-header">
                            <h3>随手记列表</h3>
                            <button class="new-note-btn" id="newNote">
                                <span class="mdi mdi-plus"></span>新建
                            </button>
                        </div>
                        <div class="file-list-content" id="fileList">
                            <!-- 文件列表将通过 JavaScript 动态添加 -->
                        </div>
                    </div>
                    <div class="editor-container">
                        <div class="editor-header">
                            <input type="text" id="noteTitle" placeholder="输入标题..." class="title-input" readonly>
                            <div class="editor-toolbar">
                                <button class="toolbar-btn" data-format="**" title="粗体">
                                    <span class="mdi mdi-format-bold"></span>
                                </button>
                                <button class="toolbar-btn" data-format="*" title="斜体">
                                    <span class="mdi mdi-format-italic"></span>
                                </button>
                                <button class="toolbar-btn" id="inlineCodeBtn" title="行内代码">
                                    <span class="mdi mdi-code-tags"></span>
                                </button>
                                <button class="toolbar-btn" id="codeBlockBtn" title="代码块">
                                    <span class="mdi mdi-code-braces"></span>
                                </button>
                                <button class="toolbar-btn" data-format="# " title="标题">
                                    <span class="mdi mdi-format-header-1"></span>
                                </button>
                                <button class="toolbar-btn" data-format="- " title="列表">
                                    <span class="mdi mdi-format-list-bulleted"></span>
                                </button>
                                <button class="toolbar-btn" data-format="1. " title="数字列表">
                                    <span class="mdi mdi-format-list-numbered"></span>
                                </button>
                            </div>
                        </div>
                        <div class="editor-section">
                            <textarea id="markdown-input" placeholder="在这里输入 Markdown 文本..." readonly></textarea>
                        </div>
                        <div class="preview-section">
                            <div id="preview"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="code-dialog" id="codeDialog" style="display: none;">
                <div class="code-dialog-content">
                    <h3>插入代码</h3>
                    <label for="languageSelect">选择代码语言：</label>
                    <select id="languageSelect">
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="bash">Bash</option>
                        <option value="yaml">YAML</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="sql">SQL</option>
                    </select>
                    <textarea id="codeInput" placeholder="在这里输入代码..."></textarea>
                    <div class="dialog-buttons">
                        <button class="cancel-btn">取消</button>
                        <button class="confirm-btn">插入</button>
                    </div>
                </div>
            </div>
            
            <!-- 登录对话框 -->
            <div class="login-dialog" id="loginDialog">
                <div class="login-dialog-content">
                    <h3>用户登录</h3>
                    <div class="login-form">
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="用户名" 
                            autocomplete="new-password" 
                            data-form-type="other"
                            name="sunpanel_username">
                        <input 
                            type="text" 
                            id="password" 
                            placeholder="密码" 
                            autocomplete="new-password" 
                            data-form-type="other"
                            name="sunpanel_password">
                        <div class="login-buttons">
                            <button id="loginButton">登录</button>
                            <button id="cancelLogin">取消</button>
                        </div>
                    </div>
                </div>
            </div>`;
            
        document.body.appendChild(container);
    }

    // 事件处理函数定义
    function handleOpenClick(e) {
        e.stopPropagation();
        notepad.style.display = 'block';
        setTimeout(() => notepad.classList.add('show'), 0);
        
        if (currentNoteId && noteStorage.notes.find(n => n.id === currentNoteId)) {
            loadNote(currentNoteId);
        } else if (noteStorage.notes.length > 0) {
            loadNote(noteStorage.notes[0].id);
        } else {
            createNewNote();
        }
    }

    function handleCloseClick() {
        notepad.classList.remove('show');
        setTimeout(() => {
            notepad.style.display = 'none';
        }, 300);
    }

    function handleMarkdownInput() {
        console.log('编辑器内容变化');
        if (markdownInputTimeout) {
            clearTimeout(markdownInputTimeout);
        }
        markdownInputTimeout = setTimeout(() => {
            console.log('触发保存...');
            updatePreview();
            saveNote();
        }, 1000);
    }

    function handleTitleInput() {
        console.log('标题变化');
        if (titleInputTimeout) {
            clearTimeout(titleInputTimeout);
        }
        titleInputTimeout = setTimeout(() => {
            console.log('触发保存...');
            saveNote();
        }, 1000);
    }

    function handleSaveClick() {
        saveNote();
        toggleEditMode(false);
    }

    function handleEditClick() {
        toggleEditMode(!isEditMode);
    }

    function handleDeleteClick() {
        showDeleteDialog();
    }

    function handleNewNoteClick() {
        createNewNote();
    }

    function handleImportClick() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const content = await file.text();
                    createNewNote();
                    markdownInput.value = content;
                    titleInput.value = file.name.replace('.md', '');
                    updatePreview();
                    saveNote();
                    showNotification('导入成功');
                } catch (err) {
                    console.error('导入失败:', err);
                    showNotification('导入失败', 'error');
                }
            }
        };
        input.click();
    }

    function handleExportClick() {
        if (!currentNoteId) {
            showNotification('没有可导出的笔记', 'error');
            return;
        }

        const title = titleInput.value || '未命名笔记';
        const content = markdownInput.value;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('导出成功');
    }

    // 防抖定时器
    let markdownInputTimeout = null;
    let titleInputTimeout = null;

    // 修改事件监听器绑定函数
    function bindEventListeners() {
        // 移除日志
        // console.log('绑定事件监听器...');
        
        // 确保所有元素都存在
        if (!notepad || !openButton || !closeButton || !markdownInput || !preview || 
            !saveButton || !titleInput || !editButton || !deleteButton || 
            !importButton || !exportButton || !newNoteButton || !fileList) {
            throw new Error('必要的 DOM 元素未找到，无法绑定事件');
        }
        
        // 移除旧的事件监听器
        const elements = [openButton, closeButton, markdownInput, titleInput, 
                        saveButton, editButton, deleteButton, newNoteButton,
                        importButton, exportButton];
        
        elements.forEach(element => {
            if (element && element.parentNode) {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            }
        });

        // 重新获取元素引用
        initializeDOMElements();

        // 绑定新的事件监听器
        openButton.addEventListener('click', handleOpenClick);
        closeButton.addEventListener('click', handleCloseClick);
        markdownInput.addEventListener('input', handleMarkdownInput);
        titleInput.addEventListener('input', handleTitleInput);
        saveButton.addEventListener('click', handleSaveClick);
        editButton.addEventListener('click', handleEditClick);
        deleteButton.addEventListener('click', handleDeleteClick);
        newNoteButton.addEventListener('click', handleNewNoteClick);
        importButton.addEventListener('click', handleImportClick);
        exportButton.addEventListener('click', handleExportClick);

        // 点击外部关闭记事本
        window.addEventListener('click', handleOutsideClick);

        // 阻止记事本内部点击事件冒泡
        notepad.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        console.log('事件监听器绑定完成');
    }

    // 修改初始化顺序
    async function initializeEditor() {
        try {
            // 检查必要的全局对象
            if (!window.markdownit || !window.hljs) {
                throw new Error('必要的依赖未加载');
            }

            // 初始化 markdown-it
            initializeMarkdownIt();
            
            // 注入 HTML
            injectHTML();

            // 等待一小段时间确保 DOM 完全加载
            await new Promise(resolve => setTimeout(resolve, 100));

            // 初始化 DOM 元素
            initializeDOMElements();

            // 获取当前用户
            const user = userState.getCurrentUser();
            const username = user ? user.username : 'anonymous';
            console.log('当前用户:', username);

            // 初始化笔记存储
            noteStorage = new NoteStorage(username);

            // 绑定事件监听器
            bindEventListeners();

            // 初始化用户和加载笔记
            await noteStorage.initUser();
            const notes = await noteStorage.loadNotes();

            renderNoteList(notes);

            if (notes.length > 0) {
                loadNote(notes[0].id);
            }

            // 初始化登录相关元素
            initializeLoginElements();

            // 初始化工具栏
            initializeToolbar();
            
            // 初始化代码对话框
            initializeCodeDialog();
        } catch (error) {
            throw error;
        }
    }

    // 初始化登录相关元素
    function initializeLoginElements() {
        const loginDialog = document.getElementById('loginDialog');
        const loginBtn = document.getElementById('loginBtn');
        const loginButton = document.getElementById('loginButton');
        const cancelLogin = document.getElementById('cancelLogin');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!loginDialog || !loginBtn || !loginButton || !cancelLogin || 
            !usernameInput || !passwordInput) {
            console.warn('登录相关元素未找到，跳过登录功能初始化');
            return;
        }

        // 初始化登录按钮状态
        userState.updateLoginButton();

        loginButton.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (await userState.login(username, password)) {
                loginDialog.classList.remove('show');
                // 清空输入框
                usernameInput.value = '';
                passwordInput.value = '';
                
                // 创建新的笔记存储实例
                noteStorage = new NoteStorage(username);
                await noteStorage.loadNotes();
                renderNoteList(noteStorage.notes);
                if (noteStorage.notes.length > 0) {
                    loadNote(noteStorage.notes[0].id);
                }
                
                showNotification('登录成功');
            } else {
                alert('用户名或密码错误');
            }
        });

        cancelLogin.addEventListener('click', () => {
            loginDialog.classList.remove('show');
            // 清空输入框
            usernameInput.value = '';
            passwordInput.value = '';
        });
    }

    // 启动编辑器
    console.log('开始加载编辑器...');
    loadDependencies()
        .then(() => {
            console.log('依赖加载完成，注入样式...');
            injectStyles();
            return new Promise(resolve => setTimeout(resolve, 100)); // 等待样式加载
        })
        .then(() => {
            console.log('初始化编辑器...');
            return initializeEditor().catch(err => {
                console.error('编辑器初始化失败:', err);
                // 尝试使用本地存储模式
                return initializeEditor('anonymous');
            });
        })
        .catch(err => {
            console.error('编辑器启动失败:', err);
        });

    // 渲染文件列表
    function renderNoteList(notes) {
        fileList.innerHTML = '';
        notes.forEach(note => {
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${note.id === currentNoteId ? 'active' : ''}`;
            
            const date = new Date(note.updated || note.created);
            const formattedDate = date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            fileItem.innerHTML = `
                <span class="mdi mdi-file-document-outline"></span>
                <div class="file-info">
                    <div class="file-title">${note.title || '未命名笔记'}</div>
                    <div class="file-date">${formattedDate}</div>
                </div>
            `;
            fileItem.addEventListener('click', () => loadNote(note.id));
            fileList.appendChild(fileItem);
        });
    }

    // 加载笔记
    function loadNote(id) {
        const notes = noteStorage.notes;
        const note = notes.find(n => n.id === id);
        if (note) {
            currentNoteId = id;
            titleInput.value = note.title || '';
            markdownInput.value = note.content || '';
            preview.innerHTML = '';
            
            requestAnimationFrame(() => {
                updatePreview();
            });
            
            renderNoteList(notes);
            toggleEditMode(false);
        }
    }

    // 创建新笔记
    function createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            content: '',
            created: new Date().toISOString()
        };
        noteStorage.notes.unshift(newNote);
        saveNotes();
        loadNote(newNote.id);
        toggleEditMode(true);
    }

    // 保存笔记
    async function saveNote() {
        if (!currentNoteId) {
            createNewNote();
            return;
        }

        try {
            const noteIndex = noteStorage.notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                noteStorage.notes[noteIndex] = {
                    ...noteStorage.notes[noteIndex],
                    title: titleInput.value,
                    content: markdownInput.value,
                    updated: new Date().toISOString()
                };

                try {
                    await noteStorage.saveNotes(noteStorage.notes);
                } catch (error) {
                    localStorage.setItem(`notes-${noteStorage.username}`, JSON.stringify(noteStorage.notes));
                }

                renderNoteList(noteStorage.notes);
                showNotification('保存成功');
            }
        } catch (error) {
            showNotification('保存失败', 'error');
        }
    }

    // 保存所有笔记到本地存储
    function saveNotes() {
        try {
            localStorage.setItem(`notes-${noteStorage.username}`, JSON.stringify(noteStorage.notes));
        } catch (error) {
            console.error('本地保存失败:', error);
            showNotification('本地保存失败', 'error');
        }
    }

    // 显示通知
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 显示删除对话框
    function showDeleteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <div class="delete-dialog-content">
                <h3>确认删除</h3>
                <p>确定要删除这个笔记吗？此操作不可撤销。</p>
                <div class="delete-dialog-buttons">
                    <button class="cancel-delete">取消</button>
                    <button class="confirm-delete">删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        setTimeout(() => dialog.classList.add('show'), 0);
        
        dialog.querySelector('.cancel-delete').onclick = () => {
            dialog.remove();
        };
        
        dialog.querySelector('.confirm-delete').onclick = () => {
            deleteCurrentNote();
            dialog.remove();
        };
    }

    // 删除当前笔记
    async function deleteCurrentNote() {
        if (!currentNoteId) return;
        
        try {
            // 从本地数组中删除
            const index = noteStorage.notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                noteStorage.notes.splice(index, 1);
                
                // 同步到服务器
                try {
                    await noteStorage.saveNotes(noteStorage.notes);
                    console.log('笔记已从服务器删除');
                } catch (error) {
                    console.error('服务器删除失败:', error);
                    // 继续执行本地删除
                }
                
                // 更新UI
                if (noteStorage.notes.length > 0) {
                    loadNote(noteStorage.notes[0].id);
                } else {
                    currentNoteId = null;
                    titleInput.value = '';
                    markdownInput.value = '';
                    updatePreview();
                }
                renderNoteList(noteStorage.notes);
                showNotification('删除成功');
            }
        } catch (error) {
            console.error('删除笔记失败:', error);
            showNotification('删除失败', 'error');
        }
    }

    // 处理代码块
    function handleCodeBlocks() {
        document.querySelectorAll('#preview pre code').forEach(code => {
            const pre = code.parentElement;
            if (pre.parentElement.classList.contains('code-block')) return;

            // 创建代码块包装器
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            // 添加展开/折叠按钮
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            expandButton.innerHTML = '<span class="mdi mdi-arrow-expand"></span>展开';
            
            expandButton.addEventListener('click', () => {
                const isExpanded = pre.style.maxHeight !== 'none';
                pre.style.maxHeight = isExpanded ? 'none' : '300px';
                expandButton.innerHTML = isExpanded ? 
                    '<span class="mdi mdi-arrow-collapse"></span>折叠' : 
                    '<span class="mdi mdi-arrow-expand"></span>展开';
            });
            
            wrapper.appendChild(expandButton);

            let language = '';
            code.classList.forEach(cls => {
                if (cls.startsWith('language-')) {
                    language = cls.replace('language-', '');
                }
            });

            const langLabel = document.createElement('div');
            langLabel.className = 'code-language';
            langLabel.textContent = language || 'text';
            wrapper.insertBefore(langLabel, pre);

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
            
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    copyButton.innerHTML = '<span class="mdi mdi-check"></span>已复制';
                    setTimeout(() => {
                        copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                    copyButton.innerHTML = '<span class="mdi mdi-alert"></span>复制失败';
                    setTimeout(() => {
                        copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
                    }, 2000);
                }
            });

            wrapper.appendChild(copyButton);
        });
    }

    // 代码处理函数
    function handleInlineCode() {
        document.querySelectorAll('#preview code:not(pre code)').forEach(code => {
            // 如果代码已经被处理过，跳过
            if (code.parentNode.classList.contains('inline-code-container')) {
                return;
            }

            // 创建容器
            const container = document.createElement('span');
            container.className = 'inline-code-container';
            
            // 包装代码元素
            code.parentNode.insertBefore(container, code);
            container.appendChild(code);

            // 创建复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
            copyBtn.type = 'button';
            copyBtn.title = '复制代码';
            
            // 绑定点击事件
            copyBtn.addEventListener('mousedown', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const text = code.textContent.trim();
                    await navigator.clipboard.writeText(text);
                    
                    copyBtn.className = 'inline-copy-btn mdi mdi-check';
                    copyBtn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
                        copyBtn.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                    copyBtn.className = 'inline-copy-btn mdi mdi-alert';
                    copyBtn.style.color = '#ef4444';
                    
                    setTimeout(() => {
                        copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
                        copyBtn.style.color = '';
                    }, 2000);
                }
            });

            // 添加按钮到容器
            container.appendChild(copyBtn);
        });
    }

    // 处理点击外部事件
    function handleOutsideClick(e) {
        const shouldKeepOpen = 
            e.target.closest('.notepad') || 
            e.target.closest('.floating-button') ||
            e.target.closest('.action-button') || 
            e.target.closest('.code-dialog') || 
            e.target.closest('.delete-dialog') || 
            e.target.closest('input[type="file"]') || 
            e.target.closest('a[download]');

        if (!shouldKeepOpen && notepad.classList.contains('show')) {
            notepad.classList.remove('show');
            setTimeout(() => {
                notepad.style.display = 'none';
            }, 300);
        }
    }

    // 修改代码块处理函数
    function processCodeBlocks() {
        // 先应用高亮
        document.querySelectorAll('#preview pre code').forEach(block => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });

        // 处理代码块UI
        handleCodeBlocks();
        handleInlineCode();
    }

    // 修改工具栏事件绑定
    function initializeToolbar() {
        // 工具栏按钮
        document.querySelectorAll('.toolbar-btn[data-format]').forEach(button => {
            button.addEventListener('click', () => {
                if (!isEditMode) return;
                const format = button.dataset.format;
                const start = markdownInput.selectionStart;
                const end = markdownInput.selectionEnd;
                const text = markdownInput.value;
                let newText, newStart, newEnd;

                if (start === end) {
                    // 没有选中文本时的处理
                    if (format === '# ' || format === '- ' || format === '1. ') {
                        // 对于标题和列表，确保在行首
                        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
                        if (format === '1. ') {
                            const beforeText = text.slice(0, lineStart);
                            const matches = beforeText.match(/^\d+\. /gm);
                            const num = matches ? matches.length + 1 : 1;
                            newText = text.slice(0, lineStart) + `${num}. ` + text.slice(start);
                            newStart = lineStart + `${num}. `.length;
                        } else {
                            newText = text.slice(0, lineStart) + format + text.slice(start);
                            newStart = lineStart + format.length;
                        }
                        newEnd = newStart;
                    } else {
                        // 其他格式（加粗、斜体等）
                        const defaultText = {
                            '**': '粗体文本',
                            '*': '斜体文本',
                            '`': '代码'
                        }[format] || '';
                        newText = text.slice(0, start) + format + defaultText + format + text.slice(end);
                        newStart = start + format.length;
                        newEnd = newStart + defaultText.length;
                    }
                } else {
                    // 有选中文本时的处理
                    const selectedText = text.slice(start, end);
                    if (format === '# ' || format === '- ' || format === '1. ') {
                        // 对于标题和列表，处理多行
                        const lines = selectedText.split('\n');
                        const formattedLines = lines.map((line, index) => {
                            if (format === '1. ') {
                                return `${index + 1}. ${line.trim()}`;
                            }
                            return format + line.trim();
                        });
                        newText = text.slice(0, start) + formattedLines.join('\n') + text.slice(end);
                        newStart = start;
                        newEnd = start + formattedLines.join('\n').length;
                    } else {
                        // 其他格式（加粗、斜体等）
                        newText = text.slice(0, start) + format + selectedText + format + text.slice(end);
                        newStart = start + format.length;
                        newEnd = end + format.length;
                    }
                }

                markdownInput.value = newText;
                markdownInput.setSelectionRange(newStart, newEnd);
                markdownInput.focus();
                updatePreview();
                saveNote();
            });
        });

        // 代码块按钮
        const codeBlockBtn = document.getElementById('codeBlockBtn');
        if (codeBlockBtn) {
            codeBlockBtn.addEventListener('click', () => {
                if (!isEditMode) return;
                codeDialog.style.display = 'flex';
                codeInput.focus();
            });
        }

        // 行内代码按钮
        const inlineCodeBtn = document.getElementById('inlineCodeBtn');
        if (inlineCodeBtn) {
            inlineCodeBtn.addEventListener('click', () => {
                if (!isEditMode) return;
                const start = markdownInput.selectionStart;
                const end = markdownInput.selectionEnd;
                const text = markdownInput.value;
                let newText, newStart, newEnd;

                if (start === end) {
                    newText = text.slice(0, start) + '`代码`' + text.slice(end);
                    newStart = start + 1;
                    newEnd = start + 3;
                } else {
                    const selectedText = text.slice(start, end);
                    newText = text.slice(0, start) + '`' + selectedText + '`' + text.slice(end);
                    newStart = start + 1;
                    newEnd = end + 1;
                }

                markdownInput.value = newText;
                markdownInput.setSelectionRange(newStart, newEnd);
                markdownInput.focus();
                updatePreview();
                saveNote();
            });
        }
    }

    // 代码块对话框处理
    function initializeCodeDialog() {
        const codeDialog = document.getElementById('codeDialog');
        const codeInput = document.getElementById('codeInput');
        const languageSelect = document.getElementById('languageSelect');

        // 取消按钮
        codeDialog.querySelector('.cancel-btn').addEventListener('click', () => {
            codeDialog.style.display = 'none';
            codeInput.value = '';
        });

        // 确认按钮
        codeDialog.querySelector('.confirm-btn').addEventListener('click', () => {
            const code = codeInput.value.trim();
            if (code) {
                const lang = languageSelect.value;
                const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\`\n`;
                
                // 插入代码块
                const start = markdownInput.selectionStart;
                markdownInput.value = 
                    markdownInput.value.slice(0, start) + 
                    codeBlock + 
                    markdownInput.value.slice(start);
                
                // 更新光标位置
                const newPosition = start + codeBlock.length;
                markdownInput.setSelectionRange(newPosition, newPosition);
                
                // 触发更新
                updatePreview();
                saveNote();
            }
            
            // 关闭对话框
            codeDialog.style.display = 'none';
            codeInput.value = '';
        });

        // 点击外部关闭
        codeDialog.addEventListener('click', (e) => {
            if (e.target === codeDialog) {
                codeDialog.style.display = 'none';
                codeInput.value = '';
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && codeDialog.style.display === 'flex') {
                codeDialog.style.display = 'none';
                codeInput.value = '';
            }
        });
    }

    // 修改加载笔记函数
    async function loadNotes() {
        try {
            // 尝试从服务器加载
            const notes = await fetchApi(`/custom/helper/md/notes/${noteStorage.username}`);
            noteStorage.notes = notes;
        } catch (error) {
            // 仅在降级到本地存储时提示
            console.warn('服务器加载失败，使用本地存储');
            const localNotes = localStorage.getItem(`notes-${noteStorage.username}`);
            noteStorage.notes = localNotes ? JSON.parse(localNotes) : [];
        }
        renderNoteList(noteStorage.notes);
    }
})(); 