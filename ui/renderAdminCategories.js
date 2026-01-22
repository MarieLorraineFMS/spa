import { escapeHtml } from "./utils.js";

/**
 * CRUD catégories.
 *
 * @param {object} app
 * @param {object} [options]
 * @param {string} [options.containerSelector]
 */
export const renderAdminCategories = (app, { containerSelector = "#admin-categories" } = {}) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderAdminCategories: conteneur introuvable (${containerSelector})`);
  }


  const categories = app.catalogService.getCategories();

  container.innerHTML = `
    <div class="AdminCategories">
      <div class="fw-semibold mb-2">Catégories</div>

      <div class="d-flex gap-2 mb-3">
        <input class="form-control form-control-sm" id="cat-name" placeholder="Nom de catégorie" />
        <button class="btn btn-sm btn-primary" data-action="add-cat">Ajouter</button>
      </div>

      <div class="list-group mb-2">
        ${categories.length === 0 ? renderEmpty() : categories.map(renderRow).join("")}
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <button class="btn btn-sm btn-outline-danger" data-action="delete-selected">
          Supprimer la sélection
        </button>
        <span class="text small">${categories.length} catégorie(s)</span>
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

    if (action === "add-cat") {
      const input = container.querySelector("#cat-name");
      const name = input && "value" in input ? String(input.value).trim() : "";
      if (!name) {
        return;
      }

      app.catalogService.createCategory({ id: app.createId(), name });
      app.persistAll();
      renderAdminCategories(app, { containerSelector });
      return;
    }

    if (action === "delete-selected") {
      const checks = Array.from(container.querySelectorAll("input[data-cat-id]:checked"));
      const ids = checks.map((c) => c.getAttribute("data-cat-id")).filter(Boolean);

      // Suppression (si une catégorie utilisée service throw error)
      try {
        ids.forEach((id) => app.catalogService.deleteCategory(id));
        app.persistAll();
      } catch (err) {
        window.alert("Impossible de supprimer : la catégorie est utilisée par des articles.");
      }

      renderAdminCategories(app, { containerSelector });
      return;
    }
  }
};

const renderEmpty = () => `
  <div class="alert alert-light border mb-0">
    Aucune catégorie.
  </div>
`;

const renderRow = (c) => `
  <label class="list-group-item d-flex align-items-center gap-2">
    <input type="checkbox" class="form-check-input m-0" data-cat-id="${escapeHtml(c.id)}" />
    <span class="me-auto">${escapeHtml(c.name)}</span>
    <span class="badge text-bg-light">${escapeHtml(c.id)}</span>
  </label>
`;
