// Header Navigation Component
(function () {
    const currentPath = window.location.pathname;
    const isAboutPage = currentPath.includes("about.html");
    const isProjectPage = currentPath.includes("project.html") || currentPath.includes("/projects/");
    const isPhotographyPage = currentPath.includes("photography.html") || currentPath.includes("/photography/");
    const isSubfolder = currentPath.includes("/projects/") || currentPath.includes("/photography/");
    const prefix = isSubfolder ? "../" : "./";

    // Helper to generate P5 collage letters for the "LET'S WORK TOGETHER" button
    function generateCollageText(text) {
        const colors = [
            { bg: '#E52E2E', text: '#FFFFFF' }, // Red bg, White text
            { bg: '#000000', text: '#FFFFFF' }, // Black bg, White text
            { bg: '#FFFFFF', text: '#000000' }  // White bg, Black text
        ];

        return text.split('').map((char, idx) => {
            if (char === ' ') {
                return `<span class="p5-btn-space"></span>`;
            }

            // Alternating colors
            const combo = colors[idx % colors.length];
            const rot = (Math.random() * 12 - 6).toFixed(1); // -6deg to 6deg
            const scale = (Math.random() * 0.15 + 0.95).toFixed(2); // 0.95 to 1.10
            const translateY = (Math.random() * 4 - 2).toFixed(1); // -2px to 2px

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
                <a href="${prefix}photography.html" class="nav-link ${isPhotographyPage ? 'active' : ''}">PHOTOGRAPHY SIDE</a>
            </nav>
            <div class="header-action-container">
                <a href="mailto:muhsururiardan@gmail.com" class="p5-nav-btn" aria-label="Mail Me">
                    <span class="btn-text">${buttonContentHtml}</span>
                    <span class="btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </span>
                </a>
            </div>
        </header>
    `);
})();
