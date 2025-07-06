import path from 'path';
import { fileURLToPath } from 'url';
import UserRepository from '../dataaccess/repositories/userRepository.js';
import UserModel from '../models/userModel.js';

class UserService {
    constructor() {
        this.userRepository = UserRepository;
    }

    async findByEmail(email) {
        try {
            const userData = await this.userRepository.findByEmail(email);
            return userData ? new UserModel(userData) : null;
        } catch (error) {
            console.error('Error in findByEmail:', error);
            // Optionally, return a specific value or throw a custom error
            return null; // or throw new Error('Custom error message');
        }
    }

    async createUser(userModel) {
        try {
            const existingUser = await this.userRepository.findByEmail(userModel.email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            userModel.type = 'email';
            await userModel.hashPassword();
            const savedUser = await this.userRepository.createUser(userModel);
            return new UserModel(savedUser);
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    async findBySocialId(socialId) {
        try {
            const userData = await this.userRepository.findBySocialId(socialId);
            return userData ? new UserModel(userData) : null;
        } catch (error) {
            console.error('Error in findBySocialId:', error);
            return null;
        }
    }

    async createSocialUser(userModel) {
        try {
            return await this.userRepository.createUser(userModel);
        } catch (error) {
            console.error('Error in createSocialUser:', error);
            return null;
        }
    }

    async findById(id) {
        try {
            const userData = await this.userRepository.findById(id);
            return userData ? new UserModel(userData) : null;
        } catch (error) {
            console.error('Error in findById:', error);
            return null;
        }
    }

    async updateUser(userModel) {
        try {
            return await this.userRepository.updateUser(userModel);
        } catch (error) {
            console.error('Error in updateUser:', error);
            return null;
        }
    }

    async forgotPhoneNumber(param) {
        try {
            const max = 999999;
            const randomNumber = Math.floor(Math.random() * max).toString().padStart(6, '0');
            return randomNumber;
        } catch (error) {
            console.error('Error in forgotPhoneNumber:', error);
            return null;
        }
    }

    async changePassword(user, newPassword) {
        try {
            const changedUser = await user.updatePassword(newPassword);
            return await this.userRepository.updateUser(changedUser);
        } catch (error) {
            console.error('Error in changePassword:', error);
            return null;
        }
    }
    // 다른 사용자 관련 메서드 추가 가능
}

export default new UserService();