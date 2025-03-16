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
        this.profileImage = data.profileImage || data.profile_image || null;
        this.regDate = data.regDate || data.reg_date || null;
        this.modDate = data.modDate || data.mod_date || null;
    }

    async verifyPassword(password) {
        try {
            // 비밀번호가 이미 해시된 경우
            if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
                return await bcrypt.compare(password, this.password);
            }
            // 임시 비밀번호인 경우 (is_retry가 1인 경우)
            else if (this.isRetry === 1) {
                return password === this.password;
            }
            // 기타 경우 (기본적으로 해시된 비밀번호와 비교)
            else {
                return await bcrypt.compare(password, this.password);
            }
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    async hashPassword() {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    async makeDefaultNickName() {
        if(this.id === null) {
            throw new Error('Invalid Id');
        }
        this.nickName = '찰떡' + this.id.padStart(6, 0);
    }

    async updateUserData(userData) {
        this.name = userData.name ?? this.name;
        this.age = userData.age ?? this.age;
        this.gender = userData.gender ?? this.gender;
        this.nickName = userData.nickName ?? this.nickName;
        this.phone = userData.phone ?? this.phone;
        this.address = userData.address ?? this.address;
        this.profileImage = userData.profileImage ?? this.profileImage;
        this.itPlc1 = userData.itPlc1 ?? this.itPlc1;
        this.itPlc2 = userData.itPlc2 ?? this.itPlc2;
        this.itPlc3 = userData.itPlc3 ?? this.itPlc3;
    }

    async updatePassword(password) {
        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(password, salt);

        // 임시 비밀번호 상태 리셋
        if (this.isRetry === 1) {
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
            profileImage: this.profileImage,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Constructor with args (static factory method)
    static from({id, type, email, password, name, age, gender, nickName, phone, address, socialId, profileImage, itPlc1, itPlc2, itPlc3, regDate, modDate}) {
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
        user.profileImage = profileImage;
        user.itPlc1 = itPlc1;
        user.itPlc2 = itPlc2;
        user.itPlc3 = itPlc3;
        user.regDate = regDate;
        user.modDate = modDate;
        return user;
    }
    
}

export default UserModel;