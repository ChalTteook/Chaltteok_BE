class UserModel {
    // No-args constructor
    constructor() {
        this.id = null;
        this.password = '';
        this.authId = 1000;
        this.username = '';
        this.email = '';
        this.phone = '';
        this.address = '';
        this.socialId = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Constructor with args (static factory method)
    static from({id, username, email, password, createdAt = new Date(), updatedAt = new Date()}) {
        const user = new UserModel();
        user.id = id;
        user.username = username;
        user.email = email;
        user.password = password;
        user.createdAt = createdAt;
        user.updatedAt = updatedAt;
        return user;
    }

    // Basic validation method
    validate() {
        if (!this.email || !this.email.includes('@')) {
            throw new Error('Invalid email');
        }
        if (!this.username || this.username.length < 3) {
            throw new Error('Username must be at least 3 characters');
        }
        if (!this.password || this.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
    }

    // Convert to JSON for API responses (excluding sensitive data)
    toJSON() {
        return {
            id: this.id,
            password: this.password,
            authID: this.authId,
            username: this.username,
            email: this.email,
            phone: this.phone,
            address: this.address,
            socialId: this.socialId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default UserModel;