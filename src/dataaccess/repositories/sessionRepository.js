import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../utils/database.js';
import { logInfo, logError, logDebug } from '../../utils/logger.js';

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
            logInfo('세션 매퍼 로드됨', { path: mapperPath });
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            logError('세션 레포지토리 초기화 실패', err);
            throw err;
        }
    }

    async saveSession(userId, session) {
        try {
            // 세션 객체를 문자열로 변환
            const sessionStr = typeof session === 'object' ? JSON.stringify(session) : session;
            
            const query = mybatisMapper.getStatement(
                'session',    // namespace
                'saveSession', // sql id
                { userId, session: sessionStr },    // parameters
                this.format   // format
            );
            
            logDebug('사용자 세션 저장', { userId });
            await db.execute(query);
            logInfo('세션 저장 성공', { userId });
        } catch (err) {
            logError('사용자 세션 저장 실패', err);
            throw err;
        }
    }

    async findSession(userId) {
        try {
            const query = mybatisMapper.getStatement(
                'session',    // namespace
                'findSession', // sql id
                { userId },    // parameters
                this.format   // format
            );
            
            logDebug('사용자 세션 조회', { userId });
            return await db.queryOne(query);
        } catch (err) {
            logError('사용자 세션 조회 실패', err);
            throw err;
        }
    }
}

export default new SessionRepository();