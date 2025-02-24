import ShopRepository from '../dataaccess/repositories/shopRepository.js';

class ShopService {
    constructor() {
        this.shopRepository = ShopRepository;
    }

    async getShopList(limit, offset) {
        return this.shopRepository.getShops(parseInt(limit, 10), parseInt(offset, 10));
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