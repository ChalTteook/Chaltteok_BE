
import nodemailer from 'nodemailer';
import CommonRepository from '../dataaccess/repositories/commonRepository.js';
import dotenv from 'dotenv';
import { pool } from '../utils/database.js';
 
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

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            /* 문자열 */
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
            let result = '';
            const charactersLength = characters.length;

            /* 8자리 랜덤 뽑기 */
            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * charactersLength);
                result += characters.charAt(randomIndex);
            }
                        
            const transporter = nodemailer.createTransport({
                service: 'gmail', // 지메일 쓰면 됨
                auth: {
                    user: process.env.SERVER_USER_MAIL, // 보낼 email 주소
                    pass: process.env.SERVER_USER_APP_PASSWORD, // 이메일 앱 비밀번호 ㄱㄱ
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

            var param = {
                new_password : result,
                email : body.email
            }

            /* 비밀번호 상태 업데이트 쿼리 */
            await this.commonRepository.updateUserPassword(param, connection)

            await connection.commit();
            return { success: true, message: 'SUCCESS'};

        } catch(error) { 
            await connection.rollback();
            return {
                success : false,
                message: error,
            };
        } finally {
            await connection.release();
        }
    }

}

export default new CommonService();