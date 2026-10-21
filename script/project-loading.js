// Progressive 3D Concurrency Queue & Lazy Loading Manager
(function () {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    // Concurrency limit: max 2 downloads concurrently on desktop, 1 on mobile to protect bandwidth and WebGL context limits
    const MAX_CONCURRENT = isMobile ? 1 : 2;

    let activeLoads = 0;
    const queue = [];
    let isQueueActive = !isMobile; // Desktop runs immediately; mobile waits for user confirmation in warning modal

    function processQueue() {
        if (!isQueueActive) return;

        while (activeLoads < MAX_CONCURRENT && queue.length > 0) {
            // Sort queue dynamically to prioritize 3D models closest to the user's current scroll viewport
            const viewportCenter = window.innerHeight / 2;
            queue.sort((a, b) => {
                const rectA = a.getBoundingClientRect();
                const rectB = b.getBoundingClientRect();
                const distA = Math.abs(rectA.top + rectA.height / 2 - viewportCenter);
                const distB = Math.abs(rectB.top + rectB.height / 2 - viewportCenter);
                return distA - distB;
            });

            const mv = queue.shift();
            if (!mv || mv.dataset.loadingState === 'loading' || mv.dataset.loadingState === 'loaded') {
                continue;
            }

            mv.dataset.loadingState = 'loading';
            activeLoads++;

            const targetSrc = mv.dataset.src;
            if (targetSrc) {
                mv.setAttribute('src', targetSrc);
            }

            const onFinish = () => {
                mv.removeEventListener('load', onFinish);
                mv.removeEventListener('error', onFinish);
                mv.dataset.loadingState = 'loaded';
                activeLoads--;

                // Fade out poster smoothly
                const poster = mv.querySelector('[slot="poster"]');
                if (poster) {
                    poster.style.opacity = '0';
                    poster.style.pointerEvents = 'none';
                    setTimeout(() => {
                        poster.style.display = 'none';
                    }, 400);
                }

                // Process next waiting model in queue
                processQueue();
            };

            mv.addEventListener('load', onFinish);
            mv.addEventListener('error', onFinish);

            // Safety timeout: if a 3D model takes > 15s (e.g. slow network or error), release slot
            setTimeout(() => {
                if (mv.dataset.loadingState === 'loading') {
                    onFinish();
                }
            }, 15000);
        }
    }

    function init3DGalleryQueue() {
        const allModelViewers = document.querySelectorAll('model-viewer');

        // 1. Inject styled loading posters for all model-viewers if missing and no poster image attribute exists
        allModelViewers.forEach(mv => {
            if (!mv.hasAttribute('poster') && !mv.querySelector('[slot="poster"]')) {
                const poster = document.createElement('div');
                poster.setAttribute('slot', 'poster');
                poster.className = 'mv-loading-poster';
                const modelName = mv.getAttribute('alt') || '3D MODEL';
                poster.innerHTML = `
                    <div class="mv-loading-spinner"></div>
                    <span class="mv-loading-text">LOADING</span>
                    <span class="mv-loading-subtext">${modelName}</span>
                `;
                mv.appendChild(poster);
            }
        });

        // 2. Filter gallery items (multiple 3D grid)
        const galleryMVs = document.querySelectorAll('.gallery-item model-viewer, .project-gallery-section model-viewer');
        if (galleryMVs.length === 0) return;

        // 3. Stagger initial src extraction to stop browser from flooding network
        galleryMVs.forEach(mv => {
            const initialSrc = mv.getAttribute('src');
            if (initialSrc) {
                mv.dataset.src = initialSrc;
                mv.removeAttribute('src'); // Defer until viewport queue activates it
            }
        });

        // 4. Viewport Intersection Observer
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const mv = entry.target;
                if (entry.isIntersecting) {
                    if (!mv.dataset.loadingState && !queue.includes(mv)) {
                        queue.push(mv);
                        processQueue();
                    }
                }
            });
        }, {
            rootMargin: '250px 0px 250px 0px',
            threshold: 0.01
        });

        galleryMVs.forEach(mv => io.observe(mv));

        // 5. Reprioritize queue dynamically when user scrolls
        let scrollTimer;
        window.addEventListener('scroll', () => {
            if (!scrollTimer) {
                scrollTimer = setTimeout(() => {
                    scrollTimer = null;
                    processQueue();
                }, 120);
            }
        }, { passive: true });
    }

    // Expose queue activation function for mobile warning overlay or manual triggers
    window.start3DGalleryQueue = function () {
        isQueueActive = true;
        processQueue();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DGalleryQueue);
    } else {
        init3DGalleryQueue();
    }
})();
