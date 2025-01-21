

class UserRepository {
    constructor() {
        db = db.init();
        userMapper = userMapper.createMapper("userMapper");
    }

    async findById(id) {
        const user = await this.db.findUserById(id);
        return user;
    }
}

module.exports = UserRepository;