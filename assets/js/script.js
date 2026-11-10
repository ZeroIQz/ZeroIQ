// Global micro-interactions & utility script for X-Stein Portfolio

document.addEventListener('DOMContentLoaded', () => {
    // Add click micro-interaction for action buttons
    document.querySelectorAll('.btn-primary, .btn-ghost, .action-btn, .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.96)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    });

    // Handle Telegram WebApp expanded mode if inside Telegram
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
    }

    // Optional keyboard shortcut to replay Swarm Rebuild (Alt + Shift + S)
    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            if (window.__swarmRebuild) {
                window.__swarmRebuild.toggle();
            }
        }
    });
});
