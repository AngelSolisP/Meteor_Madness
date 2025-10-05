/**
 * Onboarding Controller
 * First-time user tutorial system
 */

const OnboardingController = {
    steps: [
        {
            target: '#btn-catalog',
            title: 'Browse Asteroids',
            content: 'Start by exploring our catalog of 20 near-Earth asteroids with detailed impact data and scientific calculations.',
            position: 'right'
        },
        {
            target: '#map',
            title: 'Interactive Map',
            content: 'Click any marker on the map to see detailed information about that asteroid\'s potential impact location and effects.',
            position: 'center'
        },
        {
            target: '#btn-simulator',
            title: 'Run Simulations',
            content: 'Create custom impact scenarios by adjusting asteroid size, velocity, angle, and composition to see potential outcomes.',
            position: 'right'
        },
        {
            target: '#btn-alert',
            title: 'Learn Response Protocols',
            content: 'Understand the international alert system (IAWN/SMPAG) and learn what to do in case of an asteroid threat.',
            position: 'right'
        }
    ],

    currentStep: 0,
    isActive: false,
    overlay: null,
    spotlight: null,
    tooltip: null,

    /**
     * Initialize onboarding controller
     */
    init() {
        console.log('Initializing onboarding system...');

        // Check if user has completed onboarding
        if (localStorage.getItem('meteor-madness-onboarding-completed')) {
            console.log('Onboarding already completed');
            return;
        }

        // Wait for app to be fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.showWelcome();
            }, 1000);
        });

        console.log('✓ Onboarding system initialized');
    },

    /**
     * Show welcome message
     */
    showWelcome() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay-backdrop active';
        overlay.style.zIndex = 'var(--z-modal)';

        const welcome = document.createElement('div');
        welcome.className = 'card';
        welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: calc(var(--z-modal) + 1);
            max-width: 500px;
            width: 90%;
        `;

        welcome.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">🌠 Welcome to Meteor Madness!</h3>
            </div>
            <div class="card-body">
                <p style="margin: 0 0 var(--space-4) 0; color: var(--color-text-secondary); line-height: var(--leading-relaxed);">
                    Explore asteroid impact scenarios using real NASA data. Would you like a quick tour of the features?
                </p>
            </div>
            <div class="card-footer" style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                <button class="btn btn--secondary" id="onboarding-skip">Skip Tour</button>
                <button class="btn btn--primary" id="onboarding-start">Start Tour</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(welcome);

        document.getElementById('onboarding-start').addEventListener('click', () => {
            overlay.remove();
            welcome.remove();
            this.start();
        });

        document.getElementById('onboarding-skip').addEventListener('click', () => {
            overlay.remove();
            welcome.remove();
            this.complete();
        });
    },

    /**
     * Start the tutorial
     */
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(0);
    },

    /**
     * Show a specific step
     * @param {number} index - Step index
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            return;
        }

        const step = this.steps[index];
        const target = document.querySelector(step.target);

        if (!target) {
            console.warn(`Onboarding target not found: ${step.target}`);
            this.nextStep();
            return;
        }

        // Create overlay
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'onboarding-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: var(--z-modal);
                pointer-events: none;
            `;
            document.body.appendChild(this.overlay);
        }

        // Create spotlight
        const rect = target.getBoundingClientRect();
        if (!this.spotlight) {
            this.spotlight = document.createElement('div');
            this.spotlight.className = 'onboarding-spotlight';
            this.spotlight.style.cssText = `
                position: fixed;
                background: transparent;
                border: 3px solid var(--color-primary);
                border-radius: var(--radius-lg);
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), var(--shadow-glow-primary);
                z-index: calc(var(--z-modal) + 1);
                pointer-events: none;
                transition: all var(--duration-base);
            `;
            document.body.appendChild(this.spotlight);
        }

        this.spotlight.style.top = `${rect.top - 8}px`;
        this.spotlight.style.left = `${rect.left - 8}px`;
        this.spotlight.style.width = `${rect.width + 16}px`;
        this.spotlight.style.height = `${rect.height + 16}px`;

        // Create tooltip
        if (this.tooltip) {
            this.tooltip.remove();
        }

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'card onboarding-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            z-index: calc(var(--z-modal) + 2);
            max-width: 350px;
            width: 90%;
        `;

        this.tooltip.innerHTML = `
            <div class="card-header">
                <h4 class="card-title">${step.title}</h4>
            </div>
            <div class="card-body">
                <p style="margin: 0; color: var(--color-text-secondary); line-height: var(--leading-relaxed);">
                    ${step.content}
                </p>
            </div>
            <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: var(--text-sm); color: var(--color-text-tertiary);">
                    ${index + 1} of ${this.steps.length}
                </span>
                <div style="display: flex; gap: var(--space-2);">
                    ${index > 0 ? '<button class="btn btn--secondary btn--small" id="onboarding-prev">Back</button>' : ''}
                    ${index < this.steps.length - 1 ? '<button class="btn btn--primary btn--small" id="onboarding-next">Next</button>' : ''}
                    ${index === this.steps.length - 1 ? '<button class="btn btn--primary btn--small" id="onboarding-finish">Finish</button>' : ''}
                    <button class="btn btn--ghost btn--small" id="onboarding-close">Skip</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltip);

        // Position tooltip
        this.positionTooltip(rect, step.position);

        // Event listeners
        const nextBtn = this.tooltip.querySelector('#onboarding-next');
        const prevBtn = this.tooltip.querySelector('#onboarding-prev');
        const finishBtn = this.tooltip.querySelector('#onboarding-finish');
        const closeBtn = this.tooltip.querySelector('#onboarding-close');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (finishBtn) finishBtn.addEventListener('click', () => this.complete());
        if (closeBtn) closeBtn.addEventListener('click', () => this.complete());
    },

    /**
     * Position tooltip relative to target
     * @param {DOMRect} targetRect - Target element rect
     * @param {string} position - Preferred position
     */
    positionTooltip(targetRect, position) {
        if (!this.tooltip) return;

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const padding = 20;

        let top, left;

        switch (position) {
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + padding;
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - padding;
                break;
            case 'bottom':
                top = targetRect.bottom + padding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = targetRect.top - tooltipRect.height - padding;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'center':
            default:
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                break;
        }

        // Keep tooltip in viewport
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    },

    /**
     * Next step
     */
    nextStep() {
        this.currentStep++;
        if (this.currentStep < this.steps.length) {
            this.showStep(this.currentStep);
        } else {
            this.complete();
        }
    },

    /**
     * Previous step
     */
    previousStep() {
        this.currentStep--;
        if (this.currentStep >= 0) {
            this.showStep(this.currentStep);
        }
    },

    /**
     * Complete onboarding
     */
    complete() {
        this.isActive = false;
        localStorage.setItem('meteor-madness-onboarding-completed', 'true');

        if (this.overlay) this.overlay.remove();
        if (this.spotlight) this.spotlight.remove();
        if (this.tooltip) this.tooltip.remove();

        this.overlay = null;
        this.spotlight = null;
        this.tooltip = null;

        if (FeedbackController && FeedbackController.success) {
            FeedbackController.success('Tutorial completed! Explore freely. Press ? for help anytime.');
        }
    },

    /**
     * Reset onboarding (for testing)
     */
    reset() {
        localStorage.removeItem('meteor-madness-onboarding-completed');
        console.log('Onboarding reset. Reload the page to see it again.');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        OnboardingController.init();
    });
} else {
    OnboardingController.init();
}

// Expose reset function globally for testing
window.resetOnboarding = () => OnboardingController.reset();
