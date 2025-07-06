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
        const mapperPath = path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../mappers/shopMapper.xml'
        );
        try {
            console.log('Mapper loaded:', mapperPath);
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', mapperPath);
            throw err;
        }
    }

    async getShops(limit=0, offset=20) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'shop',
                'getShops',
                {},
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