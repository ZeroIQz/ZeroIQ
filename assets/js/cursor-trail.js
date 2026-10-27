/**
 * ZeroIQ Mouse Cursor Trail Animation
 * Based on GitHub Universe grid-snapped cursor trail, tailored to ZeroIQ's Visual Identity.
 * 
 * Visual ID Palette:
 * - Signature Accent (Terracotta / Coral): #da7756 / #c2410c
 * - Cyan: #38bdf8 / #0284c7
 * - Indigo: #6366f1 / #4f46e5
 * - Cyber Green: #22c55e / #16a34a
 * - Cyber Rose / Glitch Pink: #f472b6 / #db2777
 * - Warm Peach Highlight: #f0a882 / #ea580c
 * - Particle Violet: #a855f7 / #7c3aed
 */

(() => {
    if (typeof window === 'undefined') return;
    if (window.cursorTrailAnimationInitialized) return;
    window.cursorTrailAnimationInitialized = true;

    // ZeroIQ brand visual identity palettes
    const darkPalette = [
        "#da7756", // --accent (signature terracotta coral)
        "#38bdf8", // --cyan (electric sky cyan)
        "#6366f1", // --indigo (neon indigo)
        "#22c55e", // --green (cyber emerald)
        "#f472b6", // cyber rose glitch accent
        "#f0a882", // warm peach loader glow
        "#c2410c", // --accent-dark (deep burnt orange)
        "#a855f7", // 3D particle violet
    ];

    const lightPalette = [
        "#c2410c", // light mode --accent (rich burnt terracotta)
        "#0284c7", // light mode deep cyan
        "#4f46e5", // light mode deep indigo
        "#16a34a", // light mode rich green
        "#db2777", // light mode deep rose
        "#ea580c", // light mode warm amber
        "#7c3aed", // light mode deep violet
        "#9a3412", // light mode --accent-dark
    ];

    // ZeroIQ code, cyber & math glyphs
    const texts = ["-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "("];

    class CursorTrailAnimation {
        blockSize = 20;
        blockNum = 26;
        mousePosX = -999;
        mousePosY = -999;
        lastActiveBlockIndex = 0;
        elements = [];

        constructor(areaElement) {
            this.areaElement = areaElement || document.body;
            this.boundHandleMouseMove = this.handleMouseMove.bind(this);
            this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);

            this.createBlocks();
            this.areaElement.addEventListener("mousemove", this.boundHandleMouseMove, { passive: true });
            document.addEventListener("mouseleave", this.boundHandleMouseLeave, { passive: true });
        }

        getColors() {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            return isLight ? lightPalette : darkPalette;
        }

        getTextColor() {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            return isLight ? "#0f172a" : "#050a18";
        }

        createBlocks() {
            const currentColors = this.getColors();
            const textColor = this.getTextColor();

            for (let i = 0; i < this.blockNum; i++) {
                const block = document.createElement("div");
                block.className = "universe-trail-block block";
                block.style.width = this.blockSize + "px";
                block.style.height = this.blockSize + "px";
                block.style.position = "fixed";
                block.style.left = "0px";
                block.style.top = "0px";
                block.style.textAlign = "center";
                block.style.pointerEvents = "none";
                block.style.zIndex = "99999";
                block.style.willChange = "transform";

                const color = document.createElement("div");
                color.className = "universe-trail-color";
                color.style.width = "100%";
                color.style.height = "100%";
                color.style.display = "flex";
                color.style.alignItems = "center";
                color.style.justifyContent = "center";
                color.style.lineHeight = this.blockSize + "px";
                color.style.fontFamily = "'JetBrains Mono', monospace";
                color.style.fontSize = "12px";
                color.style.fontWeight = "800";
                color.style.color = textColor;
                color.style.userSelect = "none";
                color.style.backgroundColor = currentColors[Math.floor(Math.random() * currentColors.length)];
                color.style.transition = "transform 0.1s cubic-bezier(0.3, 0.41, 0.04, 1.01)";
                color.style.transform = "scale(0)";

                block.appendChild(color);
                document.body.appendChild(block);
                this.elements.push({ block, color });
            }
        }

        handleMouseMove(event) {
            if (this.checkPrefersReducedMotion()) {
                return;
            }

            // Snap coordinates to 20px grid
            const x = Math.floor(event.clientX / this.blockSize) * this.blockSize;
            const y = Math.floor(event.clientY / this.blockSize) * this.blockSize;

            if (!this.isSafeTrailPosition(x, y)) {
                return;
            }

            if (x !== this.mousePosX || y !== this.mousePosY) {
                this.lastActiveBlockIndex = (this.lastActiveBlockIndex + 1) % this.blockNum;
                this.mousePosX = x;
                this.mousePosY = y;

                const colors = this.getColors();
                const textColor = this.getTextColor();
                const nextBlock = this.elements[this.lastActiveBlockIndex];

                nextBlock.block.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
                nextBlock.color.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                nextBlock.color.style.color = textColor;
                nextBlock.color.style.transform = "scale(1)";
                nextBlock.color.textContent = Math.random() < 0.28
                    ? " "
                    : texts[Math.floor(Math.random() * texts.length)];

                setTimeout(() => {
                    nextBlock.color.style.transform = "scale(0)";
                }, 100 + 300 * Math.random());
            }
        }

        handleMouseLeave() {
            this.mousePosX = -999;
            this.mousePosY = -999;
        }

        checkPrefersReducedMotion() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        isSafeTrailPosition(x, y) {
            const points = [
                [x, y],
                [x + this.blockSize, y],
                [x, y + this.blockSize],
                [x + this.blockSize, y + this.blockSize],
            ];

            return points.every(([pointX, pointY]) => this.isSafeTrailPoint(pointX, pointY));
        }

        isSafeTrailPoint(x, y) {
            if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
                return false;
            }

            const blockedSelector = 'input, textarea, select, [data-no-trail]';
            if (!document.elementsFromPoint) return true;

            const elements = document.elementsFromPoint(x, y);
            return !elements.some(element => element && element.closest && element.closest(blockedSelector));
        }

        destroy() {
            this.areaElement.removeEventListener("mousemove", this.boundHandleMouseMove);
            document.removeEventListener("mouseleave", this.boundHandleMouseLeave);
            this.elements.forEach(({ block }) => block.remove());
            this.elements = [];
        }
    }

    // Initialize only on desktop / non-reduced motion devices
    function init() {
        const isTouch = ('ontouchstart' in window) && !window.matchMedia('(hover: hover)').matches;
        if (window.innerWidth <= 768 || isTouch) {
            return;
        }

        if (!window.cursorTrailAnimation) {
            window.cursorTrailAnimation = new CursorTrailAnimation(document.body);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
