import nodemailer from 'nodemailer';
import CommonRepository from '../dataaccess/repositories/commonRepository.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from '../utils/database.js';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';

dotenv.config();

class CommonService {
    constructor() {
        this.commonRepository = CommonRepository;
    }

    async sendAuthCode(body) {

        let data = {};

        var param = {
            phone_number : body.phone_number
        };
    
        try {

            const max = 999999;
            const randomNumber = Math.floor(Math.random() * max).toString().padStart(6, '0');

            param.auth_code = randomNumber

            await this.commonRepository.saveAuthCode(param)

            data.phone_number = body.phone_number
            data.code = randomNumber
            
            return { success: true, message: data};
        } catch(error) { 
            return {
                success : false,
                message: error,
            };
        };

    }

    async checkAuthCode(body) {

        let data = {};

        var param = {
            phone_number : body.phone_number,
            code : body.code
        };
    
        try {
            const user = await this.commonRepository.selectAuthCode(param)
            
            /* 인증실패 */
            if(user.length < 1) {
                return { success: false, message: 'do_not_match_code & do_not_match_user'};
            }

            /* 인증성공 */
            param.phone = user.phone
            const user_email = await this.commonRepository.selectUserEmail(param)

            if(user_email.length < 1) {
                return { success: false, message: 'not_found_user_email'};
            }

            data.type = user_email.type
            data.phone = user_email.phone
            data.email = user_email.email

            return { success: true, message: data};

        } catch(error) { 
            return {
                success : false,
                message: error,
            };
        };
    }
    
    async sendEmail(body) {
        try {
            // 문자열 생성
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
            let result = '';
            const charactersLength = characters.length;

            // 8자리 랜덤 비밀번호 생성
            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * charactersLength);
                result += characters.charAt(randomIndex);
            }
            
            logDebug('임시 비밀번호 생성 완료', { email: body.email });

            // 이메일 송신 설정
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SERVER_USER_MAIL,
                    pass: process.env.SERVER_USER_APP_PASSWORD,
                },
            });
        
            // 이메일 옵션 설정
            const mailOptions = {
                from: process.env.SERVER_USER_MAIL,
                to: body.email,
                subject: 'Chaltteok Auth Code',
                text: `안녕하세요. 새로운 비밀번호 입니다 : ${result}`,
            };
        
            // 이메일 전송
            await transporter.sendMail(mailOptions);
            logInfo('임시 비밀번호 이메일 발송 완료', { email: body.email });

            // 비밀번호 해싱
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(result, salt);

            // 트랜잭션으로 비밀번호 업데이트
            return await db.transaction(async (connection) => {
                var param = {
                    new_password: hashedPassword,
                    email: body.email
                };

                // 비밀번호 상태 업데이트 쿼리
                await this.commonRepository.updateUserPassword(param, connection);
                logInfo('사용자 비밀번호 업데이트 완료', { email: body.email });
                
                return { success: true, message: 'SUCCESS' };
            });
        } catch (error) {
            logError('비밀번호 재설정 프로세스 실패', error);
            return {
                success: false,
                message: error.message || '비밀번호 재설정 중 오류가 발생했습니다.'
            };
        }
    }

}

export default new CommonService();