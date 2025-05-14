class SnapArtistModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.instagram = data.instagram;
    this.businessNumber = data.business_number;
    this.availableTime = data.available_time;
    this.mainImages = Array.isArray(data.main_images) ? data.main_images : (data.main_images ? data.main_images.split(',') : []);
    this.floorParking = data.floor_parking;
    this.equipment = data.equipment;
    this.shootGuide = data.shoot_guide;
    this.useGuide = data.use_guide;
    this.etc = data.etc;
    this.photographerCount = data.photographer_count;
    this.intro = data.intro;
    this.introImages = Array.isArray(data.intro_images) ? data.intro_images : (data.intro_images ? data.intro_images.split(',') : []);
    this.mainCategory = data.main_category;
    this.subCategories = Array.isArray(data.sub_categories) ? data.sub_categories : (data.sub_categories ? data.sub_categories.split(',') : []);
    this.adCategory = data.ad_category;
  }
}
export default SnapArtistModel; 