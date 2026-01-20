import { Order } from "../models/Order.js";
import { OrderLine } from "../models/OrderLine.js";

/**
 * OrderService
 * - Crée la commande basée sur le panier(aprés confirmation)
 * - Charge l'historique de commandes
 * - Délégue la vérification du stock à StockService
 */
export class OrderService {
    constructor({ stockService, catalogService, orders = [] } = {}) {
        if (!stockService) {
            throw new Error("OrderService: stockService is required");
        }
        if (!catalogService) {
            throw new Error("OrderService: catalogService is required");
        }
        this.stockService = stockService;
        this.catalogService = catalogService;

        // Normalisation des commandes
        this.orders = orders.map((o) => (o instanceof Order ? o : new Order(o))); // Créer un objet de type Order à partir des data brutes du local storage
    }

    /**
     * Créer une commande basée sur le panier & mettre à jour le stock.
     *
     * @param {Cart} cart
     * @param {string} orderId
     * @returns {Order}
     */
    placeOrder(cart, orderId) {
        if (!cart) {
            throw new Error("placeOrder: cart is required");

        }
        if (cart.isEmpty()) {
            throw new Error("placeOrder: cart is empty");

        }
        if (!orderId) {
            throw new Error("placeOrder: orderId is required");
        }
        // Vérifier le stock
        const check = this.stockService.canFulfill(cart, this.catalogService);
        if (!check.ok) {
            // Mesage UI
            const err = new Error("Erreur lors de la commande : Stock insuffisant");
            err.code = "INSUFFICIENT_STOCK";
            err.details = check;
            throw err;
        }

        // Construire les lignes de commandes
        const lines = cart.items.map((item) => {
            const product = this.catalogService.getProductById(item.productId);
            return new OrderLine({
                productId: item.productId,
                productName: product ? product.name : "Unknown product",
                unitPrice: item.unitPrice,
                quantity: item.quantity,
            });
        });

        const order = new Order({
            id: orderId,
            createdAt: new Date(),
            lines,
        });

        // Diminuer la quantité
        this.stockService.applyCartStock(cart, this.catalogService);

        // Sauvegarder la commande dans l'historique
        this.orders.unshift(order); // Récentes en premier

        // Vider le panier
        cart.clear();

        return order;
    }

    /**
     * Rechercher les dernières commandes pour une quantité donnée
     * @param {number} limit
     */
    getLastOrders(limit = 10) {
        if (!Number.isInteger(limit) || limit <= 0) {
            return [...this.orders];
        }
        return this.orders.slice(0, limit);
    }

    /**
     *
     * Rechercher une commande pour une id donnée
     * @param {string} id
     * @returns {Order|null}
     */
    getOrderById(id) {
        return this.orders.find((o) => o.id === id) || null;
    }

    /**
     * Normaliser les commandes à partir des data brutes du local storage
     * @param {Order[]} orders
     * @returns {void}
     */
    setOrders(orders) {
        this.orders = orders.map((o) => (o instanceof Order ? o : new Order(o)));
    }
}
