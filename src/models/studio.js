class Shop {
    constructor(data) {
        this.id = data.id;
        this.interestId = data.interest_id;
        this.title = data.title;
        this.description = data.description;
        this.phoneNumber = data.phone_number;
        this.openTime = data.open_time;
        this.closeTime = data.close_time;
        this.address = data.address;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.parking = data.parking;
        this.floor = data.floor;
        this.price = data.price;
        this.img = data.img;
        this.regDate = data.reg_date;
        this.modDate = data.mod_date;
        
        // 정렬 관련 추가 데이터
        this.reviewCount = data.review_count || 0;
        this.totalLikes = data.total_likes || 0;
    }
}

export default Shop;