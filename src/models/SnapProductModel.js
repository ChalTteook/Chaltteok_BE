class SnapProductModel {
  constructor(data) {
    this.id = data.id;
    this.artistId = data.artist_id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.productImages = Array.isArray(data.product_images) ? data.product_images : (data.product_images ? data.product_images.split(',') : []);
  }
}
export default SnapProductModel; 