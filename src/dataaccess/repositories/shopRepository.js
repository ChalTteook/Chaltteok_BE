import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../utils/database.js';

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
            console.log('Mapper loaded:', mapperPath);
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', mapperPath);
            throw err;
        }
    }

    /**
     * 기본 상점 목록 조회
     */
    async getShops(limit = 20, offset = 0) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShops',
                { limit, offset },
                this.format
            );
            const [result] = await connection.query(query);
            return result; 
        } catch (err) {
            console.error('Failed to get shops:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    /**
     * 가격순으로 정렬된 상점 목록 조회
     */
    async getShopsSortedByPrice(limit = 20, offset = 0) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByPrice',
                { limit, offset },
                this.format
            );
            const [result] = await connection.query(query);
            return result; 
        } catch (err) {
            console.error('Failed to get shops sorted by price:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    /**
     * 리뷰 수 기준 정렬된 상점 목록 조회
     */
    async getShopsSortedByReviewCount(limit = 20, offset = 0) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByReviewCount',
                { limit, offset },
                this.format
            );
            const [result] = await connection.query(query);
            return result; 
        } catch (err) {
            console.error('Failed to get shops sorted by review count:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    /**
     * 추천순으로 정렬된 상점 목록 조회 (리뷰 좋아요 합계 기준)
     */
    async getShopsSortedByRecommended(limit = 20, offset = 0) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShopsSortedByRecommended',
                { limit, offset },
                this.format
            );
            const [result] = await connection.query(query);
            return result; 
        } catch (err) {
            console.error('Failed to get shops sorted by recommended:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async getShop(id) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'findShopById',
                { id },
                this.format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null; 
        } catch (err) {
            console.error('Failed to find shop by id:', err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default new ShopRepository();