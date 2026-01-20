import { OrderLine } from "./OrderLine.js";

export class Order {
    constructor({ id, createdAt = new Date(), lines = [] }) {

        this.id = id;
        this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
        this.lines = lines.map((l) => (l instanceof OrderLine ? l : new OrderLine(l)));
        this.total = this.computeTotal();
    }


    /**
     *
     * Calculer le TOTAL d'une commande
     * @returns {number}
     */
    computeTotal() {
        return this.lines.reduce((sum, l) => sum + l.getLineTotal(), 0);
    }
}
