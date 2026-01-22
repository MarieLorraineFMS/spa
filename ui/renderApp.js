import { renderCategories } from "./renderCategories.js";
import { renderProducts } from "./renderProducts.js";
import { renderCart } from "./renderCart.js";
import { renderAdminPage } from "./renderAdminPage.js";
import { renderHome } from "./renderHome.js";
import { renderHeader } from "./renderHeader.js";

/**
 * Render racine : CLIENT ou ADMIN selon app.uiState.mode
 * Navigation client (home / boutique / panier).
 *
 * @param {object} app
 */
export const renderApp = (app) => {
    ////////////////////////////////// UI STATE ////////////////////////////////
    app.uiState = app.uiState || {};

    // mode : client | admin
    app.uiState.mode = app.uiState.mode || "client";

    // auth
    app.uiState.isAuthenticated = Boolean(app.uiState.isAuthenticated);
    console.log('isAuthenticated', app.uiState.isAuthenticated)

    // page client : home | boutique | panier
    app.uiState.clientPage = app.uiState.clientPage || "home";

    ////////////////////////////////// DOM ////////////////////////////////
    const clientRoot = document.querySelector("#client");
    const adminRoot = document.querySelector("#admin");

    if (!(clientRoot instanceof HTMLElement)) throw new Error("renderApp: #client introuvable");
    if (!(adminRoot instanceof HTMLElement)) throw new Error("renderApp: #admin introuvable");

    const clientHome = document.querySelector("#client-home");
    const clientBoutique = document.querySelector("#client-boutique");
    const clientPanier = document.querySelector("#client-panier");

    if (!(clientBoutique instanceof HTMLElement)) throw new Error("renderApp: #client-boutique introuvable");
    if (!(clientPanier instanceof HTMLElement)) throw new Error("renderApp: #client-panier introuvable");
    const hasHome = clientHome instanceof HTMLElement;

    ////////////////////////////////// HEADER ////////////////////////////////
    renderHeader(app, { onRerender: () => renderApp(app) });
    ;

    ////////////////////////////////// HELPERS ////////////////////////////////
    const showClientPage = (page) => {
        if (hasHome) clientHome.classList.toggle("d-none", page !== "home");
        clientBoutique.classList.toggle("d-none", page !== "boutique");
        clientPanier.classList.toggle("d-none", page !== "panier");
    };

    //////////////////////////////////
    // MODE ADMIN
    //////////////////////////////////
    if (app.uiState.mode === "admin") {
        clientRoot.classList.add("d-none");
        adminRoot.classList.remove("d-none");

        renderAdminPage(app, { containerSelector: "#admin" });

        bindNav(app);
        return;
    }

    //////////////////////////////////
    // MODE CLIENT
    //////////////////////////////////
    adminRoot.classList.add("d-none");
    clientRoot.classList.remove("d-none");

    // HOME
    if (app.uiState.clientPage === "home") {
        showClientPage("home");
        if (hasHome) renderHome(app, { containerSelector: "#client-home" });
        bindNav(app);
        return;
    }

    // PANIER
    if (app.uiState.clientPage === "panier") {
        showClientPage("panier");

        renderCart(app, {
            containerSelector: "#cart",
            onOrderPlaced: () => {
                // Après commande validée : retour boutique
                app.uiState.clientPage = "boutique";
                renderApp(app);
            },
        });

        bindNav(app);
        return;
    }

    // BOUTIQUE
    showClientPage("boutique");

    renderCategories(app, {
        containerSelector: "#categories",
        onCategorySelected: () => {
            renderProducts(app, {
                containerSelector: "#products",
                paginationSelector: "#pagination",
                onCartChanged: () => {
                    app.persistAll();
                    renderHeader(app, { onRerender: () => renderApp(app) });
                    ; // maj dot panier
                },
            });
        },
    });

    renderProducts(app, {
        containerSelector: "#products",
        paginationSelector: "#pagination",
        onCartChanged: () => {
            app.persistAll();
            renderHeader(app, { onRerender: () => renderApp(app) });
            ;
        },
    });

    bindNav(app);
};

/**
 * Branche la navigation en onclick
 * - data-client-page="home|boutique|panier"
 * - data-nav="admin"
 *
 * @param {object} app
 */
const bindNav = (app) => {
    // Client
    document.querySelectorAll("[data-client-page]").forEach((el) => {
        if (!(el instanceof HTMLElement)) return;

        el.onclick = () => {
            const page = el.getAttribute("data-client-page");
            if (!page) return;

            app.uiState.mode = "client";
            app.uiState.clientPage = page;
            renderApp(app);
        };
    });

    // Admin
    const navAdmin = document.querySelector('[data-nav="admin"]');
    if (navAdmin instanceof HTMLElement) {
        navAdmin.onclick = () => {
            app.uiState.mode = "admin";
            renderApp(app);
        };
    }
};

