import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../utils/database.js';

class StudioRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            // 매퍼 XML 파일 경로 설정
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/studioMapper.xml'
            );
            console.log('Mapper loaded:', mapperPath);
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', mapperPath);
            throw err;
        }
    }

    async getStudios(limit=0, offset=20) {
        const parsedLimit = Number(limit);
        const parsedOffset = Number(offset); 
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'studio',
                'getStudios',
                {},
                this.format
            );
            const [result] = await connection.query(query);
            return result; 
        } catch (err) {
            console.error('Failed to get stuidos:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async getStudio(id) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'studio',
                'findStudioById',
                { id },
                this.format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null; 
        } catch (err) {
            console.error('Failed to find studio by id:', err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default StudioRepository;