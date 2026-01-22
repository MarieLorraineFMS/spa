import { Cart } from "./models/Cart.js";
import { CatalogService } from "./services/CatalogService.js";
import { StockService } from "./services/StockService.js";
import { OrderService } from "./services/OrderService.js";
import { StorageService } from "./services/StorageService.js";
import { seedCategories, seedProducts } from "./data/seed.js";
import { renderApp } from "./ui/renderApp.js";


/**
 * Initialisation de l’app
 * - Charge les data depuis le localStorage
 * - Utilise les data de seed lors du premier lancement
 * - Instancie les services (catalogue, stock, commandes, stockage) & le panier
 *
 */

//////////////////////////////// STOCKAGE ////////////////////////////////

const storage = new StorageService({ prefix: "shop" });

//////////////////////////////// LOAD DATA ///////////////////////////////

const persistedCategories = storage.loadCategories(null);
const persistedProducts = storage.loadProducts(null);
const persistedOrders = storage.loadOrders([]);

// Premier lancement : localStorage vide => utilisation du seed
const categoriesData =
    persistedCategories && persistedCategories.length ? persistedCategories : seedCategories;

const productsData =
    persistedProducts && persistedProducts.length ? persistedProducts : seedProducts;

//////////////////////////////// CART & SERVICE /////////////////////////////

const catalogService = new CatalogService({
    categories: categoriesData,
    products: productsData,
});

const stockService = new StockService();

const orderService = new OrderService({
    stockService,
    catalogService,
    orders: persistedOrders,
});

// Restauration du panier après refresh
const persistedCart = storage.loadCart({ items: [] });
const cart = new Cart(persistedCart);

//////////////////////////////// HELPERS //////////////////////////////////

const persistAll = () => {
    // Sauvegarde l’état courant de l’application dans le localStorage
    storage.saveCategories(catalogService.getCategories());
    storage.saveProducts(catalogService.getProducts(null));
    storage.saveOrders(orderService.getLastOrders(9999));
    storage.saveCart(cart);
}

// Sauvegarde de l’état initial pour avoir les clés
persistAll();

//////////////////////////////// UI //////////////////////////////////////////

export const app = {
    catalogService,
    stockService,
    orderService,
    storage,
    cart,

    persistAll,

    // Générateur d’id
    createId() {
        return (
            crypto?.randomUUID?.() ??
            `id_${Date.now()}_${Math.random().toString(16).slice(2)}`
        );
    },
};
window.addEventListener("app:rerender", () => {
    renderApp(app);
});

renderApp(app);

