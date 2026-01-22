import { escapeHtml, formatPrice } from "./utils.js";
import { openModal } from "./components/modal.js";


const PAGE_SIZE = 9;

/**
 * Affiche la liste des produits
 * - Hero carousel quand aucune catégorie n'est sélectionnée
 * - Filtre par catégorie
 * - Pagination réelle
 */
export const renderProducts = (
  app,
  {
    containerSelector = "#products",
    paginationSelector = "#pagination",
    onCartChanged = () => { },
  } = {}
) => {
  const container = document.querySelector(containerSelector);

  if (!(container instanceof HTMLElement)) {
    throw new Error(`renderProducts: conteneur introuvable (${containerSelector})`);
  }

  //////////////////////////////////// UI//////////////////////////////////
  app.uiState = app.uiState || {};
  const ui = app.uiState;

  ui.page = Number.isInteger(ui.page) ? ui.page : 1;
  ui.heroIndex = Number.isInteger(ui.heroIndex) ? ui.heroIndex : 0;

  const selectedCategoryId = ui.selectedCategoryId ?? null;

  //////////////////////////////////// DATA //////////////////////////////////
  const categories = app.catalogService.getCategories();
  const products = app.catalogService.getProducts(selectedCategoryId);

  // Reset pagination si changement de filtre
  if (ui.lastCategoryId !== selectedCategoryId) {
    ui.page = 1;
    ui.lastCategoryId = selectedCategoryId;
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  ui.page = Math.min(Math.max(ui.page, 1), totalPages);

  const start = (ui.page - 1) * PAGE_SIZE;
  const pagedProducts = products.slice(start, start + PAGE_SIZE);

  //////////////////////////////////// HERO //////////////////////////////////
  const allProducts = app.catalogService.getProducts(null);
  const featured = allProducts.filter((p) => p.isFeatured);
  const heroProducts = (featured.length ? featured : allProducts).slice(0, 5);

  if (ui.heroIndex >= heroProducts.length) {
    ui.heroIndex = 0;
  }

  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId) || null
    : null;

  //////////////////////////////////// RENDER //////////////////////////////////
  container.innerHTML = `
    <div class="Products">

      ${selectedCategoryId === null
      ? renderHeroCarousel(heroProducts, categories, ui.heroIndex)
      : renderFilterBanner(selectedCategory)
    }

      <div class="Panel mt-3">
        <div class="row g-3">
          ${products.length === 0
      ? renderEmptyState()
      : pagedProducts.map((p) =>
        renderProductCard(p, categories, selectedCategoryId)
      ).join("")
    }
        </div>
      </div>
    </div>
  `;

  renderPagination(app, {
    containerSelector: paginationSelector,
    totalPages,
    currentPage: ui.page,
    onCartChanged,
    productsContainer: containerSelector,
  });

  //////////////////////////////////// EVENTS//////////////////////////////////
  container.onclick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    // HERO NAV
    const heroBtn = target.closest("[data-hero-nav]");
    if (heroBtn && selectedCategoryId === null) {
      const dir = heroBtn.getAttribute("data-hero-nav");
      const count = heroProducts.length;

      if (dir === "prev") ui.heroIndex = (ui.heroIndex - 1 + count) % count;
      if (dir === "next") ui.heroIndex = (ui.heroIndex + 1) % count;

      renderProducts(app, { containerSelector, paginationSelector, onCartChanged });
      return;
    }

    // MODAL
    const card = target.closest("[data-product-card-id]");
    if (card && !target.closest("[data-add-product-id]")) {
      const productId = card.getAttribute("data-product-card-id");
      const product = app.catalogService.getProductById(productId);
      if (!product) return;

      const category = categories.find((c) => c.id === product.categoryId) || null;

      openProductModal(product, category);
      return;
    }

    // ADD TO CART
    const addBtn = target.closest("[data-add-product-id]");
    if (!addBtn) return;

    const productId = addBtn.getAttribute("data-add-product-id");
    const product = app.catalogService.getProductById(productId);
    if (!product || product.stock <= 0) return;

    app.cart.add(product, 1);
    app.persistAll();

    renderProducts(app, { containerSelector, paginationSelector, onCartChanged });
    onCartChanged();
  }
};

///////////////////////////// HERO //////////////////////////////

const renderHeroCarousel = (products, categories, index) => {
  if (!products.length) return "";

  const p = products[index];
  const cat = categories.find((c) => c.id === p.categoryId) || null;
  const color = cat?.color || "#2f6feb";

  return `
    <div class="Panel" data-hero>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <div class="text-muted small">Mise en avant</div>
          <div class="fw-semibold">Nos best-sellers</div>
        </div>

        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-sm btn-outline-secondary" data-hero-nav="prev">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="text-muted small">${index + 1} / ${products.length}</span>
          <button class="btn btn-sm btn-outline-secondary" data-hero-nav="next">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="row">
        ${renderHeroCard(p, cat, color)}
      </div>
    </div>
  `;
};

const renderHeroCard = (p, cat, color) => `
  <div class="col-12" data-product-card-id="${escapeHtml(p.id)}">
    <div class="card ProductCard">
      <div class="card-body d-flex flex-column flex-md-row gap-3">
        <div style="max-width:320px;width:100%">
          ${renderProductImage(p, 200)}
        </div>

        <div class="flex-grow-1 d-flex flex-column gap-2">
          <div class="d-flex justify-content-between">
            <h5 class="mb-0">${escapeHtml(p.name)}</h5>
            <span class="badge text-bg-light">${formatPrice(p.price)}</span>
          </div>

          <span class="Tag" style="border-color:${escapeHtml(color)};">
            <span class="Tag__dot" style="background:${escapeHtml(color)};"></span>
            <span>${escapeHtml(cat?.name ?? "")}</span>
          </span>
          <p class="text-muted small mb-0">
            <strong>${escapeHtml(p.shortDescription ?? "")}</strong>
          </p>
          <p class="text-muted small mb-0">
            ${escapeHtml(p.description ?? "")}
          </p>
          <div class="mt-auto d-flex justify-content-end">
            <button
              class="btn btn-outline-success btn-sm"
              data-add-product-id="${escapeHtml(p.id)}"
              ${p.stock <= 0 ? "disabled" : ""}
            >
             <span class="d-flex fs-5 justify-content-start align-items-center gap-2"> ${p.stock <= 0 ? `<i class="bi bi-x-circle me-1"></i>Indisponible` : `<i class="bi bi-cart-plus me-1"></i>Ajouter au panier</span>`}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

///////////////////////////// FILTER //////////////////////////////

const renderFilterBanner = (category) => `
  <div class="Panel">
    <div class="d-flex justify-content-between align-items-center">
      <span class="Tag Tag--filtered" style="border-color:${escapeHtml(category.color)};">
        <span class="Tag__dot" style="background:${escapeHtml(category.color)};"></span>
        <span> <i class="bi ${escapeHtml(category.icon ?? "bi-tag")} me-1"></i>${escapeHtml(category.name)}</span>
      </span>
    </div>
  </div>
`;

///////////////////////////// LIST //////////////////////////////

const renderEmptyState = () => `
  <div class="col-12">
    <div class="alert">Aucun produit dans cette catégorie.</div>
  </div>
`;

const renderProductCard = (p, categories, filtered) => {
  const cat = categories.find((c) => c.id === p.categoryId);
  const color = cat?.color || "#2f6feb";

  return `
    <div class="col-12 col-md-6 col-lg-4" data-product-card-id="${escapeHtml(p.id)}">
      <div class="card h-100 ProductCard">
        <div class="card-body d-flex flex-column gap-2">

          <div class="d-flex justify-content-between">${renderProductImage(p)}
          <div><span class="Tag ${filtered ? "Tag--filtered" : ""}" style="border-color:${escapeHtml(color)};">
            <span class="Tag__dot" style="background:${escapeHtml(color)};"></span>
            <span>${escapeHtml(cat?.name ?? "")}</span>
          </span></div></div>
          <div class="d-flex justify-content-between">
            <h6 class="mb-0">${escapeHtml(p.name)}</h6>
            <span class="badge text-bg-light">${formatPrice(p.price)}</span>
          </div>


          <p class="text-muted small mb-0">
              ${escapeHtml(p.shortDescription ?? "")}
            </p>
          <div class="mt-auto d-flex justify-content-end">
             <button
              class="btn btn-outline-success btn-sm"
              data-add-product-id="${escapeHtml(p.id)}"
              ${p.stock <= 0 ? "disabled" : ""}
            >
             <span class="d-flex fs-5 justify-content-start align-items-center gap-2">
             ${p.stock <= 0 ? `<i class="bi bi-x-circle me-1"></i>Indisponible`
      : `<i class="bi bi-cart-plus me-1"></i>Ajouter au panier
              </span>`}
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
};

///////////////////////////// PAGINATION //////////////////////////////

const renderPagination = (
  app,
  { containerSelector, totalPages, currentPage, onCartChanged, productsContainer }
) => {
  const container = document.querySelector(containerSelector);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-center gap-2">
      ${Array.from({ length: totalPages }, (_, i) => i + 1)
      .map(
        (p) => `
          <button
            class="btn btn-sm ${p === currentPage ? "btn-primary" : "btn-outline-secondary"}"
            data-page="${p}"
          >${p}</button>
        `
      )
      .join("")}
    </div>
  `;

  container.onclick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const btn = target.closest("[data-page]");
    if (!btn) return;

    app.uiState.page = Number(btn.getAttribute("data-page"));
    renderProducts(app, {
      containerSelector: productsContainer,
      paginationSelector: containerSelector,
      onCartChanged,
    });
  }
};

///////////////////////////// IMAGES //////////////////////////////

export const renderProductImage = (p, height = 120) => {
  console.log('url', p.imageUrl)
  if (!p.imageUrl) {
    return `
      <div class="ProductImagePlaceholder d-flex align-items-center justify-content-center"
           style="height:${height}px;">
        <i class="bi bi-image"></i>
      </div>
    `;
  }

  return `
    <div class="ProductImageWrapper" style="height:${height}px;">
      <img src="${escapeHtml(p.imageUrl)}"
           alt="${escapeHtml(p.name)}"
           loading="lazy"
           style="height:${height}px;object-fit:contain;" />
    </div>
  `;
};

///////////////////////////// MODAL //////////////////////////////

const openProductModal = (product, category) => {
  openModal({
    title: escapeHtml(product.name),
    bodyHtml: `
      <div class="d-flex flex-column gap-3">

        ${renderProductImage(product, 220)}

        <div class="d-flex justify-content-between align-items-center">
          <strong>${formatPrice(product.price)}</strong>
          <span class="Tag" style="border-color:${escapeHtml(category?.color ?? "#2f6feb")}">
            <span class="Tag__dot" style="background:${escapeHtml(category?.color ?? "#2f6feb")}"></span>
            <span>${escapeHtml(category?.name ?? "")}</span>
          </span>
        </div>

        <p class="fw-semibold mb-1">
          ${escapeHtml(product.shortDescription ?? "")}
        </p>

        <p class="text-muted small mb-0">
          ${escapeHtml(product.description ?? "")}
        </p>

      </div>
    `,
  });
};

