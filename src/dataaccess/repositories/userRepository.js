// import Database from '../../utils/database.js';
import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../../utils/database.js';

class UserRepository {
    constructor() {
        // pool = null;
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            // 매퍼 XML 파일 경로 설정
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/userMapper.xml'
            );
            console.log('Mapper Path:', mapperPath);
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            console.error('Failed to initialize:', err);
            throw err;
        }
    }

    async findById(id) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'user',
                'findUserById',
                { id }, // Pass id as an object
                this.format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null; // Return user data
        } catch (err) {
            console.error('Failed to find user by id:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async findByEmail(email) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'user',    // namespace
                'findUserByEmail', // sql id
                { email },    // parameters를 객체 형태로 전달
                this.format   // format
            );
            const [result] = await connection.query(query);
        
            // 결과가 존재하면 UserModel 인스턴스 반환
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.error('Failed to find user by email:', err);
            throw err;
        } finally {
            await connection.release();
        }
    }

    async findBySocialId(socialId) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'user',
                'findUserBySocialId',
                { socialId },
                this.format
            );
            const [result] = await connection.query(query);
            return result.length > 0 ? result[0] : null; // UserModel 인스턴스가 아닌 데이터만 반환
        } catch (err) {
            console.error('Failed to find user by social ID:', err);
            throw err;
        } finally {
            connection.release();
        }
    }

    async createUser(userModel) {
        try {
            const connection = await pool.getConnection();
            try {
                const query = mybatisMapper.getStatement(
                    'user',    // namespace
                    'insertUser', // sql id
                    userModel,    // parameters
                    this.format   // format
                );
                console.log('Generated SQL:', query);
                
                const [result] = await connection.query(query);
                return {
                    success: true,
                    data: result,
                    message: '사용자가 성공적으로 생성되었습니다.'
                };
            } catch (err) {
                // 에러 타입에 따른 응답 생성
                let errorResponse = {
                    success: false,
                    data: err,
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

    async updateUser(userModel) {
        const connection = await pool.getConnection();
        try {
            const query = mybatisMapper.getStatement(
                'user',    // namespace
                'updateUser', // sql id
                userModel,    // parameters
                this.format   // format
            );
            await connection.query(query);
            return { success: true, message: 'User updated successfully' };
        } catch (err) {
            console.error('Error in updateUser:', err);
            throw err;
        } finally {
            connection.release();
        }
    }
}

export default new UserRepository();