import { escapeHtml } from "./utils.js";

/**
 * Affiche la liste des catégories & gère le filtre.
 *
 * @param {object} app - (services & panier)
 * @param {object} [options]
 * @param {string} [options.containerSelector] - Sélecteur du conteneur des catégories
 * @param {Function} [options.onCategorySelected] - Callback appelée après sélection
 */
export const renderCategories = (
  app,
  {
    containerSelector = "#categories",
    onCategorySelected = () => { },
  } = {}
) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderCategories: conteneur introuvable (${containerSelector})`);
  }

  app.uiState = app.uiState || {};
  const categories = app.catalogService.getCategories();
  const selectedCategoryId = app.uiState.selectedCategoryId ?? null;

  container.innerHTML = `
    <div class="Categories d-flex flex-wrap gap-2 mb-3">

      <button
        class="Categories__item btn btn-sm rounded-pill btn-outline-secondary ${selectedCategoryId === null ? "is-active" : ""}"
        data-category-id=""
        type="button"
        style="${selectedCategoryId === null ? "border-color:rgba(47,111,235,.7); background: rgba(47,111,235,0.12); box-shadow:0 0 0 .2rem rgba(47,111,235,0.20);" : ""}"
      >
        <i class="bi bi-tags me-1"></i>
        Toutes
      </button>

      ${categories
      .map((c) => {
        const isActive = selectedCategoryId === c.id;
        const color = c.color ?? "#2f6feb";

        console.log('c.color', c.color)
        console.log('categories', categories)

        return `
            <button
              class="Categories__item btn btn-sm rounded-pill btn-outline-secondary ${isActive ? "is-active" : ""}"
              data-category-id="${escapeHtml(c.id)}"
              type="button"
              style="${isActive
            ? `border-color:${escapeHtml(color)}!important; background:${escapeHtml(color)}22; box-shadow:0 0 0 .2rem ${escapeHtml(color)}33;`
            : ""
          }"
            >
              <i class="bi ${escapeHtml(c.icon ?? "bi-tag")} me-1"></i>
              ${escapeHtml(c.name)}
            </button>
          `;
      })
      .join("")}

    </div>
  `;

  container.onclick = (e) => {
    /** @type {Element | null} */
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const btn = target.closest("[data-category-id]");
    if (!btn) return;

    const id = btn.getAttribute("data-category-id");
    const nextCategoryId = id ? id : null;

    // Pas de re-render si on reclique la même catégorie
    if (nextCategoryId === selectedCategoryId) return;

    // Mise à jour état UI + reset pagination (vraie UX)
    app.uiState.selectedCategoryId = nextCategoryId;
    app.uiState.page = 1;

    // Re-render catégories (couleurs / active)
    renderCategories(app, { containerSelector, onCategorySelected });

    // Informer le reste (produits)
    onCategorySelected(nextCategoryId);
  }
};
