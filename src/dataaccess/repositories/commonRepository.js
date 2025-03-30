import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../utils/database.js';
import { logInfo, logError, logDebug, logWarn } from '../../utils/logger.js';

class CommonRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            // 매퍼 XML 파일 경로 설정
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/commonMapper.xml'
            );
            logInfo('공통 매퍼 로드됨:', mapperPath);
            // 매퍼 생성
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            logError('공통 매퍼 초기화 실패:', err);
            throw err;
        }
    }

    async saveAuthCode(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'saveAuthCode',
                param,
                this.format
            );
            logDebug('인증 코드 저장', { email: param.email });
            const result = await db.execute(query);
            logInfo('인증 코드 저장 성공', { email: param.email });
            return result;
        } catch (err) {
            logWarn('인증 코드 저장 실패:', err);
            return { success: false, message: err.message };
        }
    }

    async selectAuthCode(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'selectAuthCode',
                param,
                this.format
            );
            logDebug('인증 코드 조회', { email: param.email });
            return await db.query(query);
        } catch (err) {
            logWarn('인증 코드 조회 실패:', err);
            return { success: false, message: err.message };
        }
    }

    async selectUserEmail(param) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'selectUserEmail',
                param,
                this.format
            );
            logDebug('사용자 이메일 조회', { email: param.email });
            return await db.query(query);
        } catch (err) {
            logWarn('사용자 이메일 조회 실패:', err);
            return { success: false, message: err.message };
        }
    }

    async updateUserPassword(param, connection) {
        try {
            const query = mybatisMapper.getStatement(
                'common',
                'updateUserPassword',
                param,
                this.format
            );
            
            logDebug('사용자 비밀번호 업데이트', { email: param.email });
            
            // 외부에서 제공된 connection이 있으면 사용, 아니면 db 객체 사용
            if (connection) {
                const result = await connection.query(query);
                return result[0];
            } else {
                return await db.execute(query);
            }
        } catch (err) {
            logWarn('사용자 비밀번호 업데이트 실패:', err);
            return { success: false, message: err.message };
        }
    }
}

export default new CommonRepository();