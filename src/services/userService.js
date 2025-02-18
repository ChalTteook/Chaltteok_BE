import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import UserRepository from '../dataaccess/repositories/userRepository.js';
import UserModel from '../models/userModel.js';

class UserService {
    constructor() {
        this.userRepository = UserRepository;
    }

    async findByEmail(email) {
        const userData = await this.userRepository.findByEmail(email);
        return userData ? new UserModel(userData) : null;
    }

    async createUser(userModel) {
        // 이메일로 사용자가 존재하는지 확인
        const existingUser = await this.userRepository.findByEmail(userModel.email);
        
        // 사용자가 존재하지 않을 경우에만 생성
        if (existingUser) {
            throw new Error('User already exists');
        }

        // 유저 타입 지정
        userModel.type = 'email';

        // 비밀번호 해시화
        await userModel.hashPassword();
        
        // 사용자 생성
        return this.userRepository.createUser(userModel);
    }

    async findBySocialId(socialId) {
        const userData = await this.userRepository.findBySocialId(socialId);
        return userData ? new UserModel(userData) : null;
    }

    async createSocialUser(userModel) {        
        // 사용자 생성
        return this.userRepository.createUser(userModel);
    }

    async findById(id) {
        const userData = await this.userRepository.findById(id);
        return userData ? new UserModel(userData) : null;
    }

    async updateUser(userModel) {
        return this.userRepository.updateUser(userModel);
    }

    async forgotPhoneNumber(param) {

        const max = 999999;
        const randomNumber = Math.floor(Math.random() * max).toString().padStart(6, '0');
        // console.log(randomNumber);
        return randomNumber
    }

    async changePassword(user, newPassword) {
        const changedUser = await user.updatePassword( newPassword );
        this.userRepository.updateUser(changedUser);
    }
    // 다른 사용자 관련 메서드 추가 가능
}

export default new UserService();