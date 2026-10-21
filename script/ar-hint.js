document.querySelectorAll('.hero-left-col model-viewer').forEach(modelViewer => {
    const hint = modelViewer.parentElement.querySelector('.ar-hint');

    if (!hint) {
        return;
    }

    const dismissHint = () => {
        hint.classList.add('is-dismissed');
        modelViewer.removeEventListener('pointerdown', dismissHint);
        modelViewer.removeEventListener('keydown', dismissHint);
        modelViewer.removeEventListener('camera-change', handleCameraChange);
    };

    const handleCameraChange = event => {
        if (event.detail && event.detail.source === 'user-interaction') {
            dismissHint();
        }
    };

    modelViewer.addEventListener('pointerdown', dismissHint, { once: true });
    modelViewer.addEventListener('keydown', dismissHint, { once: true });
    modelViewer.addEventListener('camera-change', handleCameraChange);
});
