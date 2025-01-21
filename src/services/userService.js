import Database from '../utils/database.js';
import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';

class UserService {
    constructor() {
        this.pool = null;
        this.userMapper = null;
        this.initialize();
    }

    async initialize() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // 절대 경로로 변경
        const mapperPath = path.join(__dirname, '..', 'dataaccess', 'mappers', 'userMapper.xml');
        console.log('Mapper Path:', mapperPath); // 경로 확인용
        mybatisMapper.createMapper([mapperPath]);
        // this.userMapper = mybatisMapper.createMapper([ '../dataaccess/mappers/userMapper.xml' ]);
        try {
            this.pool = await Database.init();
            const connection = await Database.connect();  // connection 테스트
            // connection.release();
        } catch (err) {
            console.error('Failed to initialize database connection:', err);
            throw err;
        }
    }

    async findUserById(userId) {
        try {
            const connection = await this.pool.getConnection();
            try {
                // 실제 쿼리 로직 구현 예시
                // const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
                // return rows[0];
            } finally {
                connection.release(); // 연결을 반드시 반환
            }
        } catch (err) {
            console.error('Error in findUserById:', err);
            throw err;
        }
    }

    async createUser(userModel) {
        try {
            const connection = await this.pool.getConnection();
            try {
                const format = {language: 'sql', indent: '  '};
                const query = mybatisMapper.getStatement('user', 'insertUser', userModel, format);
                // query와 values를 올바르게 전달
                const [result] = await connection.query(query);
                return result;
            } catch (err) {
                // 에러 타입에 따른 응답 생성
                let errorResponse = {
                    success: false,
                    data: null,
                    message: '알 수 없는 오류가 발생했습니다.'
                };

                if (err.code === 'ER_DUP_ENTRY') {
                    errorResponse.message = '이미 존재하는 이메일입니다.';
                } else if (err.code === 'ER_WRONG_VALUE_COUNT_ON_ROW') {
                    errorResponse.message = '입력값이 올바르지 않습니다.';
                } else if (err.code === 'ER_NO_SUCH_TABLE') {
                    errorResponse.message = '데이터베이스 테이블이 존재하지 않습니다.';
                } else if (err.code === 'ECONNREFUSED') {
                    errorResponse.message = '데이터베이스 연결에 실패했습니다.';
                }
                console.log(errorResponse);
                return errorResponse;
            } finally {
                connection.release();
            }
        } catch (err) {
            console.error('Error in createUser:', err);
            throw err;
        }
    }
}

export default new UserService();