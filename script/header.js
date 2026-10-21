// Header Navigation Component
(function () {
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const isAboutPage = currentPath.endsWith("/about") || currentPath.endsWith("/about.html");
    const isProjectPage = currentPath.endsWith("/project") || currentPath.endsWith("/project.html") || currentPath.includes("/projects");
    const isPhotographyPage = currentPath.endsWith("/visual-stories") || currentPath.endsWith("/visual-stories.html") || currentPath.includes("/photography");
    const isSubfolder = currentPath.includes("/projects/") || currentPath.includes("/photography/");
    const prefix = isSubfolder ? "../" : "./";

    // Helper to generate P5 collage letters for the "HIRE  ME" button
    function generateCollageText(text) {
        const colors = [
            { bg: '#E52E2E', text: '#FFFFFF' }, // Red bg, White text
            { bg: '#000000', text: '#FFFFFF' }, // Black bg, White text
            { bg: '#FFFFFF', text: '#000000' }  // White bg, Black text
        ];

        return text.split('').map((char, idx) => {
            if (char === ' ') {
                return '<span class="p5-btn-space"></span>';
            }

            const combo = colors[idx % colors.length];
            const rot = (Math.sin(idx * 3.5) * 6).toFixed(1);
            const scale = (0.95 + ((idx * 7) % 15) / 100).toFixed(2);
            const translateY = (((idx * 3) % 5) - 2).toFixed(1);

            return `<span class="p5-btn-letter" style="--rot:${rot}deg; --s:${scale}; --ty:${translateY}px; --bg:${combo.bg}; --fg:${combo.text}">${char}</span>`;
        }).join('');
    }

    const buttonContentHtml = generateCollageText("HIRE  ME");

    document.write(`
        <!-- Persona 5 Transition Overlay -->
        <div id="p5-transition-overlay">
            <div class="p5-slash p5-slash-1"></div>
            <div class="p5-slash p5-slash-2"></div>
            <div class="p5-slash p5-slash-3"></div>
            <div class="p5-slash p5-slash-4"></div>
            <div class="p5-slash p5-bg-cover"></div>
            <div class="p5-loading-container">
                <div class="p5-star-container">
                    <svg class="p5-star" viewBox="0 0 24 24" width="50" height="50">
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#E52E2E" stroke="#000000" stroke-width="2"/>
                    </svg>
                </div>
                <div class="p5-loading-text" id="p5-loading-text">LOADING</div>
            </div>
        </div>

        <header class="main-header">
            <div class="logo-container">
                <a href="${prefix}index.html" class="logo-link" aria-label="Home">
                    <svg class="header-logo-svg" width="70" height="70" viewBox="0 0 115 115" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logo-hover-gradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stop-color="#DA291C" />
                                <stop offset="100%" stop-color="#78111C" />
                            </linearGradient>
                        </defs>
                        <path d="M59.7886 41.387C62.0961 41.3016 64.774 41.4437 67.1228 41.464C75.4249 41.5361 83.6566 41.6794 90.7342 46.6717C95.6807 50.1077 99.0405 55.3858 100.06 61.3217C101.184 67.901 99.6457 74.6572 95.7844 80.1015C87.1316 92.2918 73.6466 91.7897 60.3504 91.5475L42.0111 91.1904C39.7912 91.1647 37.571 91.1752 35.3515 91.2222C30.7214 91.3074 26.9711 91.372 22.8221 88.8007C16.6279 84.962 13.8487 78.0282 11.9728 71.3149C11.5351 69.7486 9.68781 65.0415 10.6441 63.6972C11.9943 63.1009 23.3198 62.9514 25.4932 62.8783C26.0688 62.8587 26.6737 62.8929 27.2514 62.9144C28.3637 63.8174 28.658 64.7889 29.4355 65.5583C30.6073 66.718 32.7983 68.6313 34.1213 69.5776C30.0143 69.9733 25.6808 69.5765 21.5489 69.7117C20.7697 69.7372 18.936 69.6402 19.1488 70.8605C19.5949 73.4188 21.1934 77.1606 22.6114 79.33C23.1274 80.1264 23.7445 80.8525 24.4473 81.4903C25.9483 82.8575 28.1344 83.9258 30.1428 84.2596C31.81 84.5368 33.5322 84.2193 35.2094 84.174C37.3746 84.1156 39.5657 84.1456 41.7308 84.1757C49.461 84.2829 57.1976 84.8571 64.9313 84.8582C67.4236 84.8585 69.9414 84.7086 72.4311 84.5919C78.8531 84.2908 84.6952 82.2002 89.1081 77.3345C92.0363 74.1058 93.8684 69.7364 93.6324 65.3366C93.4291 61.5478 92.3141 58.0237 89.8398 55.0897C79.2967 42.5878 52.2111 52.2542 47.0224 47.4506C46.4071 46.8809 46.2531 46.2248 46.23 45.4146C46.2046 44.524 46.4061 43.8384 47.0344 43.1877C47.5371 42.667 48.0929 42.3166 48.7777 42.0846C51.4226 41.1884 56.9124 41.434 59.7886 41.387Z" />
                        <path d="M54.9958 23.5224C64.7078 23.523 74.3204 23.9045 84.0258 24.1478C87.2529 24.2286 90.4624 23.9468 93.6863 23.9364C94.7706 23.9329 95.7862 24.1904 96.544 25.0083C97.1443 25.6686 97.4567 26.5409 97.4119 27.4321C97.2729 30.7003 94.1779 30.921 91.6992 30.809C89.9579 30.7304 88.0656 30.7933 86.3116 30.7929L61.0245 30.7877L53.7136 30.7806C51.4873 30.779 49.3007 30.6774 47.1112 31.1117C44.2747 31.6484 41.6423 32.96 39.5056 34.9013C29.7516 43.875 34.7121 61.3986 48.251 62.6227C50.0577 62.7861 51.7826 62.9514 53.6026 63.0154C61.9468 63.431 70.6041 62.0109 78.9515 62.8819C81.5649 63.1547 82.6383 66.2452 81.1747 68.2645C79.8084 70.1497 77.0112 69.5764 74.9826 69.5214C72.8212 69.465 70.6588 69.4639 68.4974 69.5185C57.6895 69.8561 43.7399 71.6583 34.9421 63.8497C30.5019 59.8801 27.7991 54.3248 27.416 48.3812C27.0217 42.153 29.1285 36.025 33.2691 31.3558C39.8072 24.0506 46.1234 24.0164 54.9958 23.5224Z" />
                    </svg>
                </a>
            </div>
            <nav class="nav-pill">
                <a href="${prefix}about.html" class="nav-link ${isAboutPage ? 'active' : ''}">ABOUT ME</a>
                <a href="${prefix}project.html" class="nav-link ${isProjectPage ? 'active' : ''}">MY PROJECT</a>
                <a href="${prefix}visual-stories.html" class="nav-link ${isPhotographyPage ? 'active' : ''}">VISUAL STORIES</a>
            </nav>
            <div class="header-action-container">
                <button type="button" class="p5-nav-btn" aria-expanded="false" aria-label="Contact Options">
                    <span class="btn-text">${buttonContentHtml}</span>
                    <span class="btn-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                    </span>
                </button>

                <!-- Contact Popover Dropdown -->
                <div class="p5-contact-popover" role="menu">
                    <div class="p5-popover-header">
                        <div class="p5-popover-banner">
                            <span class="p5-banner-star">★</span>
                            <span class="p5-banner-text">COMMUNICATION</span>
                        </div>
                    </div>

                    <div class="p5-contact-options">
                        <!-- Option 1: WhatsApp -->
                        <a href="https://wa.link/lz1ber" target="_blank" rel="noopener noreferrer" class="p5-contact-item p5-item-wa">
                            <div class="p5-item-accent"></div>
                            <div class="p5-item-icon-box">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.181 8.181 0 0 1 2.41 5.83c.01 4.54-3.69 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.29z"/>
                                </svg>
                            </div>
                            <div class="p5-item-content">
                                <span class="p5-item-title">WHATSAPP</span>
                                <span class="p5-item-desc">FAST CHAT &amp; DISCUSSION</span>
                            </div>
                            <span class="p5-item-arrow">▶</span>
                        </a>

                        <!-- Option 2: Email -->
                        <a href="mailto:muhsururiardan@gmail.com" class="p5-contact-item p5-item-email">
                            <div class="p5-item-accent"></div>
                            <div class="p5-item-icon-box">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </div>
                            <div class="p5-item-content">
                                <span class="p5-item-title">EMAIL</span>
                                <span class="p5-item-desc">FORMAL PROPOSAL &amp; OFFER</span>
                            </div>
                            <span class="p5-item-arrow">▶</span>
                        </a>
                    </div>

                    <div class="p5-popover-footer">
                        <span class="p5-footer-hint">[ESC] CLOSE</span>
                    </div>
                </div>
            </div>
        </header>
    `);

    // Interactive Dropdown Logic
    function initContactDropdown() {
        const btn = document.querySelector('.header-action-container .p5-nav-btn');
        const popover = document.querySelector('.p5-contact-popover');
        const container = document.querySelector('.header-action-container');

        if (!btn || !popover) return;

        function toggleDropdown(show) {
            const isOpen = typeof show === 'boolean' ? show : !popover.classList.contains('show');
            if (isOpen) {
                popover.classList.add('show');
                btn.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                popover.classList.remove('show');
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDropdown();
        });

        // Close on option click
        popover.querySelectorAll('.p5-contact-item').forEach(function (item) {
            item.addEventListener('click', function () {
                toggleDropdown(false);
            });
        });

        // Close on click outside
        document.addEventListener('click', function (e) {
            if (container && !container.contains(e.target)) {
                toggleDropdown(false);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                toggleDropdown(false);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactDropdown);
    } else {
        initContactDropdown();
    }
})();
