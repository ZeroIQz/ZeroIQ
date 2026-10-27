/**
 * GitHub Universe Mouse Cursor Trail Animation
 * Replicated from https://reg.githubuniverse.com/flow/github/universe26/attendee-registration/login
 * 
 * Features:
 * - 20px grid-snapped colorful square tiles tracking mouse position
 * - GitHub Universe brand color palette (#ae85ff, #f73678, #c05200, #583af7, #5fed83, #bba00a)
 * - Dynamic ASCII/code characters ("-", "/", ")", ".", "+", "=", ">", "<", "*", "&", "(")
 * - Snappy cubic-bezier spring scale animation (scale(0) -> scale(1) -> scale(0))
 * - High-performance pooled recycling ring buffer with zero per-frame DOM allocations
 * - Fully non-blocking (pointer-events: none, high z-index)
 * - Automatically respects prefers-reduced-motion and touch-only devices
 */

(() => {
    if (typeof window === 'undefined') return;
    if (window.cursorTrailAnimationInitialized) return;
    window.cursorTrailAnimationInitialized = true;

    // GitHub Universe authentic color palette
    const colors = [
        "#ae85ff", // Purple / Lavender
        "#f73678", // Hot Pink / Magenta
        "#c05200", // Warm Terracotta / Orange
        "#583af7", // Electric Indigo / Royal Blue
        "#5fed83", // Neon Bright Green
        "#bba00a", // Golden Amber / Olive
    ];

    // GitHub Universe code & syntax characters
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

        createBlocks() {
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
                color.style.fontFamily = "'JetBrains Mono', 'Space Grotesk', monospace, sans-serif";
                color.style.fontSize = "12px";
                color.style.fontWeight = "700";
                color.style.color = "rgba(24, 24, 27, 0.88)";
                color.style.userSelect = "none";
                color.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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

                const nextBlock = this.elements[this.lastActiveBlockIndex];
                nextBlock.block.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
                nextBlock.color.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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
