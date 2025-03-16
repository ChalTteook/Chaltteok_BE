/**
 * 댓글 모델 클래스
 * 댓글 데이터 객체를 표현하는 모델 클래스입니다.
 */
class CommentModel {
  constructor(data) {
    this.id = data.id || null;
    this.reviewId = data.reviewId;
    this.userId = data.userId;
    this.content = data.content;
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;

    // 표시용 추가 정보 (JOIN 쿼리 결과 포함)
    this.userName = data.userName || null;
    this.userProfileImage = data.userProfileImage || null;
  }
}

export default CommentModel; 