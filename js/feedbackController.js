/**
 * Feedback Controller
 * Handles user feedback: toasts, loading states, confirmations
 */

const FeedbackController = {
    toastQueue: [],
    maxToasts: 3,
    toastDuration: 4000,

    /**
     * Initialize feedback controller
     */
    init() {
        console.log('Initializing feedback controller...');

        // Ensure toast container exists
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        console.log('✓ Feedback controller initialized');
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (optional)
     */
    showToast(message, type = 'info', duration = null) {
        const toast = this.createToast(message, type);
        const container = document.getElementById('toast-container');

        // Limit number of toasts
        const currentToasts = container.querySelectorAll('.toast');
        if (currentToasts.length >= this.maxToasts) {
            currentToasts[0].remove();
        }

        container.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.add('toast--visible');
        });

        // Auto-dismiss
        const dismissDuration = duration || this.toastDuration;
        setTimeout(() => {
            this.dismissToast(toast);
        }, dismissDuration);

        return toast;
    },

    /**
     * Create toast element
     * @param {string} message - Message text
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icon = this.getIcon(type);

        toast.innerHTML = `
            ${icon}
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismissToast(toast);
        });

        return toast;
    },

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    dismissToast(toast) {
        toast.classList.remove('toast--visible');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    /**
     * Get icon SVG for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    getIcon(type) {
        const icons = {
            success: '<span class="toast-icon">✓</span>',
            error: '<span class="toast-icon">✕</span>',
            warning: '<span class="toast-icon">⚠</span>',
            info: '<span class="toast-icon">ℹ</span>'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show loading overlay
     * @param {string} message - Loading message (optional)
     */
    showLoading(message = 'Loading...') {
        let loading = document.getElementById('loading');

        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loading';
            loading.className = 'loading-overlay';
            loading.innerHTML = `
                <div class="spinner spinner--large"></div>
                <p class="loading-message">${message}</p>
            `;
            document.body.appendChild(loading);
        } else {
            const messageEl = loading.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }

        loading.classList.add('is-visible');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('is-visible');
        }
    },

    /**
     * Show success message
     * @param {string} message - Success message
     */
    success(message) {
        this.showToast(message, 'success');
    },

    /**
     * Show error message
     * @param {string} message - Error message
     */
    error(message) {
        this.showToast(message, 'error', 5000);
    },

    /**
     * Show warning message
     * @param {string} message - Warning message
     */
    warning(message) {
        this.showToast(message, 'warning');
    },

    /**
     * Show info message
     * @param {string} message - Info message
     */
    info(message) {
        this.showToast(message, 'info');
    },

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback on confirm
     * @param {Function} onCancel - Callback on cancel (optional)
     */
    confirm(message, onConfirm, onCancel) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay-backdrop active';

        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'card';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: var(--z-modal);
            max-width: 400px;
            width: 90%;
        `;

        dialog.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Confirm Action</h3>
            </div>
            <div class="card-body">
                <p style="margin: 0; color: var(--color-text-secondary);">${message}</p>
            </div>
            <div class="card-footer" style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                <button class="btn btn--secondary" id="confirm-cancel">Cancel</button>
                <button class="btn btn--primary" id="confirm-ok">Confirm</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // Handle confirm
        dialog.querySelector('#confirm-ok').addEventListener('click', () => {
            overlay.remove();
            dialog.remove();
            if (onConfirm) onConfirm();
        });

        // Handle cancel
        const handleCancel = () => {
            overlay.remove();
            dialog.remove();
            if (onCancel) onCancel();
        };

        dialog.querySelector('#confirm-cancel').addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleCancel);
    },

    /**
     * Update hazardous count in sidebar
     * @param {number} hazardousCount - Number of hazardous asteroids
     */
    updateHazardousCount(hazardousCount) {
        const countElement = document.getElementById('hazardous-count');
        if (countElement) {
            countElement.textContent = hazardousCount;
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        FeedbackController.init();
    });
} else {
    FeedbackController.init();
}
