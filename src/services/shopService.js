import ShopRepository from '../dataaccess/repositories/shopRepository.js';

class ShopService {
    constructor() {
        this.shopRepository = ShopRepository;
    }

    async getShopList(page = 1, limit = 20) {
        const offset = (page - 1) * limit; // Calculate the offset
        return this.shopRepository.getShops(limit, offset); // Pass limit and offset to the repository
    }

    async getShop(id) {
        return this.shopRepository.getShop(id);
    }

    // async search() {

    // }

    // async booking() {

    // }
}

export default new ShopService();