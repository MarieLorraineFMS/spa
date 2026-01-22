import { escapeHtml, formatPrice } from "./utils.js";

/**
 * CRUD articles.
 *
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 */
export const renderAdminProducts = (app, { containerSelector = "#admin-products" } = {}) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderAdminProducts: conteneur introuvable (${containerSelector})`);
  }

  const categories = app.catalogService.getCategories();
  const products = app.catalogService.getProducts(null);

  container.innerHTML = `
    <div class="AdminProducts">
      <div class="fw-semibold mb-2">Articles</div>

      <div class="border rounded p-2 mb-3">
        <div class="text-muted small mb-2">Ajouter un article</div>

        <div class="row g-2">
          <div class="col-12 col-md-4">
            <input class="form-control form-control-sm" id="p-name" placeholder="Nom" />
          </div>
          <div class="col-6 col-md-2">
            <input class="form-control form-control-sm" id="p-price" placeholder="Prix" type="number" step="0.01" />
          </div>
          <div class="col-6 col-md-2">
            <input class="form-control form-control-sm" id="p-stock" placeholder="Stock" type="number" step="1" />
          </div>
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" id="p-cat">
              ${categories.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("")}
            </select>
          </div>
          <div class="col-12">
            <button class="btn btn-sm btn-primary" data-action="add-product">Valider</button>
          </div>
        </div>
      </div>

      <div class="list-group">
        ${products.length === 0 ? renderEmpty() : products.map(renderProductRow).join("")}
      </div>
    </div>
  `;

  container.onclick = (e) => {
    /** @type {Element | null} */
    const target = e.target instanceof Element ? e.target : null;
    const btn = target?.closest("[data-action]");
    if (!btn) {
      return;
    }

    const action = btn.getAttribute("data-action");
    const productId = btn.getAttribute("data-product-id");

    if (action === "add-product") {
      const nameEl = container.querySelector("#p-name");
      const priceEl = container.querySelector("#p-price");
      const stockEl = container.querySelector("#p-stock");
      const catEl = container.querySelector("#p-cat");

      const name = nameEl && "value" in nameEl ? String(nameEl.value).trim() : "";
      const price = priceEl && "value" in priceEl ? Number(priceEl.value) : NaN;
      const stock = stockEl && "value" in stockEl ? Number(stockEl.value) : NaN;
      const categoryId = catEl && "value" in catEl ? String(catEl.value) : "";

      if (!name) {
      }
      if (!Number.isFinite(price) || price < 0) {
      }
      if (!Number.isInteger(stock) || stock < 0) {
      }
      if (!categoryId) {
      }

      app.catalogService.createProduct({
        id: app.createId(),
        name,
        price,
        stock,
        categoryId,
      });

      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }

    if (action === "delete-product" && productId) {
      app.catalogService.deleteProduct(productId);
      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }

    if (action === "set-stock" && productId) {
      const input = container.querySelector(`input[data-stock-input='${CSS.escape(productId)}']`);
      const next = input && "value" in input ? Number(input.value) : NaN;
      if (!Number.isInteger(next) || next < 0) return;

      app.catalogService.setStock(productId, next);
      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }
  }
};

const renderEmpty = () => `
  <div class="alert alert-light border mb-0">
    Aucun article.
  </div>
`;

const renderProductRow = (p) => `
  <div class="list-group-item d-flex align-items-center gap-2">
    <div class="me-auto">
      <div class="fw-semibold">${escapeHtml(p.name)}</div>
      <div class="text-muted small">
        ${formatPrice(p.price)} • Catégorie : ${escapeHtml(p.categoryId)}
      </div>
    </div>

    <div class="d-flex align-items-center gap-2">
      <input
        class="form-control form-control-sm"
        style="width: 90px"
        type="number"
        step="1"
        min="0"
        value="${p.stock}"
        data-stock-input="${escapeHtml(p.id)}"
      />
      <button
        class="btn btn-sm btn-outline-secondary btn-icon"
        data-action="set-stock"
        data-product-id="${escapeHtml(p.id)}"
      >
          <img src="/assets/actions/circle-check.png"
           alt="validation"
           loading="lazy"
           style="object-fit:contain;" />
      </button>

      <button
        class="btn btn-sm btn-outline-danger btn-icon"
        data-action="delete-product"
        data-product-id="${escapeHtml(p.id)}"
      >
         <img src="/assets/actions/trash.png"
           alt="trash"
           loading="lazy"
           style="object-fit:contain;" />
      </button>
    </div>
  </div>
`;
