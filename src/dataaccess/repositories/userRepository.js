import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../utils/database.js';
import { logInfo, logError, logDebug } from '../../utils/logger.js';

class UserRepository {
    constructor() {
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
            logInfo('사용자 매퍼 로드됨', { path: mapperPath });
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            logError('사용자 레포지토리 초기화 실패', err);
            throw err;
        }
    }

    async findById(id) {
        try {
            const query = mybatisMapper.getStatement(
                'user',
                'findUserById',
                { id }, // Pass id as an object
                this.format
            );
            
            logDebug('사용자 ID로 조회', { id, query });
            return await db.queryOne(query);
        } catch (err) {
            logError('ID로 사용자 조회 실패', err);
            throw err;
        }
    }

    async findByEmail(email) {
        try {
            const query = mybatisMapper.getStatement(
                'user',    // namespace
                'findUserByEmail', // sql id
                { email },    // parameters를 객체 형태로 전달
                this.format   // format
            );
            
            logDebug('이메일로 사용자 조회', { email });
            return await db.queryOne(query);
        } catch (err) {
            logError('이메일로 사용자 조회 실패', err);
            throw err;
        }
    }

    async findBySocialId(socialId) {
        try {
            const query = mybatisMapper.getStatement(
                'user',
                'findUserBySocialId',
                { socialId },
                this.format
            );
            
            logDebug('소셜 ID로 사용자 조회', { socialId });
            return await db.queryOne(query);
        } catch (err) {
            logError('소셜 ID로 사용자 조회 실패', err);
            throw err;
        }
    }

    async createUser(userModel) {
        try {
            const query = mybatisMapper.getStatement(
                'user',
                'insertUser',
                userModel,
                this.format
            );
            
            logDebug('사용자 생성 시작', { userModel });
            const insertId = await db.insert(query);
            logInfo('사용자 생성 성공', { userId: insertId });
            
            return { insertId };
        } catch (err) {
            logError('사용자 생성 실패', err);
            throw err;
        }
    }

    async updateUser(userModel) {
        try {
            const query = mybatisMapper.getStatement(
                'user',    // namespace
                'updateUser', // sql id
                userModel,    // parameters
                this.format   // format
            );
            
            logDebug('사용자 정보 업데이트', { userId: userModel.id });
            const affectedRows = await db.execute(query);
            
            if (affectedRows > 0) {
                logInfo('사용자 업데이트 성공', { userId: userModel.id });
                return { success: true, message: '사용자 정보가 성공적으로 업데이트되었습니다' };
            } else {
                logDebug('사용자 업데이트 실패 (영향 받은 행 없음)', { userId: userModel.id });
                return { success: false, message: '사용자 정보 업데이트에 실패했습니다' };
            }
        } catch (err) {
            logError('사용자 업데이트 실패', err);
            throw err;
        }
    }
}

export default new UserRepository();