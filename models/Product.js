export class Product {
    constructor({ id, name, price, stock, categoryId }) {

        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.categoryId = categoryId;
    }


    /**
     *
     * Vérifier si un produit est en stock
     * @param {number} qty
     * @returns {boolean}
     */
    isInStock(qty = 1) {
        return Number.isInteger(qty) && qty > 0 && this.stock >= qty;
    }
}
