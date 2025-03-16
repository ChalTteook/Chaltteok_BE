/**
 * 리뷰 모델 클래스
 * 상점 리뷰 데이터 객체를 표현하는 모델 클래스입니다.
 */
class ReviewModel {
  constructor(data) {
    this.id = data.id || null;
    this.shopId = data.shop_id;
    this.shopPrdId = data.shop_prd_id;
    this.userId = data.user_id;
    this.description = data.description;
    this.img1 = data.img_1 || null;
    this.img2 = data.img_2 || null;
    this.img3 = data.img_3 || null;
    this.img4 = data.img_4 || null;
    this.img5 = data.img_5 || null;
    this.likeCount = data.like_count || 0;
    this.regDate = data.reg_date || null;
    this.modDate = data.mod_date || null;
    
    // 표시용 추가 정보 (JOIN 쿼리 결과 포함)
    this.userName = data.user_name || null;
    this.userProfileImage = data.user_profile_image || null;
  }
}

export default ReviewModel; 