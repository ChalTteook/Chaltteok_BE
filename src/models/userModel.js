import bcrypt from 'bcryptjs';

class UserModel {

    constructor(data) {
        this.id = data.id || null;
        this.type = data.type || null;
        this.email = data.email || null;
        this.password = data.password || null;
        this.isRetry = data.isRetry || data.is_retry || 0;
        this.name = data.name || '';
        this.age = data.age || null;
        this.gender = data.gender || null;
        this.nickName = data.nickName || data.nick_name || null;
        this.phone = data.phone || '';
        this.address = data.address || '';
        this.socialId = data.socialId || data.social_id || null;
        this.regDate = data.regDate || data.reg_date || null;
        this.modDate = data.modDate || data.mod_date || null;
    }

    async verifyPassword(password) {
        if(!this.isRetry) {
            return await bcrypt.compare(password, this.password);
        } else {
            return password === this.password;
        }
    }

    async hashPassword() {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    async updateUserData(userData) {
        this.name = userData.name ?? this.name;
        this.age = userData.age ?? this.age;
        this.gender = userData.gender ?? this.gender;
        this.nickName = userData.nickName ?? this.nickName;
        this.phone = userData.phone ?? this.phone;
        this.address = userData.address ?? this.address;
        this.itPlc1 = userData.itPlc1 ?? this.itPlc1;
        this.itPlc2 = userData.itPlc2 ?? this.itPlc2;
        this.itPlc3 = userData.itPlc3 ?? this.itPlc3;
    }

    async updatePassword(password) {

        this.password = password;

        await this.hashPassword();

        if ( this.isRetry === 1 ) {
            this.isRetry = 0;
        }

        return this;
    }

    // Convert to JSON for API responses (excluding sensitive data)
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            email: this.email,
            password: this.password,
            name: this.name,
            age: this.age,
            gender: this.gender,
            nickName: this.nickName,
            phone: this.phone,
            address: this.address,
            socialId: this.socialId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Constructor with args (static factory method)
    static from({id, type, email, password, name, age, gender, nickName, phone, address, socialId, itPlc1, itPlc2, itPlc3, regDate, modDate}) {
        const user = new UserModel();
        user.id = id;
        user.type = type;
        user.email = email;
        user.password = password;
        user.name = name;
        user.age = age;
        user.gender = gender;
        user.nickName = nickName;
        user.phone = phone;
        user.address = address;
        user.socialId = socialId;
        user.itPlc1 = itPlc1;
        user.itPlc2 = itPlc2;
        user.itPlc3 = itPlc3;
        user.regDate = regDate;
        user.modDate = modDate;
        return user;
    }
    
}

export default UserModel;