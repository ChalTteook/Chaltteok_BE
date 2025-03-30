import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../utils/database.js';
import { logInfo, logError, logDebug } from '../../utils/logger.js';

class ShopRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/shopMapper.xml'
            );
            logInfo('매장 매퍼 로드됨', { path: mapperPath });
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            logError('매장 레포지토리 초기화 실패', err);
            throw err;
        }
    }

    /**
     * 기본 상점 목록 조회
     */
    async getShops(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShops',
                { limit, offset },
                this.format
            );
            
            logDebug('상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴 매장 우선 노출 기본 상점 목록 조회
     */
    async getShopsWithPartnerPriority(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsWithPartnerPriority',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 우선 노출 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 우선 노출 상점 목록 조회 실패', err);
            throw err;
        }
    }
    
    /**
     * 제휴 매장만 조회
     */
    async getPartnerShops(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getPartnerShops',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 목록 조회 실패', err);
            throw err;
        }
    }
    
    /**
     * 특정 등급의 제휴 매장만 조회
     */
    async getPartnerShopsByLevel(level, limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getPartnerShopsByLevel',
                { level, limit, offset },
                this.format
            );
            
            logDebug('특정 등급 제휴 매장 목록 조회', { level, limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('특정 등급 제휴 매장 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 가격순으로 정렬된 상점 목록 조회
     */
    async getShopsSortedByPrice(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByPrice',
                { limit, offset },
                this.format
            );
            
            logDebug('가격순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('가격순 상점 목록 조회 실패', err);
            throw err;
        }
    }
    
    /**
     * 제휴 매장 우선 노출 + 가격순으로 정렬된 상점 목록 조회
     */
    async getShopsSortedByPriceWithPartnerPriority(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByPriceWithPartnerPriority',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 우선 가격순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 우선 가격순 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 리뷰 수 기준 정렬된 상점 목록 조회
     */
    async getShopsSortedByReviewCount(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByReviewCount',
                { limit, offset },
                this.format
            );
            
            logDebug('리뷰 수 기준 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('리뷰 수 기준 상점 목록 조회 실패', err);
            throw err;
        }
    }
    
    /**
     * 제휴 매장 우선 노출 + 리뷰 수 기준 정렬된 상점 목록 조회
     */
    async getShopsSortedByReviewCountWithPartnerPriority(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByReviewCountWithPartnerPriority',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 우선 리뷰 수 기준 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 우선 리뷰 수 기준 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 추천순으로 정렬된 상점 목록 조회
     */
    async getShopsSortedByRecommended(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByRecommended',
                { limit, offset },
                this.format
            );
            
            logDebug('추천순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('추천순 상점 목록 조회 실패', err);
            throw err;
        }
    }
    
    /**
     * 제휴 매장 우선 노출 + 추천순으로 정렬된 상점 목록 조회
     */
    async getShopsSortedByRecommendedWithPartnerPriority(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByRecommendedWithPartnerPriority',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 우선 추천순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 우선 추천순 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * ID로 매장 정보 조회
     */
    async getShop(id) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'findShopById',
                { id },
                this.format
            );
            
            logDebug('ID로 매장 정보 조회', { id });
            return await db.queryOne(query);
        } catch (err) {
            logError('ID로 매장 정보 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴 정보를 포함한 매장 정보 조회
     */
    async getShopWithPartnerInfo(id) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopWithPartnerInfo',
                { id },
                this.format
            );
            
            logDebug('제휴 정보 포함 매장 정보 조회', { id });
            return await db.queryOne(query);
        } catch (err) {
            logError('제휴 정보 포함 매장 정보 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴매장 테이블과 조인하여 상점 목록 조회 (제휴매장 우선)
     */
    async getShopsWithPartnerJoin(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsWithPartnerJoin',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 조인 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 조인 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴매장 테이블과 조인하여 가격순으로 정렬된 상점 목록 조회 (제휴매장 우선)
     */
    async getShopsWithPartnerJoinSortedByPrice(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsWithPartnerJoinSortedByPrice',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 조인 가격순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 조인 가격순 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴매장 테이블과 조인하여 리뷰순으로 정렬된 상점 목록 조회 (제휴매장 우선)
     */
    async getShopsWithPartnerJoinSortedByReview(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsWithPartnerJoinSortedByReview',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장 조인 리뷰순 상점 목록 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장 조인 리뷰순 상점 목록 조회 실패', err);
            throw err;
        }
    }

    /**
     * 제휴매장 테이블과 조인하여 제휴매장만 조회
     */
    async getPartnerShopsWithJoin(limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getPartnerShopsWithJoin',
                { limit, offset },
                this.format
            );
            
            logDebug('제휴 매장만 조인 조회', { limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('제휴 매장만 조인 조회 실패', err);
            throw err;
        }
    }
}

export default new ShopRepository();