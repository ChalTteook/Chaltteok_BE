import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../utils/database.js';

class SessionRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            // 매퍼 XML 파일 경로 설정
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/userSessionMapper.xml'
            );
            console.log('Mapper loaded:', mapperPath);
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', mapperPath);
            throw err;
        }
    }

    async saveSession(userId, session) {
        const connection = await pool.getConnection();
        try {
            const query =  mybatisMapper.getStatement(
                'session',    // namespace
                'saveSession', // sql id
                { userId, session },    // parameters
                this.format   // format
            );
            await connection.query(query);
        } catch (err) {
            console.error('Failed to save user session:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async findSession(userId) {
        const connection = await pool.getConnection();
        try {
            const query =  mybatisMapper.getStatement(
                'session',    // namespace
                'findSession', // sql id
                { userId },    // parameters
                this.format   // format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.error('Failed to save user session:', err, userId, query);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default SessionRepository;