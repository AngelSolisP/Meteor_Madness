/**
 * State Manager Module
 * Centralized UI state management for Meteor Madness
 * Enforces mutual exclusivity between panels and modals
 */

// Global UI State
const UIState = {
    currentMode: 'normal',      // 'normal' | 'simulator' | 'viewing-asteroid'
    activePanel: null,          // 'info' | 'simulator' | null
    activeModal: null,          // 'catalog' | 'comparison' | 'alert' | null
    previousFocus: null         // Store focus for restoration
};

// State change listeners
const stateListeners = [];

/**
 * Centralized UI State Manager
 */
const UIStateManager = {
    /**
     * Initialize the state manager
     */
    init() {
        console.log('Initializing UIStateManager...');

        // Set up global keyboard handlers
        this.setupKeyboardHandlers();

        console.log('✓ UIStateManager initialized');
    },

    /**
     * Get current UI state
     * @returns {Object} Copy of current state
     */
    getState() {
        return { ...UIState };
    },

    /**
     * Set application mode
     * @param {string} mode - 'normal' | 'simulator' | 'viewing-asteroid'
     */
    setMode(mode) {
        const validModes = ['normal', 'simulator', 'viewing-asteroid'];
        if (!validModes.includes(mode)) {
            console.warn(`Invalid mode: ${mode}`);
            return;
        }

        const previousMode = UIState.currentMode;
        UIState.currentMode = mode;

        // Update body class for CSS targeting
        document.body.classList.remove('normal-mode', 'simulator-mode', 'viewing-asteroid-mode');
        document.body.classList.add(`${mode}-mode`);

        // Update mode indicator in header
        this.updateModeIndicator(mode);

        console.log(`Mode changed: ${previousMode} → ${mode}`);
        this.notifyListeners('mode', { previous: previousMode, current: mode });
    },

    /**
     * Update mode indicator in header
     * @param {string} mode - Current mode
     */
    updateModeIndicator(mode) {
        const indicator = document.getElementById('mode-indicator');
        if (!indicator) return;

        const iconEl = indicator.querySelector('.mode-icon');
        const labelEl = indicator.querySelector('.mode-label');

        const modes = {
            'normal': { icon: '🌍', label: 'Normal Mode' },
            'simulator': { icon: '🎯', label: 'Simulator Mode' },
            'viewing-asteroid': { icon: '☄️', label: 'Viewing Asteroid' }
        };

        const modeData = modes[mode] || modes['normal'];

        if (iconEl) iconEl.textContent = modeData.icon;
        if (labelEl) labelEl.textContent = modeData.label;
    },

    /**
     * Open a panel (enforces mutual exclusivity)
     * @param {string} panelName - 'info' | 'simulator'
     */
    openPanel(panelName) {
        const validPanels = ['info', 'simulator'];
        if (!validPanels.includes(panelName)) {
            console.warn(`Invalid panel: ${panelName}`);
            return;
        }

        console.log(`Opening panel: ${panelName}`);

        // Close other panel if open
        if (UIState.activePanel && UIState.activePanel !== panelName) {
            this.closePanel(UIState.activePanel);
        }

        // Close all modals first
        this.closeAllModals();

        // Update state
        UIState.activePanel = panelName;

        // Show appropriate backdrop
        this.showBackdrop('panel');

        // Update mode based on panel
        if (panelName === 'info') {
            this.setMode('viewing-asteroid');
        } else if (panelName === 'simulator') {
            this.setMode('simulator');
        }

        this.notifyListeners('panelOpen', { panel: panelName });
    },

    /**
     * Close a specific panel
     * @param {string} panelName - 'info' | 'simulator'
     */
    closePanel(panelName) {
        if (UIState.activePanel !== panelName) {
            return;
        }

        console.log(`Closing panel: ${panelName}`);

        UIState.activePanel = null;

        // Hide backdrop if no other overlays
        if (!UIState.activeModal) {
            this.hideBackdrop();
        }

        // Reset mode to normal
        this.setMode('normal');

        this.notifyListeners('panelClose', { panel: panelName });
    },

    /**
     * Close all panels
     */
    closeAllPanels() {
        if (UIState.activePanel) {
            const panel = UIState.activePanel;
            UIState.activePanel = null;

            // Hide backdrop if no modals
            if (!UIState.activeModal) {
                this.hideBackdrop();
            }

            this.setMode('normal');
            this.notifyListeners('panelClose', { panel });
        }
    },

    /**
     * Open a modal (enforces mutual exclusivity)
     * @param {string} modalName - 'catalog' | 'comparison' | 'alert'
     */
    openModal(modalName) {
        const validModals = ['catalog', 'comparison', 'alert'];
        if (!validModals.includes(modalName)) {
            console.warn(`Invalid modal: ${modalName}`);
            return;
        }

        console.log(`Opening modal: ${modalName}`);

        // Close all panels first
        this.closeAllPanels();

        // Close other modals
        if (UIState.activeModal && UIState.activeModal !== modalName) {
            this.closeModal(UIState.activeModal);
        }

        // Update state
        UIState.activeModal = modalName;

        // Show backdrop
        this.showBackdrop('modal');

        // Save current focus for restoration
        UIState.previousFocus = document.activeElement;

        this.notifyListeners('modalOpen', { modal: modalName });
    },

    /**
     * Close a specific modal
     * @param {string} modalName - 'catalog' | 'comparison' | 'alert'
     */
    closeModal(modalName) {
        if (UIState.activeModal !== modalName) {
            return;
        }

        console.log(`Closing modal: ${modalName}`);

        UIState.activeModal = null;

        // Hide backdrop
        this.hideBackdrop();

        // Restore focus
        if (UIState.previousFocus && UIState.previousFocus.focus) {
            UIState.previousFocus.focus();
            UIState.previousFocus = null;
        }

        this.notifyListeners('modalClose', { modal: modalName });
    },

    /**
     * Close all modals
     */
    closeAllModals() {
        if (UIState.activeModal) {
            const modal = UIState.activeModal;
            UIState.activeModal = null;
            this.hideBackdrop();

            // Restore focus
            if (UIState.previousFocus && UIState.previousFocus.focus) {
                UIState.previousFocus.focus();
                UIState.previousFocus = null;
            }

            this.notifyListeners('modalClose', { modal });
        }
    },

    /**
     * Show backdrop with appropriate styling
     * @param {string} type - 'modal' | 'panel'
     */
    showBackdrop(type = 'modal') {
        let backdrop = document.getElementById('shared-backdrop');

        if (!backdrop) {
            console.warn('Shared backdrop not found in DOM');
            return;
        }

        backdrop.dataset.type = type;
        backdrop.classList.add('active');
    },

    /**
     * Hide the shared backdrop
     */
    hideBackdrop() {
        const backdrop = document.getElementById('shared-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            backdrop.dataset.type = '';
        }
    },

    /**
     * Set up global keyboard handlers (ESC key)
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    },

    /**
     * Handle ESC key - close topmost overlay
     */
    handleEscapeKey() {
        // Priority: modals first, then panels
        if (UIState.activeModal) {
            this.closeModal(UIState.activeModal);
        } else if (UIState.activePanel) {
            this.closePanel(UIState.activePanel);
        }
    },

    /**
     * Trap focus within an element
     * @param {HTMLElement} element - Element to trap focus in
     */
    trapFocus(element) {
        if (!element) return;

        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);

        // Focus first element
        setTimeout(() => firstElement.focus(), 100);

        // Return cleanup function
        return () => {
            element.removeEventListener('keydown', handleTabKey);
        };
    },

    /**
     * Add state change listener
     * @param {Function} callback - Callback function (event, data)
     */
    addListener(callback) {
        stateListeners.push(callback);
    },

    /**
     * Remove state change listener
     * @param {Function} callback - Callback to remove
     */
    removeListener(callback) {
        const index = stateListeners.indexOf(callback);
        if (index > -1) {
            stateListeners.splice(index, 1);
        }
    },

    /**
     * Notify all listeners of state change
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    notifyListeners(event, data) {
        stateListeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }
};

/**
 * Initialize state manager when this script loads
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UIStateManager.init();
    });
} else {
    UIStateManager.init();
}
