import { Cart } from "../models/Cart";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { Product } from "../models/Product";

/**
 * StorageService
 * - En charge de la persistance dans le local storage
 */
export class StorageService {
    constructor({ prefix = "shop" } = {}) {
        this.prefix = prefix;
    }

    //////////////////////////////////// Helpers //////////////////////////////////


    _key(name) {
        return `${this.prefix}:${name}`;
    }

    _safeParse(raw, fallback) {
        try {
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    ////////////////////////////////// SAVE/LOAD/RESET //////////////////////////////////

    /**
     *
     * Sauvegarder
     * @param {string} name
     * @param {any} value
     */
    save(name, value) {
        localStorage.setItem(this._key(name), JSON.stringify(value));
    }

    /**
     *
     * Charger
     * @param {string} name
     * @param {any} fallback
     * @returns {any}
     */
    load(name, fallback) {
        const raw = localStorage.getItem(this._key(name));
        if (!raw) {
            return fallback;
        }
        return this._safeParse(raw, fallback);
    }
    /**
     *
     * Supprimer
     * @param {string} name
     */
    remove(name) {
        localStorage.removeItem(this._key(name));
    }


    /**
     * Supprime toutes les clés contenant le préfixe courant
     */
    resetAll() {
        const prefix = `${this.prefix}:`;
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
            const k = localStorage.key(i);
            if (k && k.startsWith(prefix)) localStorage.removeItem(k);
        }
    }

    ////////////////////////////////// CRUD Helpers  //////////////////////////////////


    /**
     * Sauvegarde des catégories
     * @param {Category[]} categories
     * @returns {void}
     */
    saveCategories(categories) {
        this.save("categories", categories);
    }


    /**
     *
     * Charger les categories
     * @param {any} fallback
     * @returns {any}
     */
    loadCategories(fallback = []) {
        const data = this.load("categories", fallback);
        return Array.isArray(data) ? data : fallback;
    }


    /**
     *
     * Sauvegarde des produits
     * @param {Product[]} products
     * @returns {void}
     */
    saveProducts(products) {
        this.save("products", products);
    }


    /**
     *
     * Charger les produits
     * @param {any} fallback
     * @returns {any}
     */
    loadProducts(fallback = []) {
        const data = this.load("products", fallback);
        return Array.isArray(data) ? data : fallback;
    }


    /**
    *
    * Sauvegarde des commandes
    * @param {Order[]} orders
    * @returns {void}
    */
    saveOrders(orders) {
        this.save("orders", orders);
    }



    /**
     *
     * Charger les commandes
     * @param {any} fallback
     * @returns {any}
     */
    loadOrders(fallback = []) {
        const data = this.load("orders", fallback);
        return Array.isArray(data) ? data : fallback;
    }

    /**
    *
    * Sauvegarder le panier
    * @param {Cart} cart
    * @returns {void}
    */
    saveCart(cart) {
        this.save("cart", cart);
    }

    /**
     *
     * Charger le panier
     * @param {any} fallback
     * @returns {any}
     */
    loadCart(fallback = { items: [] }) {
        const data = this.load("cart", fallback);
        if (!data || typeof data !== "object") return fallback;
        if (!Array.isArray(data.items)) return fallback;
        return data;
    }
}
