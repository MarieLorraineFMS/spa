import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

/**
 * CatalogService (logique métier)
 * - Charge la liste des catégories & des produits
 * - Opérations CRUD Admin
 * - Opérations CRUD  Client : lecture & filtre
 * - Centralise les règles "métier"
 */
export class CatalogService {
    constructor({ categories = [], products = [] } = {}) {
        // Normalisation des data brutes
        this.categories = categories.map((cat) => (cat instanceof Category ? cat : new Category(cat))); // Créer un objet de type Category depuis les data brutes du local storage
        this.products = products.map((product) => (product instanceof Product ? product : new Product(product)));// Créer un objet de type Produit depuis les data brutes du local storage
    }

    ////////////////////////////////// LECTURE (client & admin) //////////////////////////////////

    /**
     *
     * Rechercher toutes les catégories
     * @returns {Category[]}
     */
    getCategories() {
        return [...this.categories];
    }

    /**
     *
     * Rechercher tous les produits
     * @param {string|null} categoryId - null == "toutes les catégories"
     * @returns {Product[]}
     */
    getProducts(categoryId = null) {
        if (!categoryId) {
            return [...this.products];
        }
        return this.products.filter((p) => p.categoryId === categoryId);
    }


    /**
     *
     * Rechercher une catégorie pour une id donnée
     * @param {string} id
     * @returns {Category|null}
     */
    getCategoryById(id) {
        return this.categories.find((c) => c.id === id) || null;
    }


    /**
     *
     * Rechercher un produit pour une id donnée
     * @param {string} id
     * @returns {Product|null}
     */
    getProductById(id) {
        return this.products.find((p) => p.id === id) || null;
    }

    ////////////////////////////////// CRUD Categories (admin) //////////////////////////////////

    /**
     *
     * Créer une catégorie
     * @param {Category} param - {id:string, name:string}
     * @param
     * @returns {Category}
     */
    createCategory({ id, name }) {
        if (!name || !name.trim()) {
            throw new Error("createCategory: name is required");

        }
        if (this.categories.some((c) => c.id === id)) {
            throw new Error("createCategory: id already exists");

        }

        const category = new Category({ id, name: name.trim() });
        this.categories.push(category);
        return category;
    }


    /**
     *
     * Modifier une catégorie
     * @param {Category} param - {id:string, name:string}
     * @returns {Category}
     */
    updateCategory({ id, name }) {
        if (!name || !name.trim()) {
            throw new Error("updateCategory: name is required");
        }

        const category = this.getCategoryById(id);
        if (!category) {
            throw new Error("updateCategory: category not found");
        }

        category.name = name.trim();
        return category;
    }


    /**
     *
     * Supprimer une catégorie (si elle n'est pas liée à un produit)
     * @param {string} id
     * @returns {void}
     */
    deleteCategory(id) {
        // Empêcher la suppression si la catégorie est liée à un produit
        const used = this.products.some((p) => p.categoryId === id);
        if (used) {
            throw new Error("deleteCategory: category is used by products");
        }

        const before = this.categories.length;
        this.categories = this.categories.filter((c) => c.id !== id);

        if (this.categories.length === before) {
            throw new Error("deleteCategory: category not found");
        }
    }

    ////////////////////////////////// CRUD Products (admin) //////////////////////////////////


    /**
     *
     * Créer un produit
     * @param {Product} param - {id:string, name:string, stock:number, categoryId:string}
     * @returns {Product}
     */
    createProduct({ id, name, price, stock, categoryId }) {
        if (!name || !name.trim()) {
            throw new Error("createProduct: name is required");
        }
        if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
            throw new Error("createProduct: price must be a non-negative number");
        }
        if (!Number.isInteger(stock) || stock < 0) {
            throw new Error("createProduct: stock must be a non-negative integer");
        }
        if (!this.getCategoryById(categoryId)) {
            throw new Error("createProduct: category does not exist");

        }
        if (this.products.some((p) => p.id === id)) {
            throw new Error("createProduct: id already exists");

        }

        const product = new Product({
            id,
            name: name.trim(),
            price,
            stock,
            categoryId,
        });

        this.products.push(product);
        return product;
    }


    /**
     *
     * Modifie un produit
     * @param {Product} param - {id:string, name:string, stock:number, categoryId:string}
     * @returns {Product}
     */
    updateProduct({ id, name, price, stock, categoryId }) {
        const product = this.getProductById(id);
        if (!product) {
            throw new Error("updateProduct: product not found");
        }

        if (name !== undefined) {
            if (!name || !name.trim()) throw new Error("updateProduct: name is invalid");
            product.name = name.trim();
        }

        if (price !== undefined) {
            if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
                throw new Error("updateProduct: price is invalid");
            }
            product.price = price;
        }

        if (stock !== undefined) {
            if (!Number.isInteger(stock) || stock < 0) {
                throw new Error("updateProduct: stock is invalid");
            }
            product.stock = stock;
        }

        if (categoryId !== undefined) {
            if (!this.getCategoryById(categoryId)) {
                throw new Error("updateProduct: category does not exist");
            }
            product.categoryId = categoryId;
        }

        return product;
    }


    /**
     *
     * Supprimer un produit
     * @param {string} id
     * @returns {void}
     */
    deleteProduct(id) {
        const before = this.products.length;
        this.products = this.products.filter((p) => p.id !== id);

        if (this.products.length === before) {
            throw new Error("deleteProduct: product not found");
        }
    }

    ////////////////////////////////// Helpers //////////////////////////////////

    /**
     *
     * Mets à jour la quantité d'un produit dans le stock pour une id donnée
     * @param {string} productId
     * @param {number} stock
     * @returns {Product}
     */
    setStock(productId, stock) {
        if (!Number.isInteger(stock) || stock < 0) {
            throw new Error("setStock: stock must be >= 0");
        }

        const product = this.getProductById(productId);
        if (!product) {
            throw new Error("setStock: product not found");
        }

        product.stock = stock;
        return product;
    }


    /**
     *
     * Diminue la quantité d'un produit dans le stock pour une id donnée
     * @param {string} productId
     * @param {number} qty
     * @returns {Product}
     */
    decreaseStock(productId, qty) {
        if (!Number.isInteger(qty) || qty <= 0) {
            throw new Error("decreaseStock: qty must be > 0");
        }

        const product = this.getProductById(productId);
        if (!product) {
            throw new Error("decreaseStock: product not found");
        }

        if (product.stock < qty) {
            throw new Error("decreaseStock: insufficient stock");
        }

        product.stock -= qty;
        return product;
    }
}
