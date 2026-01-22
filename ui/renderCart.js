import { renderProductImage } from "./renderProducts.js";
import { escapeHtml, formatPrice } from "./utils.js";

/**
 * Affiche le panier & gère ses actions.
 *
 * @param {object} app - (services & panier)
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 * @param {Function} [options.onOrderPlaced] - callback après commande validée
 */
export const renderCart = (
  app,
  {
    containerSelector = "#cart",
    onOrderPlaced = () => { },
  } = {}
) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderCart: conteneur introuvable (${containerSelector})`);
  }

  const items = app.cart.items;

  container.innerHTML = `
    <div class="Cart">
      <div class="CartLayout">

        <!-- Colonne gauche : Mon panier -->
        <div class="Panel">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 class="mb-0">Mon panier</h5>
              <span class="badge text-bg-light">${app.cart.getTotalItems()} article(s)</span>
            </div>

            ${items.length > 0
      ? `<button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-action="clear"
                          >
                            <i class="bi bi-trash3 me-1"></i>Vider
                          </button>`
      : ""
    }
          </div>

          ${items.length === 0 ? renderEmptyCart() : renderCartContent(app)}
        </div>

        <!-- Colonne droite : Récapitulatif -->
        <div class="Panel">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h5 class="mb-0">Récapitulatif</h5>
          </div>

          <div class="d-flex justify-content-between align-items-center py-2 border-top" style="border-color: rgba(255,255,255,0.12) !important;">
            <div class="text-muted small">Total</div>
            <div class="fw-semibold">${formatPrice(app.cart.getTotal())}</div>
          </div>

          <button
            type="button"
            class="btn btn-primary w-100 mt-3 ${items.length === 0 ? "disabled" : ""}"
            data-action="checkout"
            ${items.length === 0 ? "disabled" : ""}
          >
            Commander
          </button>


        </div>

      </div>
    </div>
  `;

  // Gestion des clics
  container.onclick = (e) => {
    /** @type {Element | null} */
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const actionEl = target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.getAttribute("data-action");
    const productId = actionEl.getAttribute("data-product-id");

    if (action === "inc" && productId) {
      const product = app.catalogService.getProductById(productId);
      if (!product) return;

      // Ajout au panier
      app.cart.add(product, 1);
      app.persistAll();
      renderCart(app, { containerSelector, onOrderPlaced });
      window.dispatchEvent(new Event("app:rerender"));
      return;
    }

    if (action === "dec" && productId) {
      app.cart.remove(productId, 1);
      app.persistAll();
      renderCart(app, { containerSelector, onOrderPlaced });
      return;
    }

    if (action === "remove" && productId) {
      app.cart.deleteLine(productId);
      app.persistAll();
      renderCart(app, { containerSelector, onOrderPlaced });
      return;
    }

    if (action === "clear") {
      app.cart.clear();
      app.persistAll();
      renderCart(app, { containerSelector, onOrderPlaced });
      window.dispatchEvent(new Event("app:rerender"));
      return;
    }

    if (action === "checkout") {
      handleCheckout(app, {
        onOrderPlaced,
        rerender: () => renderCart(app, { containerSelector, onOrderPlaced }),
      });
    }
  }
};

///////////////////////////// UI HELPERS //////////////////////////////

const renderEmptyCart = () => `
  <div class="alert mb-0">
    Votre panier est vide.
  </div>
`;

const renderCartContent = (app) => {
  const linesHtml = app.cart.items.map((it) => renderCartLine(app, it)).join("");

  return `
    <div class="list-group">
      ${linesHtml}
    </div>
  `;
};

const renderCartLine = (app, it) => {
  const product = app.catalogService.getProductById(it.productId);
  const name = product ? product.name : "Produit inconnu";

  return `
    <div class="list-group-item d-flex align-items-center justify-content-between gap-2">
      <div class="me-auto">
        <div class="fw-semibold">${escapeHtml(name)}</div>
        <div class="text-muted small d-flex align-items-center" style="gap:20px;">
            <span style="opacity:0.75;">${renderProductImage(it, 50)}</span>${formatPrice(it.unitPrice)} • Sous-total : ${formatPrice(it.getLineTotal())}
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="btn-group" role="group" aria-label="Quantité">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-action="dec" data-product-id="${it.productId}"> <i class="bi bi-dash"></i></button>
          <button type="button" class="btn btn-sm btn-outline-secondary" disabled>${it.quantity}</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" data-action="inc" data-product-id="${it.productId}"><i class="bi bi-plus"></i></button>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          data-action="remove"
          data-product-id="${it.productId}"
          aria-label="Supprimer"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
};

///////////////////////////// CHECKOUT //////////////////////////////

const handleCheckout = (app, { onOrderPlaced, rerender }) => {
  // Confirmation (TODO modal)
  const ok = window.confirm("Confirmer la commande ?");
  if (!ok) return;

  try {
    const orderId = app.createId();
    app.orderService.placeOrder(app.cart, orderId);
    app.persistAll();

    // Callback pour le reste de l’app (ex: retour boutique)
    onOrderPlaced();
    rerender();
  } catch (e) {
    /** @type {Error & { code?: string, details?: any }} */
    const err = e;

    if (err.code === "INSUFFICIENT_STOCK") {
      window.alert("Stock insuffisant pour valider la commande. Vérifie le panier.");
      rerender();
      return;
    }

    window.alert("Une erreur est survenue lors de la commande.");
    rerender();
  }
};
