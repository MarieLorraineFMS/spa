import { escapeHtml, formatDate, formatPrice } from "./utils.js";

/**
 * Affiche les dernières commandes.
 *
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 * @param {number} [options.limit]
 */
export const renderOrders = (app, { containerSelector = "#admin-orders", limit = 10 } = {}) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderOrders: conteneur introuvable (${containerSelector})`);
  }

  const orders = app.orderService.getLastOrders(limit);

  container.innerHTML = `
    <div class="AdminOrders">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="fw-semibold">Commandes</div>
        <span class="badge text-bg-light">${orders.length}</span>
      </div>

      ${orders.length === 0 ? renderEmptyOrders() : renderOrdersList(orders)}
    </div>
  `;

  // Afficher/masquer le détail d’une commande
  container.onclick = (e) => {
    /** @type {Element | null} */
    const target = e.target instanceof Element ? e.target : null;
    const btn = target?.closest("[data-action='toggle-order']");
    if (!btn) return;

    const orderId = btn.getAttribute("data-order-id");
    if (!orderId) return;

    const details = container.querySelector(`[data-order-details='${orderId}']`);
    if (!details) return;

    details.classList.toggle("d-none");
  }

};

//////////////////////////// UI HELPERS ////////////////////////////

const renderEmptyOrders = () => `
  <div class="alert alert-light border mb-0">
    Aucune commande pour le moment.
  </div>
`;

const renderOrdersList = (orders) => `
  <div class="list-group">
    ${orders.map(renderOrderRow).join("")}
  </div>
`;

const renderOrderRow = (order) => {
  const nbArticles = Array.isArray(order.lines)
    ? order.lines.reduce((sum, l) => sum + (l.quantity || 0), 0)
    : 0;

  return `
    <div class="list-group-item">
      <div class="d-flex align-items-center justify-content-between gap-2">
        <div class="me-auto">
          <div class="fw-semibold">${escapeHtml(order.id)}</div>
          <div class="text-muted small">
            ${formatDate(order.createdAt)} • ${nbArticles} article(s)
          </div>
        </div>

        <div class="text-end">
          <div class="fw-semibold">${formatPrice(order.total ?? 0)}</div>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary mt-1 btn-icon"
            data-action="toggle-order"
            data-order-id="${escapeHtml(order.id)}"
          >
             <img src="/assets/actions/eye.png"
           alt="eye"
           loading="lazy"
           style="object-fit:contain;" />
          </button>
        </div>
      </div>

      <div class="mt-2 d-none" data-order-details="${escapeHtml(order.id)}">
        ${renderOrderDetails(order)}
      </div>
    </div>
  `;
};

const renderOrderDetails = (order) => {
  const lines = Array.isArray(order.lines) ? order.lines : [];

  return `
    <div class="border rounded p-2 bg-dark">
      ${lines.length === 0
      ? `<div class="text-muted small">Aucune ligne.</div>`
      : `
          <div class="table-responsive">
            <table class="table table-dark table-striped table-sm mb-0">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th class="text-end">PU</th>
                  <th class="text-end">Qté</th>
                  <th class="text-end">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${lines.map(renderOrderLine).join("")}
              </tbody>
            </table>
          </div>
        `}
    </div>
  `;
};

const renderOrderLine = (l) => `
  <tr>
    <td>${escapeHtml(l.productName ?? "Produit")}</td>
    <td class="text-end">${formatPrice(l.unitPrice ?? 0)}</td>
    <td class="text-end">${l.quantity ?? 0}</td>
    <td class="text-end">${formatPrice((l.unitPrice ?? 0) * (l.quantity ?? 0))}</td>
  </tr>
`;


