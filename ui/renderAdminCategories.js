import { escapeHtml } from "./utils.js";

/**
 * Liste d'icônes Bootstrap.
 */
const CATEGORY_ICONS = [
  { value: "bi-tag", label: "Tag" },
  { value: "bi-book", label: "Livre" },
  { value: "bi-bag", label: "Boutique" },
  { value: "bi-cart", label: "Panier" },
  { value: "bi-laptop", label: "Informatique" },
  { value: "bi-phone", label: "Téléphone" },
  { value: "bi-gear", label: "Paramètres" },
  { value: "bi-lightning", label: "Rapide / Tech" },
  { value: "bi-people", label: "Utilisateurs" },
  { value: "bi-star", label: "Mis en avant" },
];

/**
 * CRUD catégories
 * - Ajouter une catégorie (nom, couleur, icône)
 * - Supprimer une sélection
 *
 * Id catégorie : "cat-<nom-sluggé>"
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

      <div class="border rounded p-2 mb-3">
        <div class="text-muted small mb-2">Ajouter une catégorie</div>

        <div class="row g-2">
          <!-- Nom -->
          <div class="col-12 col-md-4">
            <input
              class="form-control form-control-sm"
              id="cat-name"
              placeholder="Nom de la catégorie"
            />
          </div>

          <!-- Couleur (gris par défaut) -->
          <div class="col-6 col-md-2">
            <input
              class="form-control form-control-sm"
              id="cat-color"
              type="color"
              value="#6c757d"
            />
            <div class="form-text small">Couleur</div>
          </div>

          <!-- Icône (tag par défaut) -->
          <div class="col-6 col-md-3">
            <select class="form-select form-select-sm" id="cat-icon">
              ${CATEGORY_ICONS.map((i) => `<option value="${i.value}" ${i.value === "bi-tag" ? "selected" : ""}>${i.label}</option>`).join("")}
            </select>
            <div class="form-text small">Icône</div>
          </div>

          <!-- Aperçu -->
          <div class="col-12 col-md-3">
            <div class="text-muted small mb-1">Aperçu</div>

            <span
              id="cat-preview-tag"
              class="Tag"
              style="border-color:#6c757d;"
            >
              <span
                id="cat-preview-dot"
                class="Tag__dot"
                style="background:#6c757d;"
              ></span>

              <span>
                <i id="cat-preview-icon" class="bi bi-tag me-1"></i>
                <span id="cat-preview-name">Nouvelle catégorie</span>
              </span>
            </span>
          </div>

          <!-- Bouton (désactivé tant que le nom est vide) -->
          <div class="col-12">
            <button
              class="btn btn-sm btn-success d-inline-flex align-items-center gap-2 flex-nowrap"
              data-action="add-cat"
              disabled
            >
              <i class="bi bi-plus-circle"></i>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des catégories -->
      <div class="list-group mb-2">
        ${categories.length === 0 ? renderEmpty() : categories.map(renderRow).join("")}
      </div>

      <!-- Actions -->
      <div class="d-flex justify-content-between align-items-center">
        <button class="btn btn-sm btn-outline-danger" data-action="delete-selected">
          <i class="bi bi-trash me-1"></i>Supprimer la sélection
        </button>
        <span class="text small">${categories.length} catégorie(s)</span>
      </div>
    </div>
  `;

  // MAJ aperçu & sécurité bouton
  wireCategoryPreview(container);

  container.onclick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const btn = target?.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");

    // Ajouter une catégorie
    if (action === "add-cat") {
      const nameEl = container.querySelector("#cat-name");
      const colorEl = container.querySelector("#cat-color");
      const iconEl = container.querySelector("#cat-icon");

      const name = nameEl && "value" in nameEl ? String(nameEl.value).trim() : "";
      const color = colorEl && "value" in colorEl ? String(colorEl.value) : "#6c757d";
      const icon = iconEl && "value" in iconEl ? String(iconEl.value) : "bi-tag";

      // Sécurité : pas de nom pas de chocolat
      if (!name) {
        window.alert("Le nom de la catégorie est obligatoire.");
        return;
      }

      // Id : cat-mon-nom
      const id = buildCategoryIdFromName(name, categories);

      app.catalogService.createCategory({
        id,
        name,
        color,
        icon,
      });

      app.persistAll();
      window.dispatchEvent(new CustomEvent("admin:categories-changed"));
      renderAdminCategories(app, { containerSelector });
      return;
    }

    // Supprimer la sélection
    if (action === "delete-selected") {
      const checks = Array.from(container.querySelectorAll("input[data-cat-id]:checked"));
      const ids = checks.map((c) => c.getAttribute("data-cat-id")).filter(Boolean);

      try {
        ids.forEach((id) => app.catalogService.deleteCategory(id));
        app.persistAll();
        window.dispatchEvent(new CustomEvent("admin:categories-changed"));
      } catch {
        window.alert("Impossible de supprimer : la catégorie est utilisée par des articles.");
      }

      renderAdminCategories(app, { containerSelector });
    }
  };
};

const renderEmpty = () => `
  <div class="alert alert-light border mb-0">
    Aucune catégorie.
  </div>
`;

/**
 * Aperçu & désactivation du bouton.
 */
const wireCategoryPreview = (container) => {
  const nameEl = container.querySelector("#cat-name");
  const colorEl = container.querySelector("#cat-color");
  const iconEl = container.querySelector("#cat-icon");
  const submitBtn = container.querySelector("[data-action='add-cat']");

  const tagEl = container.querySelector("#cat-preview-tag");
  const dotEl = container.querySelector("#cat-preview-dot");
  const iconPreviewEl = container.querySelector("#cat-preview-icon");
  const namePreviewEl = container.querySelector("#cat-preview-name");

  if (!(nameEl instanceof HTMLInputElement)) return;
  if (!(colorEl instanceof HTMLInputElement)) return;
  if (!(iconEl instanceof HTMLSelectElement)) return;
  if (!(submitBtn instanceof HTMLButtonElement)) return;

  if (!(tagEl instanceof HTMLElement)) return;
  if (!(dotEl instanceof HTMLElement)) return;
  if (!(iconPreviewEl instanceof HTMLElement)) return;
  if (!(namePreviewEl instanceof HTMLElement)) return;

  const apply = () => {
    const name = nameEl.value.trim();
    const color = colorEl.value || "#6c757d";
    const icon = iconEl.value || "bi-tag";

    // Couleur (Tag + dot)
    tagEl.style.borderColor = color;
    dotEl.style.background = color;

    // Icône
    iconPreviewEl.className = `bi ${icon} me-1`;

    // Nom
    namePreviewEl.textContent = name || "Nouvelle catégorie";

    // Bouton activé seulement si nom
    submitBtn.disabled = !name;
  };

  nameEl.addEventListener("input", apply);
  colorEl.addEventListener("input", apply);
  iconEl.addEventListener("change", apply);

  apply();
};

/**
 * Crée un id "cat-<slug>" à partir du nom.
 * Si l'id existe déjà, on ajoute "-2", "-3", etc.
 */
const buildCategoryIdFromName = (name, categories) => {
  const baseSlug = slugify(name);
  const baseId = `cat-${baseSlug || "categorie"}`;

  const exists = (id) => categories.some((c) => String(c.id) === id);

  if (!exists(baseId)) return baseId;

  // On ajoute un suffixe si déjà pris
  let i = 2;
  while (exists(`${baseId}-${i}`)) {
    i += 1;
  }
  return `${baseId}-${i}`;
};

/**
 * Transforme un texte en slug simple (sans accents, espaces -> "-").
 * Exemple : "Informatique & Accessoires" -> "informatique-accessoires"
 */
const slugify = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    // Enlève les accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remplace tout ce qui n'est pas lettre/chiffre par des tirets
    .replace(/[^a-z0-9]+/g, "-")
    // Nettoyage des tirets
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
};

/**
 * Affiche une catégorie dans la liste
 */
const renderRow = (c) => `
  <label class="list-group-item d-flex align-items-center gap-2">
    <input
      type="checkbox"
      class="form-check-input m-0"
      data-cat-id="${escapeHtml(c.id)}"
    />

    <span
      class="Tag me-auto"
      style="border-color:${escapeHtml(c.color || "#6c757d")};"
    >
      <span
        class="Tag__dot"
        style="background:${escapeHtml(c.color || "#6c757d")};"
      ></span>

      <span>
        <i class="bi ${escapeHtml(c.icon || "bi-tag")} me-1"></i>
        ${escapeHtml(c.name)}
      </span>
    </span>

    <span class="badge text-bg-light">${escapeHtml(c.id)}</span>
  </label>
`;
