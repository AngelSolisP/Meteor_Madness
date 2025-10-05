/**
 * Keyboard Controller
 * Implements keyboard shortcuts for power users
 */

const KeyboardController = {
    shortcuts: {},
    helpModalOpen: false,

    /**
     * Initialize keyboard controller
     */
    init() {
        console.log('Initializing keyboard shortcuts...');

        // Define shortcuts
        this.shortcuts = {
            'c': {
                action: () => document.getElementById('btn-catalog')?.click(),
                description: 'Open Asteroid Catalog'
            },
            's': {
                action: () => document.getElementById('btn-simulator')?.click(),
                description: 'Launch Simulator'
            },
            'a': {
                action: () => document.getElementById('btn-alert')?.click(),
                description: 'Open Alert System'
            },
            'h': {
                action: () => document.getElementById('toggle-hazardous')?.click(),
                description: 'Toggle Hazardous Filter'
            },
            'm': {
                action: () => this.toggleMobileMenu(),
                description: 'Toggle Mobile Menu'
            },
            '?': {
                action: () => this.showHelp(),
                description: 'Show Help & Shortcuts'
            },
            'Escape': {
                action: () => {
                    // Already handled by StateManager
                    // This is just for documentation
                },
                description: 'Close Active Overlay'
            }
        };

        // Set up event listener
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Set up help button
        const helpBtn = document.getElementById('btn-help');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        console.log('✓ Keyboard shortcuts initialized');
    },

    /**
     * Handle key press events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyPress(e) {
        // Don't trigger if user is typing in an input
        if (e.target.matches('input, textarea, select')) {
            return;
        }

        // Don't trigger if modal is open (except ESC)
        if (e.key !== 'Escape' && this.helpModalOpen) {
            return;
        }

        const shortcut = this.shortcuts[e.key];
        if (shortcut && shortcut.action) {
            e.preventDefault();
            shortcut.action();
        }
    },

    /**
     * Toggle mobile menu (for responsive design)
     */
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('is-open');
        }
    },

    /**
     * Show help modal with keyboard shortcuts
     */
    showHelp() {
        // Close if already open
        if (this.helpModalOpen) {
            this.closeHelp();
            return;
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.className = 'overlay-backdrop active';

        // Create help modal
        const modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'card';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: var(--z-modal);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // Build shortcuts list
        const shortcutsList = Object.entries(this.shortcuts)
            .filter(([key, data]) => data.description)
            .map(([key, data]) => `
                <div style="display: flex; justify-content: space-between; padding: var(--space-3); border-bottom: 1px solid var(--color-border-subtle);">
                    <span style="color: var(--color-text-secondary);">${data.description}</span>
                    <kbd style="padding: var(--space-1) var(--space-3); background: var(--color-bg-elevated-3); border: 1px solid var(--color-border-default); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-primary);">${this.formatKey(key)}</kbd>
                </div>
            `)
            .join('');

        modal.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">⌨️ Keyboard Shortcuts & Help</h3>
            </div>
            <div class="card-body">
                <h4 style="margin: 0 0 var(--space-4) 0; color: var(--color-text-primary); font-size: var(--text-lg);">Quick Navigation</h4>
                ${shortcutsList}

                <h4 style="margin: var(--space-6) 0 var(--space-4) 0; color: var(--color-text-primary); font-size: var(--text-lg);">About Meteor Madness</h4>
                <p style="color: var(--color-text-secondary); line-height: var(--leading-relaxed);">
                    Interactive web application for visualizing asteroid impact scenarios using real NASA NEO (Near-Earth Object) data.
                    Explore 20 asteroids with detailed impact calculations, run custom simulations, and learn about emergency response protocols.
                </p>

                <h4 style="margin: var(--space-6) 0 var(--space-4) 0; color: var(--color-text-primary); font-size: var(--text-lg);">Features</h4>
                <ul style="color: var(--color-text-secondary); line-height: var(--leading-relaxed); padding-left: var(--space-6);">
                    <li>Interactive map with impact locations</li>
                    <li>Detailed impact effect calculations</li>
                    <li>Custom impact simulator</li>
                    <li>Alert system education</li>
                    <li>Comprehensive asteroid catalog</li>
                </ul>

                <h4 style="margin: var(--space-6) 0 var(--space-4) 0; color: var(--color-text-primary); font-size: var(--text-lg);">Data Sources</h4>
                <p style="color: var(--color-text-secondary); line-height: var(--leading-relaxed);">
                    <strong>NASA NEO API</strong> - Near-Earth Object data<br>
                    <strong>USGS</strong> - Impact effect formulas<br>
                    <strong>IAWN/SMPAG</strong> - Alert protocols
                </p>
            </div>
            <div class="card-footer" style="display: flex; justify-content: flex-end;">
                <button class="btn btn--primary" id="help-close">Close</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        this.helpModalOpen = true;

        // Close handlers
        const closeBtn = modal.querySelector('#help-close');
        closeBtn.addEventListener('click', () => this.closeHelp());
        overlay.addEventListener('click', () => this.closeHelp());

        // ESC key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeHelp();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Store handler for cleanup
        modal._escapeHandler = escapeHandler;
    },

    /**
     * Close help modal
     */
    closeHelp() {
        const overlay = document.getElementById('help-overlay');
        const modal = document.getElementById('help-modal');

        if (modal && modal._escapeHandler) {
            document.removeEventListener('keydown', modal._escapeHandler);
        }

        if (overlay) overlay.remove();
        if (modal) modal.remove();

        this.helpModalOpen = false;
    },

    /**
     * Format key name for display
     * @param {string} key - Key name
     * @returns {string} Formatted key
     */
    formatKey(key) {
        const keyNames = {
            'Escape': 'ESC',
            '?': '?'
        };

        return keyNames[key] || key.toUpperCase();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        KeyboardController.init();
    });
} else {
    KeyboardController.init();
}
