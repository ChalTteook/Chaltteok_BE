class Report {
    constructor(data) {
        this.id = data.id;
        this.targetType = data.target_type;
        this.targetId = data.target_id;
        this.userId = data.user_id;
        this.reportType = data.report_type;
        this.description = data.description;
        this.status = data.status || 'pending';
        this.adminComment = data.admin_comment;
        this.reviewedBy = data.reviewed_by;
        this.regDate = data.reg_date;
        this.modDate = data.mod_date;
        
        // 조인 데이터
        this.userName = data.user_name;
        this.userProfileImage = data.user_profile_image;
        this.targetTitle = data.target_title;
        this.reviewerName = data.reviewer_name;
    }
}

export default Report; 