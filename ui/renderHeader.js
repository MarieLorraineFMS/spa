/* global window */

/**
 * Maj navbar (dot panier & auth label).
 * @param {object} app
 * @param {object} [options]
 * @param {Function} [options.onRerender] - callback pour rerender l'app
 */
export const renderHeader = (app, { onRerender = () => { } } = {}) => {
    const dot = document.querySelector("#cart-dot");
    const authBtn = document.querySelector("#auth-btn");
    const authText = document.querySelector("#auth-text");

    if (!(authBtn instanceof HTMLElement)) {
        throw new Error("renderHeader: bouton auth introuvable");
    }

    // Dot panier
    if (dot) {
        const hasItems = app.cart.getTotalItems() > 0;
        dot.classList.toggle("d-none", !hasItems);
    }

    // Auth button label
    if (authText) {
        authText.textContent = app.uiState.isAuthenticated ? "Se déconnecter" : "Se connecter";
    }

    // Auth click
    authBtn.onclick = () => {
        app.uiState.isAuthenticated = !app.uiState.isAuthenticated;
        app.uiState.clientPage = "home";

        // On demande à l'app de rerender
        onRerender();
    };
};
