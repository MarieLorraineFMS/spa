import { escapeHtml, formatPrice } from "./utils.js";

/**
 * Liste des images disponibles.
 */
const PRODUCTS_IMAGES_MANIFEST_URL = "/assets/products/manifest.json";

/**
 * Page admin : CRUD produits
 * - Ajouter un produit
 * - Supprimer un produit
 * - Ajuster le stock
 *
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 */
export const renderAdminProducts = async (app, { containerSelector = "#admin-products" } = {}) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderAdminProducts: conteneur introuvable (${containerSelector})`);
  }

  const categories = app.catalogService.getCategories();
  const products = app.catalogService.getProducts(null);

  // "Dictionnaire" pour afficher le nom de la catégorie à partir de son id
  const categoryNameById = categories.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, /** @type {Record<string, string>} */({}));

  // Récupération de la liste d'images depuis le manifest
  const images = await fetchProductImagesFromManifest();

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
            <input class="form-control form-control-sm" id="p-price" placeholder="Prix" type="number" step="0.01" min="0" />
          </div>

          <div class="col-6 col-md-2">
            <input class="form-control form-control-sm" id="p-stock" placeholder="Stock" type="number" step="1" min="0" value="0" />
          </div>

          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" id="p-cat">
              ${categories.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("")}
            </select>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="p-featured" />
              <label class="form-check-label small" for="p-featured">Produit mis en avant</label>
            </div>
          </div>

          <div class="col-12">
            <input class="form-control form-control-sm" id="p-shortDescription" placeholder="Description courte (1 phrase)" />
          </div>

          <div class="col-12">
            <textarea class="form-control form-control-sm" id="p-description" rows="3" placeholder="Description complète"></textarea>
          </div>

          <!-- Choix image -->
          <div class="col-12 col-md-6">
            <select class="form-select form-select-sm" id="p-imageSelect">
              <option value="">Aucune image</option>
              ${images.map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join("")}
            </select>
          </div>

          <!-- Aperçu -->
          <div class="col-12 col-md-6 d-flex align-items-center gap-2">
            <img
              id="p-image-preview"
              src="/assets/products/preview.png"
              alt="preview"
              loading="lazy"
              style="width:200px;height:200px;object-fit:contain;border-radius:8px;"
            />
            <span class="small text-muted" id="p-image-hint">Aperçu</span>
          </div>

          <div class="col-12">
            <button class="btn btn-sm btn-success d-inline-flex align-items-center gap-2 flex-nowrap" data-action="add-product">
              <i class="bi bi-plus-circle"></i>
              Valider
            </button>
          </div>
        </div>
      </div>

      <div class="list-group">
        ${products.length === 0 ? renderEmpty() : products.map((p) => renderProductRow(p, categoryNameById)).join("")}
      </div>
    </div>
  `;

  // MAJ aperçu
  wireImageSelectPreview(container);

  // Gestion des clics (un seul handler pour tout, via data-action)
  container.onclick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const btn = target?.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action") || "";
    const productId = btn.getAttribute("data-product-id");

    // Ajouter un produit
    if (action === "add-product") {
      const nameEl = container.querySelector("#p-name");
      const priceEl = container.querySelector("#p-price");
      const stockEl = container.querySelector("#p-stock");
      const catEl = container.querySelector("#p-cat");
      const imageSelEl = container.querySelector("#p-imageSelect");
      const featuredEl = container.querySelector("#p-featured");
      const shortDescEl = container.querySelector("#p-shortDescription");
      const descEl = container.querySelector("#p-description");

      const name = nameEl && "value" in nameEl ? String(nameEl.value).trim() : "";
      const price = priceEl && "value" in priceEl ? Number(priceEl.value) : NaN;
      const stock = stockEl && "value" in stockEl ? Number(stockEl.value) : NaN;
      const categoryId = catEl && "value" in catEl ? String(catEl.value) : "";

      // Image optionnelle
      const imageFile = imageSelEl && "value" in imageSelEl ? String(imageSelEl.value) : "";
      const imageUrl = imageFile
        ? `/assets/products/${imageFile}`
        : "/assets/products/preview.png";

      const isFeatured = !!(featuredEl && "checked" in featuredEl && featuredEl.checked);
      const shortDescription = shortDescEl && "value" in shortDescEl ? String(shortDescEl.value).trim() : "";
      const description = descEl && "value" in descEl ? String(descEl.value).trim() : "";

      // Check validation
      if (!name) return window.alert("Nom obligatoire.");
      if (!Number.isFinite(price) || price < 0) return window.alert("Prix invalide.");
      if (!Number.isInteger(stock) || stock < 0) return window.alert("Stock invalide.");
      if (!categoryId) return window.alert("Catégorie obligatoire.");

      app.catalogService.createProduct({
        id: app.createId(),
        name,
        price,
        stock,
        categoryId,
        imageUrl,
        isFeatured,
        shortDescription,
        description,
      });

      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }

    // Supprimer un produit
    if (action === "delete-product" && productId) {
      app.catalogService.deleteProduct(productId);
      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }

    // Ajuster le stock
    if ((action === "inc-stock" || action === "dec-stock") && productId) {
      const valueEl = container.querySelector(`[data-stock-value="${CSS.escape(productId)}"]`);
      const current = valueEl ? Number(valueEl.textContent || 0) : NaN;
      if (!Number.isInteger(current) || current < 0) return;

      const next = Math.max(0, current + (action === "inc-stock" ? 1 : -1));

      app.catalogService.setStock(productId, next);
      app.persistAll();
      renderAdminProducts(app, { containerSelector });
      return;
    }
  };
};

const renderEmpty = () => `
  <div class="alert alert-light border mb-0">
    Aucun article.
  </div>
`;

/**
 * Charge la liste d'images depuis /assets/products/manifest.json
 * Si le fichier n'existe pas ou invalide => une liste vide.
 *
 * @returns {Promise<string[]>}
 */
const fetchProductImagesFromManifest = async () => {
  try {
    const resp = await fetch(PRODUCTS_IMAGES_MANIFEST_URL, { cache: "no-store" });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data?.images) ? data.images : [];
  } catch {
    return [];
  }
};

/**
 * MAJ aperçu quand on change le select d'images.
 *
 * @param {HTMLElement} container
 */
const wireImageSelectPreview = (container) => {
  const sel = container.querySelector("#p-imageSelect");
  const img = container.querySelector("#p-image-preview");
  const hint = container.querySelector("#p-image-hint");

  if (!(sel instanceof HTMLSelectElement)) return;
  if (!(img instanceof HTMLImageElement)) return;
  if (!(hint instanceof HTMLElement)) return;

  const apply = () => {
    const file = sel.value;

    if (!file) {
      img.src = "/assets/products/preview.png";
      hint.textContent = "Aucune image sélectionnée";
      return;
    }

    img.src = `/assets/products/${file}`;
    hint.textContent = file;
  };

  sel.addEventListener("change", apply);
  apply();
};

/**
 * Affiche une ligne produit
 *
 * @param {any} p
 * @param {Record<string,string>} categoryNameById
 */
const renderProductRow = (p, categoryNameById) => {
  const categoryName = categoryNameById[p.categoryId] || p.categoryId;
  const imageUrl = p.imageUrl ? String(p.imageUrl) : "";
  const featuredBadge = p.isFeatured ? `<span class="badge text-bg-primary ms-2">Best-seller</span>` : "";

  return `
    <div class="list-group-item d-flex align-items-center gap-2">
      ${imageUrl
      ? `
          <img
            src="${escapeHtml(imageUrl)}"
            alt="${escapeHtml(p.name)}"
            loading="lazy"
            style="width:48px;height:48px;object-fit:contain;border-radius:8px;"
          />
        `
      : `
          <div style="width:48px;height:48px;border-radius:8px;border:1px dashed #ccc;" class="d-flex align-items-center justify-content-center text-muted small">
            —
          </div>
        `
    }

      <div class="me-auto">
        <div class="fw-semibold">
          ${escapeHtml(p.name)}${featuredBadge}
        </div>
        <div class="text-muted small">
          ${formatPrice(p.price)} • Catégorie : ${escapeHtml(categoryName)}
        </div>
        ${p.shortDescription ? `<div class="small">${escapeHtml(String(p.shortDescription))}</div>` : ""}
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="btn-group" role="group" aria-label="Stock">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            data-action="dec-stock"
            data-product-id="${escapeHtml(p.id)}"
            ${Number(p.stock) <= 0 ? "disabled" : ""}
            aria-label="Diminuer le stock"
          >
            <i class="bi bi-dash"></i>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            disabled
            data-stock-value="${escapeHtml(p.id)}"
            aria-label="Valeur du stock"
          >
            ${Number.isInteger(p.stock) ? p.stock : Number(p.stock) || 0}
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            data-action="inc-stock"
            data-product-id="${escapeHtml(p.id)}"
            aria-label="Augmenter le stock"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <button
          class="btn btn-sm btn-outline-danger btn-icon"
          data-action="delete-product"
          data-product-id="${escapeHtml(p.id)}"
          aria-label="Supprimer l'article"
        >
          <img src="/assets/actions/trash.png" alt="trash" loading="lazy" style="object-fit:contain;" />
        </button>
      </div>
    </div>
  `;
};
