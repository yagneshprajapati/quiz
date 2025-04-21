class IntegratedEffects {
    constructor() {
        // Initialize core properties
        this.mouse = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.trail = [];
        this.trailLength = 20;
        
        // Background properties
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.gridSize = 30;
        this.dotRadius = 2;
        this.distanceThreshold = 100;
        
        // Cursor properties
        this.cursor = document.createElement('div');
        this.cursorDot = document.createElement('div');
        this.cursorRing = document.createElement('div');
        this.magneticForce = { x: 0, y: 0 };
        
        // Initialize everything
        this.initStyles();
        this.initCursor();
        this.initBackground();
        this.initEventListeners();
        
        // Start animation loops
        this.animate();
    }

    initStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                cursor: none !important;
            }

            canvas.dot-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                background-color: black;
            }

            .custom-cursor {
                width: 40px;
                height: 40px;
                border: 2px solid rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 9999;
                backdrop-filter: invert(1);
                transform: translate(-50%, -50%);
            }

            .cursor-dot {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .cursor-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .trail-dot {
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transition: opacity 0.5s;
            }

            .custom-cursor.active {
                transform: translate(-50%, -50%) scale(1.5);
                border-color: var(--accent, #6b7fff);
            }

            .custom-cursor.active .cursor-dot {
                transform: translate(-50%, -50%) scale(0.5);
                background-color: var(--accent, #6b7fff);
            }

            .custom-cursor.active .cursor-ring {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
                border-color: var(--accent, #6b7fff);
            }

            .custom-cursor.magnetic {
                transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .custom-cursor.magnetic .cursor-dot {
                transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
            }
        `;
        document.head.appendChild(style);
    }

    initCursor() {
        this.cursor.className = 'custom-cursor';
        this.cursorDot.className = 'cursor-dot';
        this.cursorRing.className = 'cursor-ring';
        this.cursor.appendChild(this.cursorDot);
        this.cursor.appendChild(this.cursorRing);
        document.body.appendChild(this.cursor);

        // Create initial trail dots
        for (let i = 0; i < this.trailLength; i++) {
            const trailDot = document.createElement('div');
            trailDot.className = 'trail-dot';
            document.body.appendChild(trailDot);
            this.trail.push({
                element: trailDot,
                x: 0,
                y: 0,
                alpha: 1 - (i / this.trailLength)
            });
        }
    }

    initBackground() {
        this.canvas.classList.add('dot-background');
        document.body.appendChild(this.canvas);
        this.handleResize();
        this.createDots();
    }

    initEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Cursor interactions
        document.addEventListener('mousedown', () => this.cursorDown());
        document.addEventListener('mouseup', () => this.cursorUp());
        
        // Enhanced button interactions
        const interactiveElements = document.querySelectorAll('button, a, input, .btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursorHover(el));
            el.addEventListener('mouseleave', () => this.cursorUnhover());
            el.addEventListener('mousemove', (e) => this.handleMagneticEffect(e, el));
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createDots();
    }

    createDots() {
        this.dots = [];
        const cols = Math.floor(this.canvas.width / this.gridSize);
        const rows = Math.floor(this.canvas.height / this.gridSize);
        
        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                this.dots.push({
                    x: i * this.gridSize,
                    y: j * this.gridSize,
                    baseX: i * this.gridSize,
                    baseY: j * this.gridSize,
                    velocity: { x: 0, y: 0 }
                });
            }
        }
    }

    handleMagneticEffect(e, element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);
        
        // Calculate distance from cursor to button center
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Apply magnetic effect if cursor is close enough
        if (distance < 100) {
            const strength = (100 - distance) / 100;
            this.magneticForce = {
                x: distanceX * strength * 0.3,
                y: distanceY * strength * 0.3
            };
            this.cursor.classList.add('magnetic');
        } else {
            this.magneticForce = { x: 0, y: 0 };
            this.cursor.classList.remove('magnetic');
        }
    }

    // Cursor methods
    cursorDown() {
        this.cursor.classList.add('active');
        this.distanceThreshold = 150;
        this.cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }

    cursorUp() {
        this.cursor.classList.remove('active');
        this.distanceThreshold = 100;
        this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    cursorHover(element) {
        this.cursor.classList.add('active');
        // Get accent color from button if available
        const computedStyle = window.getComputedStyle(element);
        const accentColor = computedStyle.borderColor || computedStyle.color;
        this.cursor.style.setProperty('--accent', accentColor);
    }

    cursorUnhover() {
        this.cursor.classList.remove('active');
        this.cursor.style.removeProperty('--accent');
        this.magneticForce = { x: 0, y: 0 };
    }

    // Animation methods
    animate() {
        this.updateCursor();
        this.updateDots();
        requestAnimationFrame(() => this.animate());
    }

    updateCursor() {
        // Smooth cursor movement with lerp
        this.currentPos.x += (this.mouse.x - this.currentPos.x) * 0.15;
        this.currentPos.y += (this.mouse.y - this.currentPos.y) * 0.15;
        
        // Apply magnetic force
        const finalX = this.currentPos.x + this.magneticForce.x;
        const finalY = this.currentPos.y + this.magneticForce.y;
        
        this.cursor.style.left = `${finalX}px`;
        this.cursor.style.top = `${finalY}px`;

        // Update trail
        this.trail.forEach((dot, index) => {
            const nextDot = this.trail[index + 1] || { x: this.currentPos.x, y: this.currentPos.y };
            dot.x += (nextDot.x - dot.x) * 0.3;
            dot.y += (nextDot.y - dot.y) * 0.3;
            
            dot.element.style.left = `${dot.x}px`;
            dot.element.style.top = `${dot.y}px`;
            dot.element.style.opacity = dot.alpha;
        });
    }

    updateDots() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.dots.forEach(dot => {
            const dx = this.currentPos.x - dot.x;
            const dy = this.currentPos.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.distanceThreshold) {
                const force = (this.distanceThreshold - distance) / this.distanceThreshold;
                const angle = Math.atan2(dy, dx);
                const pushX = Math.cos(angle) * force * 20;
                const pushY = Math.sin(angle) * force * 20;
                
                // Enhanced interaction when cursor is active
                const multiplier = this.cursor.classList.contains('active') ? 2 : 1;
                
                dot.velocity.x -= pushX * multiplier;
                dot.velocity.y -= pushY * multiplier;
            }
            
            // Return to original position
            dot.velocity.x += (dot.baseX - dot.x) * 0.1;
            dot.velocity.y += (dot.baseY - dot.y) * 0.1;
            
            // Apply velocity with damping
            dot.velocity.x *= 0.89;
            dot.velocity.y *= 0.89;
            dot.x += dot.velocity.x;
            dot.y += dot.velocity.y;
            
            // Draw dot with size variation based on velocity
            const speed = Math.sqrt(dot.velocity.x * dot.velocity.x + dot.velocity.y * dot.velocity.y);
            const dynamicRadius = this.dotRadius + speed * 0.2;
            
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dynamicRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
        });
    }
}

// Initialize effects
const effects = new IntegratedEffects();