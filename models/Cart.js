import { CartItem } from "./CartItem.js";
import { Product } from "./Product.js";


export class Cart {
    constructor({ items = [] } = {}) {
        this.items = items.map((item) => (item instanceof CartItem ? item : new CartItem(item)));
    }

    /**
     *
     * Augmenter la quantité d'un item ou créer une nouvelle ligne dans le panier
     * @param {Product} product
     * @param {number} qty
     * @returns {void}
     */
    add(product, qty = 1) {

        const existing = this.items.find((item) => item.productId === product.id);
        if (existing) {
            existing.quantity += qty;
            return;
        }

        this.items.push(
            new CartItem({
                productId: product.id,
                unitPrice: product.price,
                quantity: qty,
            })
        );
    }

    /**
     *
     * Diminuer la quantité d'un item ou supprimer la ligne si quantité = 0
     * @param {string} productId
     * @param {number} qty
     * @returns {void}
     */
    remove(productId, qty = 1) {

        const existing = this.items.find((it) => it.productId === productId);
        if (!existing) return;

        existing.quantity -= qty;

        if (existing.quantity <= 0) {
            this.items = this.items.filter((it) => it.productId !== productId);
        }
    }

    /**
     *
     * Supprimer un item du panier
     * @param {string} productId
     */
    deleteLine(productId) {
        if (!productId) {
            throw new Error("Cart.deleteLine: productId is required");
        }
        this.items = this.items.filter((it) => it.productId !== productId);
    }

    /**
     *
     * Vider le panier
     * @returns {void}

     */
    clear() {
        this.items = [];
    }


    /**
     *
     * Calculer le TOTAL du panier
     * @returns {number}
     */
    getTotal() {
        return this.items.reduce((sum, it) => sum + it.getLineTotal(), 0);
    }


    /**
     *
     * Calculer la quantité d'une ligne du panier
     * @returns {number}
     */
    getTotalItems() {
        return this.items.reduce((sum, it) => sum + it.quantity, 0);
    }


    /**
     *
     * Vérifier si le panier est vide
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }
}
