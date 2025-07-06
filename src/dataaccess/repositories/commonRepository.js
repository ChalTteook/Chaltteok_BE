import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../utils/database.js';

class CommonRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        // 매퍼 XML 파일 경로 설정
        const mapperPath = path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../mappers/commonMapper.xml'
        );
        try {
            console.log('Mapper loaded:', mapperPath);
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', mapperPath);
            throw err;
        }
    }

    async saveAuthCode(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'saveAuthCode',
                param, // Pass id as an object
                this.format
            );
            const [result] = await pool.query(query);
            return result.length > 0 ? result[0] : null; // Return user data
        } catch (err) {
            return { success: true, message: err};
        }
    }

    async selectAuthCode(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'selectAuthCode',
                param, // Pass id as an object
                this.format
            );
            const [result] = await pool.query(query);
            return result; // Return user data
        } catch (err) {
            return { success: true, message: err};
        }
    }

    async selectUserEmail(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'selectUserEmail',
                param, // Pass id as an object
                this.format
            );
            const [result] = await pool.query(query);
            return result; // Return user data
        } catch (err) {
            return { success: true, message: err};
        }
    }

    async updateUserPassword(param, connection) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'updateUserPassword',
                param, // Pass id as an object
                this.format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null; // Return user data
        } catch (err) {
            return { success: true, message: err};
        }
    }

}

export default new CommonRepository();