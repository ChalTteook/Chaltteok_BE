import ShopRepository from '../dataaccess/repositories/shopRepository.js';

class ShopService {
    constructor() {
        this.shopRepository = ShopRepository;
    }

    /**
     * 상점 목록 조회
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @param {string} sort - 정렬 기준 (price: 가격순, review: 리뷰순, recommended: 추천순)
     * @returns {Promise<Array>} 상점 목록
     */
    async getShopList(page = 1, limit = 20, sort = null) {
        const offset = (page - 1) * limit; // Calculate the offset
        
        // 정렬 옵션에 따라 다른 메서드 호출
        if (sort) {
            switch (sort.toLowerCase()) {
                case 'price':
                    return this.shopRepository.getShopsSortedByPrice(limit, offset);
                case 'review':
                    return this.shopRepository.getShopsSortedByReviewCount(limit, offset);
                case 'recommended':
                    return this.shopRepository.getShopsSortedByRecommended(limit, offset);
                default:
                    return this.shopRepository.getShops(limit, offset);
            }
        }
        
        return this.shopRepository.getShops(limit, offset); // 정렬 옵션이 없는 경우 기본 메서드 호출
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