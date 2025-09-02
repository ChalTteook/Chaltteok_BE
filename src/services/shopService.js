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
     * @param {boolean} partnerOnly - 제휴 매장만 조회할지 여부
     * @param {number|null} partnerLevel - 특정 제휴 등급만 조회할 경우 해당 등급
     * @returns {Promise<Array>} 상점 목록
     */
    async getShopList(page = 1, limit = 20, sort = null, partnerOnly = false, partnerLevel = null) {
        const offset = (page - 1) * limit; // Calculate the offset
        
        let shops = [];
        
        // 제휴 매장만 조회하는 경우
        if (partnerOnly) {
            shops = await this.shopRepository.getPartnerShopsWithJoin(limit, offset);
        } else {
            // 일반 조회 (제휴 매장 + 일반 매장)
            // 정렬 옵션에 따라 다른 메서드 호출하되, 제휴 매장을 우선 노출
            if (sort) {
                switch (sort.toLowerCase()) {
                    case 'price':
                        shops = await this.shopRepository.getShopsWithPartnerJoinSortedByPrice(limit, offset);
                        break;
                    case 'review':
                        shops = await this.shopRepository.getShopsWithPartnerJoinSortedByReview(limit, offset);
                        break;
                    case 'recommended':
                        // 아직 recommendation 기준 조회가 구현되지 않았으므로 기본 제휴매장 우선 조회 사용
                        shops = await this.shopRepository.getShopsWithPartnerJoin(limit, offset);
                        break;
                    default:
                        shops = await this.shopRepository.getShopsWithPartnerJoin(limit, offset);
                }
            } else {
                // 정렬 옵션이 없는 경우 제휴 매장 우선 정렬
                shops = await this.shopRepository.getShopsWithPartnerJoin(limit, offset);
            }
        }
        
        return shops;
    }

    async getShop(id) {
        try {
            // 제휴매장 정보 포함하여 상점 조회
            const shop = await this.shopRepository.getShopWithPartnerInfo(id);
            console.log(`Shop with ID ${id} retrieved:`, shop ? 'Found' : 'Not found');
            return shop;
        } catch (error) {
            console.error(`Error retrieving shop with ID ${id}:`, error);
            throw error;
        }
    }

    // async search() {

    // }

    // async booking() {

    // }
}

export default new ShopService();