document.addEventListener('DOMContentLoaded', () => {
    // Dynamically load the project-overlay.css stylesheet to ensure styling is applied
    const isSubfolder = window.location.pathname.includes("/projects/") || window.location.pathname.includes("/photography/");
    const prefix = isSubfolder ? "../" : "./";
    if (!document.querySelector(`link[href*="project-overlay.css"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${prefix}css/project-overlay.css`;
        document.head.appendChild(link);
    }

    // Helper to detect low-spec or slow network devices
    function isLowSpecDevice() {
        // Detect slow network connection or Data Saver enabled
        if (navigator.connection) {
            if (navigator.connection.saveData) return true;
            const slowConnections = ['slow-2g', '2g', '3g'];
            if (slowConnections.includes(navigator.connection.effectiveType)) return true;
        }
        if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
        return false;
    }

    // Cache for Web Audio API to bypass IDM interception
    let audioCtx = null;
    const audioBuffers = {};
    let lastSfxPlayTime = 0; // Throttle to prevent lagging on fast slide spamming

    // Helper to play SFX dynamically using Web Audio API to bypass IDM
    function playSfx(sfxName, isInteractive = false) {
        if (isLowSpecDevice()) return;
        
        // Limit SFX playback frequency to avoid overloading audio thread/decoding
        const now = Date.now();
        if (now - lastSfxPlayTime < 120) return;
        lastSfxPlayTime = now;
        
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (audioCtx.state === 'suspended') {
                if (!isInteractive) {
                    console.log("AudioContext is suspended and not interactive. Skipping SFX:", sfxName);
                    return;
                }
                audioCtx.resume();
            }

            const isSubfolder = window.location.pathname.includes("/projects/") || window.location.pathname.includes("/photography/");
            const prefix = isSubfolder ? "../" : "./";
            const url = `${prefix}assets/sfx/${sfxName}`;

            if (audioBuffers[url]) {
                playBuffer(audioBuffers[url]);
            } else {
                fetch(url)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        audioBuffers[url] = audioBuffer;
                        playBuffer(audioBuffer);
                    })
                    .catch(err => console.log("Audio fetch/decode failed:", err));
            }
        } catch (e) {
            console.log("Web Audio API not supported, falling back:", e);
            if (!isInteractive) return;
            // Fallback to standard Audio if Web Audio API fails
            const isSubfolder = window.location.pathname.includes("/projects/") || window.location.pathname.includes("/photography/");
            const prefix = isSubfolder ? "../" : "./";
            const audio = new Audio(`${prefix}assets/sfx/${sfxName}`);
            audio.play().catch(err => console.log("Fallback SFX blocked:", err));
        }

        function playBuffer(buffer) {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
        }
    }

    // 1. Mobile Warning & Performance Safeguard
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    const mvs = document.querySelectorAll('model-viewer');

    if (isMobile && mvs.length > 0) {
        // Instantly remove src to block heavy 3D asset downloads before consent
        mvs.forEach(mv => {
            mv.dataset.src = mv.getAttribute('src');
            mv.removeAttribute('src');
        });

        // Dynamically create mobile warning overlay HTML
        let warningOverlay = document.getElementById('p5-mobile-warning');
        if (!warningOverlay) {
            warningOverlay = document.createElement('div');
            warningOverlay.id = 'p5-mobile-warning';
            warningOverlay.className = 'p5-warning-overlay';
            warningOverlay.style.opacity = '0';
            warningOverlay.style.visibility = 'hidden';
            warningOverlay.style.pointerEvents = 'none';
            warningOverlay.innerHTML = `
                <div class="p5-warning-box">
                    <div class="p5-warning-accent">WARNING!</div>
                    <h2 class="p5-warning-title">BEBAN DATA SANGAT BERAT</h2>
                    <p class="p5-warning-desc">
                        Halaman ini memuat model 3D interaktif berukuran <strong>BESAR</strong>.
                        Browser handphone Anda dapat mengalami force close (crash) karena keterbatasan memori RAM.
                    </p>
                    <p class="p5-warning-suggestion">
                        Disarankan untuk membuka halaman ini melalui <strong>Browser PC/Laptop</strong> untuk performa optimal.
                    </p>
                    <div class="p5-warning-buttons">
                        <button id="p5-warning-proceed" class="p5-warn-btn btn-proceed">LANJUTKAN SAJA</button>
                        <button id="p5-warning-back" class="p5-warn-btn btn-back">KEMBALI</button>
                    </div>
                </div>
            `;
            document.body.appendChild(warningOverlay);
        }

        warningOverlay.style.opacity = '';
        warningOverlay.style.visibility = '';
        warningOverlay.style.pointerEvents = '';
        warningOverlay.classList.add('active');

        // Play warning sound effect
        playSfx("persona-5-notification.dat", false);

        const proceedBtn = document.getElementById('p5-warning-proceed');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                warningOverlay.classList.remove('active');
                // Restore assets progressively via queue to prevent network freeze & WebGL crash
                if (typeof window.start3DGalleryQueue === 'function') {
                    window.start3DGalleryQueue();
                }
                mvs.forEach(mv => {
                    // Only restore immediately for standalone non-gallery hero 3D models
                    if (!mv.closest('.gallery-item') && mv.dataset.src && !mv.getAttribute('src')) {
                        mv.setAttribute('src', mv.dataset.src);
                    }
                });
                // Trigger the end of the transition overlay
                if (typeof window.endP5Transition === 'function') {
                    window.endP5Transition();
                }
            });
        }

        const backBtn = document.getElementById('p5-warning-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Navigate back or to index
                if (document.referrer) {
                    window.location.href = document.referrer;
                } else {
                    const isSubfolder = window.location.pathname.includes("/projects/") || window.location.pathname.includes("/photography/");
                    window.location.href = isSubfolder ? '../index.html' : './index.html';
                }
            });
        }
    }

    // 2. Create lightbox elements dynamically
    const lightbox = document.createElement('div');
    lightbox.id = 'p5-lightbox';
    lightbox.style.opacity = '0';
    lightbox.style.visibility = 'hidden';
    lightbox.style.pointerEvents = 'none';

    lightbox.innerHTML = `
        <div class="lightbox-close">&times;</div>
        <div class="lightbox-arrow lightbox-arrow-left">&lsaquo;</div>
        <div class="lightbox-arrow lightbox-arrow-right">&rsaquo;</div>
        <div class="lightbox-wrapper">
            <div id="lightbox-3d-loading" class="mv-loading-poster" style="display: none;">
                <div class="mv-loading-spinner"></div>
                <span class="mv-loading-text">LOADING 3D SCENE</span>
            </div>
            <img class="lightbox-content" src="" alt="">
            <model-viewer id="lightbox-3d-mv" class="lightbox-content lightbox-3d-content"
                auto-rotate camera-controls shadow-intensity="1.2"
                skybox-image="${prefix}assets/3d/citrus_orchard_road_puresky_1k.hdr"
                environment-image="${prefix}assets/3d/citrus_orchard_road_puresky_1k.hdr"
                exposure="1.0"
                style="display: none;">
            </model-viewer>
            <div class="lightbox-image-overlay"></div>
        </div>
        <div class="lightbox-caption"></div>
        <div class="lightbox-thumbnails-container">
            <div class="lightbox-thumbnails-track"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const imageOverlay = lightbox.querySelector('.lightbox-image-overlay');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    if (lightboxClose) {
        lightboxClose.addEventListener('animationend', (e) => {
            if (e.animationName === 'p5-close-entrance') {
                lightboxClose.classList.add('entrance-done');
            }
        });
    }
    const arrowLeft = lightbox.querySelector('.lightbox-arrow-left');
    const arrowRight = lightbox.querySelector('.lightbox-arrow-right');
    const thumbTrack = lightbox.querySelector('.lightbox-thumbnails-track');
    const thumbContainer = lightbox.querySelector('.lightbox-thumbnails-container');

    // Image Zoom Feature (Pan on hover/drag)
    function toggleZoom(e) {
        if (!lightboxImg || lightboxImg.style.display === 'none') return;
        
        const wrapper = lightboxImg.closest('.lightbox-wrapper');
        if (!wrapper) return;

        if (lightboxImg.classList.contains('zoomed')) {
            resetZoom();
        } else {
            lightboxImg.classList.add('zoomed');
            
            const handleMove = (clientX, clientY) => {
                const rect = wrapper.getBoundingClientRect();
                const x = ((clientX - rect.left) / rect.width) * 100;
                const y = ((clientY - rect.top) / rect.height) * 100;
                lightboxImg.style.transformOrigin = `${x}% ${y}%`;
            };
            
            const handleMouseMove = (event) => {
                handleMove(event.clientX, event.clientY);
            };

            const handleTouchMove = (event) => {
                if (event.touches.length > 0) {
                    event.preventDefault();
                    handleMove(event.touches[0].clientX, event.touches[0].clientY);
                }
            };
            
            let initX = e.clientX;
            let initY = e.clientY;
            if (e.changedTouches && e.changedTouches.length > 0) {
                initX = e.changedTouches[0].clientX;
                initY = e.changedTouches[0].clientY;
            } else if (e.touches && e.touches.length > 0) {
                initX = e.touches[0].clientX;
                initY = e.touches[0].clientY;
            }
            
            if (initX !== undefined && initY !== undefined) {
                handleMove(initX, initY);
            } else {
                lightboxImg.style.transformOrigin = 'center center';
            }

            lightboxImg.addEventListener('mousemove', handleMouseMove);
            lightboxImg.addEventListener('touchmove', handleTouchMove, { passive: false });
            
            lightboxImg._zoomMoveHandler = handleMouseMove;
            lightboxImg._touchMoveHandler = handleTouchMove;
        }
    }

    function resetZoom() {
        if (lightboxImg && lightboxImg.classList.contains('zoomed')) {
            lightboxImg.classList.remove('zoomed');
            if (lightboxImg._zoomMoveHandler) {
                lightboxImg.removeEventListener('mousemove', lightboxImg._zoomMoveHandler);
                lightboxImg.removeEventListener('touchmove', lightboxImg._touchMoveHandler, { passive: false });
                lightboxImg._zoomMoveHandler = null;
                lightboxImg._touchMoveHandler = null;
            }
            lightboxImg.style.transformOrigin = '';
        }
    }

    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleZoom(e);
        });
    }

    // Expose select function globally for inline onclick handlers (100% reliable click capture)
    window.p5SelectThumbnail = (index) => {
        try {
            const idx = parseInt(index, 10);
            if (updateLightboxContent(idx)) {
                playSfx("deck_ui_show_modal.dat", true);
            }
        } catch (err) {
            console.error("p5SelectThumbnail Error:", err);
        }
    };

    // Event listener on thumbContainer to catch clicks directly and avoid delegation issues
    if (thumbContainer) {
        thumbContainer.addEventListener('click', (e) => {
            const thumb = e.target.closest('.lightbox-thumbnail-wrapper');
            if (thumb) {
                e.stopPropagation();
                try {
                    const index = parseInt(thumb.getAttribute('data-index'), 10);
                    if (updateLightboxContent(index)) {
                        playSfx("deck_ui_show_modal.dat", true);
                    }
                } catch (err) {
                    console.error("thumbContainer Click Error:", err);
                }
            }
        });
    }

    // Keep track of active media items and active index
    let currentMediaList = [];
    let currentActiveIndex = -1;

    // Helper to update the lightbox content based on currentActiveIndex
    function updateLightboxContent(index) {
        try {
            if (index < 0 || index >= currentMediaList.length) return false;
            if (index === currentActiveIndex) return false; // Skip if clicking the same photo
            
            resetZoom();
            currentActiveIndex = index;

            const mediaItem = currentMediaList[index];
            const is3D = mediaItem.classList.contains('gallery-item');

            if (is3D) {
                // 3D Model Preview
                if (lightboxImg) lightboxImg.style.display = 'none';

                let lightboxMv = lightbox.querySelector('#lightbox-3d-mv');
                if (!lightboxMv) {
                    lightboxMv = document.createElement('model-viewer');
                    lightboxMv.id = 'lightbox-3d-mv';
                    lightboxMv.className = 'lightbox-content lightbox-3d-content';
                    lightboxMv.setAttribute('auto-rotate', '');
                    lightboxMv.setAttribute('camera-controls', '');
                    lightboxMv.setAttribute('shadow-intensity', '1.2');
                    lightboxMv.setAttribute('skybox-image', `${prefix}assets/3d/citrus_orchard_road_puresky_1k.hdr`);
                    lightboxMv.setAttribute('environment-image', `${prefix}assets/3d/citrus_orchard_road_puresky_1k.hdr`);
                    lightboxMv.setAttribute('exposure', '1.0');
                    const wrapperDiv = lightbox.querySelector('.lightbox-wrapper');
                    if (wrapperDiv) {
                        wrapperDiv.appendChild(lightboxMv);
                    }
                }
                lightboxMv.style.display = 'block';

                const mvElement = mediaItem.querySelector('model-viewer');
                const modelUrl = mvElement ? (mvElement.getAttribute('src') || mvElement.dataset.src) : '';
                const posterUrl = mvElement ? (mvElement.getAttribute('poster') || mvElement.dataset.poster) : '';
                const altText = mvElement ? (mvElement.getAttribute('alt') || 'INTERACTIVE 3D MODEL') : 'INTERACTIVE 3D MODEL';

                if (posterUrl) {
                    lightboxMv.setAttribute('poster', posterUrl);
                } else {
                    lightboxMv.removeAttribute('poster');
                }
                if (modelUrl) {
                    lightboxMv.setAttribute('src', modelUrl);
                }
                lightboxMv.setAttribute('alt', altText);

                if (lightboxCaption) {
                    const counter = currentMediaList.length > 1 ? ` (${index + 1} / ${currentMediaList.length})` : '';
                    lightboxCaption.innerText = altText.toUpperCase() + counter;
                }

                // Show arrows and thumbnails if there are multiple items
                if (currentMediaList.length > 1) {
                    if (arrowLeft) arrowLeft.style.display = 'flex';
                    if (arrowRight) arrowRight.style.display = 'flex';
                    if (thumbContainer) thumbContainer.style.display = 'block';
                } else {
                    if (arrowLeft) arrowLeft.style.display = 'none';
                    if (arrowRight) arrowRight.style.display = 'none';
                    if (thumbContainer) thumbContainer.style.display = 'none';
                }

                // Rebuild the sliding window of thumbnails
                buildThumbnails();
            } else {
                // Static Image Preview
                const lightboxMv = lightbox.querySelector('#lightbox-3d-mv');
                if (lightboxMv) {
                    lightboxMv.removeAttribute('src');
                    lightboxMv.style.display = 'none';
                }
                const canvas = lightbox.querySelector('#lightbox-3d-canvas');
                if (canvas) canvas.style.display = 'none';
                if (lightboxImg) lightboxImg.style.display = 'block';

                const img = mediaItem.querySelector('img');
                if (!img) return;

                if (lightboxImg) {
                    const isAlreadyActive = lightbox.classList.contains('active');

                    if (isAlreadyActive && imageOverlay) {
                        // Fade overlay to solid black first
                        imageOverlay.classList.add('active');

                        // Clear any pending transition timeouts to prevent race conditions
                        if (window.p5ImageTransitionTimeout) {
                            clearTimeout(window.p5ImageTransitionTimeout);
                        }

                        // Preload and decode the image before revealing it
                        const tempImg = new Image();
                        const targetSrc = img.getAttribute('data-full') || img.src;
                        let loadingDone = false;

                        // Safety timeout (3 seconds) to prevent hanging if image fails to load
                        const safetyTimeout = setTimeout(() => {
                            if (!loadingDone) {
                                loadingDone = true;
                                applyImageChange();
                            }
                        }, 3000);

                        function applyImageChange() {
                            lightboxImg.src = targetSrc;
                            lightboxImg.alt = img.alt;
                            
                            // Copy inline style object-position from original image if any
                            if (img.style.objectPosition) {
                                lightboxImg.style.objectPosition = img.style.objectPosition;
                            } else {
                                lightboxImg.style.objectPosition = 'center center';
                            }
                            
                            // Set caption with index counter (e.g. "Felines & Friends Photo 12 (12 / 37)")
                            if (lightboxCaption) {
                                const counter = currentMediaList.length > 1 ? ` (${index + 1} / ${currentMediaList.length})` : '';
                                lightboxCaption.innerText = (img.alt || 'PREVIEW IMAGE') + counter;
                            }

                            // Fade back in after a tiny paint delay
                            setTimeout(() => {
                                imageOverlay.classList.remove('active');
                            }, 50);
                        }

                        const handleLoad = () => {
                            if (loadingDone) return;
                            if (typeof tempImg.decode === 'function') {
                                tempImg.decode()
                                    .then(() => {
                                        if (!loadingDone) {
                                            clearTimeout(safetyTimeout);
                                            loadingDone = true;
                                            applyImageChange();
                                        }
                                    })
                                    .catch(() => {
                                        if (!loadingDone) {
                                            clearTimeout(safetyTimeout);
                                            loadingDone = true;
                                            applyImageChange();
                                        }
                                    });
                            } else {
                                clearTimeout(safetyTimeout);
                                loadingDone = true;
                                applyImageChange();
                            }
                        };

                        tempImg.src = targetSrc;
                        if (tempImg.complete) {
                            handleLoad();
                        } else {
                            tempImg.onload = handleLoad;
                            tempImg.onerror = () => {
                                if (!loadingDone) {
                                    clearTimeout(safetyTimeout);
                                    loadingDone = true;
                                    applyImageChange();
                                }
                            };
                        }
                    } else {
                        // Instant load for the initial lightbox opening
                        if (imageOverlay) imageOverlay.classList.remove('active');
                        lightboxImg.src = img.getAttribute('data-full') || img.src;
                        lightboxImg.alt = img.alt;
                        
                        if (img.style.objectPosition) {
                            lightboxImg.style.objectPosition = img.style.objectPosition;
                        } else {
                            lightboxImg.style.objectPosition = 'center center';
                        }
                        
                        if (lightboxCaption) {
                            const counter = currentMediaList.length > 1 ? ` (${index + 1} / ${currentMediaList.length})` : '';
                            lightboxCaption.innerText = (img.alt || 'PREVIEW IMAGE') + counter;
                        }
                    }
                }

                // Show arrows and thumbnails for static image galleries
                if (currentMediaList.length > 1) {
                    if (arrowLeft) arrowLeft.style.display = 'flex';
                    if (arrowRight) arrowRight.style.display = 'flex';
                    if (thumbContainer) thumbContainer.style.display = 'block';
                } else {
                    if (arrowLeft) arrowLeft.style.display = 'none';
                    if (arrowRight) arrowRight.style.display = 'none';
                    if (thumbContainer) thumbContainer.style.display = 'none';
                }

                // Rebuild the sliding window of thumbnails
                buildThumbnails();
            }
            return true;
        } catch (err) {
            console.error("updateLightboxContent error:", err);
            return false;
        }
    }

    // Build the full thumbnails track for complete fullscreen stretching and scrolling
    function buildThumbnails() {
        if (!thumbTrack || currentMediaList.length === 0) return;

        const total = currentMediaList.length;
        let start = 0;
        let end = total - 1;

        let htmlString = '';
        for (let i = start; i <= end; i++) {
            const mediaItem = currentMediaList[i];
            const is3D = mediaItem.classList.contains('gallery-item');
            const img = mediaItem.querySelector('img');
            let src = '';
            let alt = '';
            
            if (is3D) {
                const mvElement = mediaItem.querySelector('model-viewer');
                src = mvElement ? (mvElement.getAttribute('poster') || mvElement.dataset.poster || '../assets/logo/sdefault.png') : '../assets/logo/sdefault.png';
                alt = mvElement ? (mvElement.getAttribute('alt') || `3D Model ${i + 1}`) : `3D Model ${i + 1}`;
            } else if (img) {
                src = img.src;
                alt = img.alt || `Photo ${i + 1}`;
            }

            const isActive = (i === currentActiveIndex) ? 'active' : '';
            htmlString += `
                <div class="lightbox-thumbnail-wrapper ${isActive}" onclick="window.p5SelectThumbnail(${i})" data-index="${i}">
                    <img class="lightbox-thumbnail" src="${src}" alt="${alt}" loading="lazy">
                </div>
            `;
        }

        thumbTrack.innerHTML = htmlString;

        // Scroll the active thumbnail into center view
        setTimeout(() => {
            const activeThumb = thumbTrack.querySelector('.lightbox-thumbnail-wrapper.active');
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 10);
    }

    // Navigation triggers
    const navigateLeft = (e) => {
        if (e) e.stopPropagation();
        if (currentMediaList.length <= 1) return;
        let prevIndex = currentActiveIndex - 1;
        if (prevIndex < 0) prevIndex = currentMediaList.length - 1;
        updateLightboxContent(prevIndex);
        playSfx("deck_ui_show_modal.dat", true);
    };

    const navigateRight = (e) => {
        if (e) e.stopPropagation();
        if (currentMediaList.length <= 1) return;
        let nextIndex = currentActiveIndex + 1;
        if (nextIndex >= currentMediaList.length) nextIndex = 0;
        updateLightboxContent(nextIndex);
        playSfx("deck_ui_show_modal.dat", true);
    };

    if (arrowLeft) arrowLeft.addEventListener('click', navigateLeft);
    if (arrowRight) arrowRight.addEventListener('click', navigateRight);

    // 3. Select all wrappers to be previewed
    const wrappers = document.querySelectorAll('.gallery-item, .story-image-wrapper, .story-video-wrapper, .photography-gallery-item');

    wrappers.forEach(wrapper => {
        if (wrapper.classList.contains('no-border') || wrapper.querySelector('iframe')) return;

        wrapper.style.cursor = 'pointer';

        wrapper.addEventListener('click', () => {
            const isPhotographyPage = window.location.pathname.includes("/photography/");
            const is3DGallery = wrapper.classList.contains('gallery-item');

            if (isPhotographyPage) {
                // Find all photography gallery items on the page
                const activeItems = Array.from(document.querySelectorAll('.photography-gallery-item'))
                    .filter(item => !item.classList.contains('no-border') && !item.querySelector('iframe'));

                currentMediaList = activeItems;
                const clickedIndex = activeItems.indexOf(wrapper);

                // Show lightbox and update the main content immediately for a lag-free pop
                updateLightboxContent(clickedIndex);
            } else if (is3DGallery) {
                // Collect all 3D gallery items on the page for multi-item thumbnail navigation!
                const activeItems = Array.from(document.querySelectorAll('.gallery-item'))
                    .filter(item => !item.classList.contains('no-border') && !item.querySelector('iframe') && item.querySelector('model-viewer'));

                currentMediaList = activeItems.length > 0 ? activeItems : [wrapper];
                const clickedIndex = currentMediaList.indexOf(wrapper);

                updateLightboxContent(clickedIndex >= 0 ? clickedIndex : 0);
            } else {
                // For standalone story images/videos, treat it as a single-item preview
                currentMediaList = [wrapper];
                
                if (arrowLeft) arrowLeft.style.display = 'none';
                if (arrowRight) arrowRight.style.display = 'none';
                if (thumbContainer) thumbContainer.style.display = 'none';

                updateLightboxContent(0);
            }

            // Show lightbox
            lightbox.style.opacity = '';
            lightbox.style.visibility = '';
            lightbox.style.pointerEvents = '';
            lightbox.classList.add('active');
            playSfx("deck_ui_show_modal.dat", true);
            document.body.classList.add('p5-transition-active');
        });
    });

    // 4. Close functions
    const closeLightbox = () => {
        resetZoom();
        lightbox.classList.remove('active');
        playSfx("deck_ui_switch_toggle_off.dat", true);
        document.body.classList.remove('p5-transition-active');

        // Reset active index so reopening is not blocked by duplicate index safeguard
        currentActiveIndex = -1;

        // Reset close button animation style to allow entrance animation on next open
        if (lightboxClose) {
            lightboxClose.classList.remove('entrance-done');
        }

        // Clean up 3D model-viewer
        const lightboxMv = lightbox.querySelector('#lightbox-3d-mv');
        if (lightboxMv) {
            lightboxMv.removeAttribute('src');
            lightboxMv.style.display = 'none';
        }

        // Dispose 3D viewer to free memory
        if (typeof dispose3DViewer === 'function') {
            dispose3DViewer();
        }

        // Clean up canvas
        const canvas = lightbox.querySelector('#lightbox-3d-canvas');
        if (canvas) canvas.remove();
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close when clicking background outside the wrapper (restricted to projects only)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            const isPhotographyPage = window.location.pathname.includes("/photography/");
            if (!isPhotographyPage) {
                closeLightbox();
            }
        }
    });

    // Close on Escape key or navigate with keyboard arrows
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                const isPhotographyPage = window.location.pathname.includes("/photography/");
                if (!isPhotographyPage) {
                    closeLightbox();
                }
            } else if (e.key === 'ArrowLeft') {
                navigateLeft();
            } else if (e.key === 'ArrowRight') {
                navigateRight();
            }
        }
    });

    // Capture phase event listener on document level to ensure thumbnail clicks are caught 100% of the time
    document.addEventListener('click', (e) => {
        const thumb = e.target.closest('.lightbox-thumbnail-wrapper');
        if (thumb) {
            e.stopPropagation();
            e.preventDefault();
            const index = parseInt(thumb.getAttribute('data-index'), 10);
            if (!isNaN(index)) {
                try {
                    if (updateLightboxContent(index)) {
                        playSfx("deck_ui_show_modal.dat", true);
                    }
                } catch (err) {
                    console.error("Document Capture Click Error:", err);
                }
            }
        }
    }, true);

    // Play SFX when disabled download wrapper is clicked
    document.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.download-action-wrapper');
        if (wrapper) {
            playSfx("deck_ui_bumper_end_02.dat", true);
        }
    });

    // Check device AR support and hide AR guidance text if unsupported
    function checkARSupport() {
        const modelViewers = document.querySelectorAll('model-viewer');
        modelViewers.forEach(mv => {
            if (typeof mv.canActivateAR === 'function') {
                mv.canActivateAR().then(supported => {
                    if (!supported) {
                        const arHint = mv.parentElement ? mv.parentElement.querySelector('.ar-hint') : null;
                        if (arHint) {
                            arHint.style.display = 'none';
                        }
                    }
                });
            }
        });
    }

    if (window.customElements && typeof window.customElements.whenDefined === 'function') {
        window.customElements.whenDefined('model-viewer').then(checkARSupport);
    } else {
        window.addEventListener('load', checkARSupport);
    }
});
