/**
 * Navbar :
 * - Non connecté : logo & "Boutique" & bouton "S’inscrire/Se connecter"
 * - Connecté/client : home & boutique & panier & "admin mode" & se déconnecter
 * - Connecté/Admin : "admin mode" & se déconnecter & boutique
 *
 * @param {object} app
 * @param {object} [options]
 * @param {Function} [options.onRerender]
 */
export const renderHeader = (app, { onRerender = () => { } } = {}) => {
    const left = document.querySelector("#nav-left");
    const right = document.querySelector("#nav-right");

    if (!(left instanceof HTMLElement)) throw new Error("renderHeader: #nav-left introuvable");
    if (!(right instanceof HTMLElement)) throw new Error("renderHeader: #nav-right introuvable");

    app.uiState = app.uiState || {};
    const ui = app.uiState;

    ui.isAuthenticated = Boolean(ui.isAuthenticated);
    ui.mode = ui.mode || "client";
    ui.clientPage = ui.clientPage || "home";

    const isAuth = ui.isAuthenticated;
    const isAdmin = ui.mode === "admin";
    const onHome = ui.clientPage === "home";

    // Icone/bouton
    const iconBtn = ({ attrs, src, label, extraClass = "", extraStyle = "", iconSize = "" }) => `
    <button type="button"
            class="btn btn-sm btn-outline-secondary btn-icon ${extraClass}"
            ${attrs}
            style=${extraStyle}
            aria-label="${label}">
      <img src="${src}" alt="" style="width:${iconSize}; height:${iconSize};"/>
    </button>
  `;

    // Bouton textuel
    const textBtn = ({ attrs, text, tone = "secondary" }) => `
    <button type="button"
            class="btn btn-sm btn-outline-${tone}"
            ${attrs}>
      ${text}
    </button>
  `;

    /////////////////////// ZONE GAUCHE /////////////////////
    // Non-auth : logo & "Boutique"
    // Auth : logo & home icon si !home & !admin
    left.innerHTML = `
    <span >  <img src="/assets/nav/logo.png" alt="" style="width:70px; height:70px;"/></span>
    ${!isAuth
            ? iconBtn({ attrs: 'data-client-page="boutique"', src: "./assets/nav/shop.png", label: "Boutique" })
            : (!onHome && !isAdmin
                ? iconBtn({ attrs: 'data-client-page="home"', src: "./assets/nav/home.png", label: "Accueil" })
                : "")
        }
  `;

    /////////////////////// ZONE DROITE /////////////////////
    // Non-auth : bouton S'inscrire/Se connecter
    if (!isAuth) {
        right.innerHTML = `
      ${textBtn({ attrs: 'data-action="signup"', text: "S’inscrire" })}
      ${textBtn({ attrs: 'data-action="signup"', text: "Se connecter" })}
    `;
        bindHeaderClicks(app, { onRerender });
        return;
    }

    // Admin : "mode admin" & logout & boutique
    if (isAdmin) {
        right.innerHTML = `
      ${onHome ? iconBtn({ attrs: 'data-client-page="boutique"', src: "./assets/nav/shop.png", label: "Retour boutique" }) : ""}
      ${iconBtn({ attrs: 'data-action="noop"', src: "./assets/nav/user.png", label: "Admin", extraClass: "btn-outline-warning" })}
      ${textBtn({ attrs: 'data-action="logout"', text: "Se déconnecter" })}
    `;
        bindHeaderClicks(app, { onRerender });
        return;
    }

    // Client connecté : boutique & panier & user & logout
    const hasItems = app.cart.getTotalItems() > 0;

    right.innerHTML = `
    ${iconBtn({ attrs: 'data-client-page="boutique"', src: "./assets/nav/shop.png", label: "Boutique" })}

    <button type="button"
            class="btn btn-sm btn-outline-secondary btn-icon position-relative"
            data-client-page="panier"
            aria-label="Panier">
      <img src="./assets/nav/cart.png" alt="" />
      <span id="cart-dot"
      style="top:10px; left:80%;"
            class="position-absolute translate-middle p-1 bg-danger border border-dark rounded-circle ${hasItems ? "" : "d-none"}"></span>
    </button>

    ${iconBtn({ attrs: 'data-action="to-admin"', src: "./assets/nav/user.png", label: "Admin", extraClass: "btn-outline-warning" })}

    ${textBtn({ attrs: 'data-action="logout"', text: "Se déconnecter" })}
  `;

    bindHeaderClicks(app, { onRerender });
};

// Un seul handler pour gérer les clicks
const bindHeaderClicks = (app, { onRerender }) => {
    const header = document.querySelector("header");
    if (!(header instanceof HTMLElement)) return;

    header.onclick = (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;

        // Navigation pages client
        const pageBtn = target.closest("[data-client-page]");
        if (pageBtn) {
            const page = pageBtn.getAttribute("data-client-page");
            if (!page) return;

            app.uiState.mode = "client";
            app.uiState.clientPage = page;
            onRerender();
            return;
        }

        // Actions
        const actionBtn = target.closest("[data-action]");
        if (!actionBtn) return;

        const action = actionBtn.getAttribute("data-action");

        if (action === "signup") {
            app.uiState.isAuthenticated = true;
            app.uiState.mode = "client";
            app.uiState.clientPage = "home";
            onRerender();
            return;
        }

        if (action === "logout") {
            app.uiState.isAuthenticated = false;
            app.uiState.mode = "client";
            app.uiState.clientPage = "home";
            onRerender();
            return;
        }

        if (action === "to-admin") {
            app.uiState.mode = "admin";
            onRerender();
            return;
        }
    };
};
