import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../utils/database.js';
import SnapArtistModel from '../models/SnapArtistModel.js';
import SnapProductModel from '../models/SnapProductModel.js';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mybatisMapper.createMapper([
  path.join(__dirname, '../dataaccess/mappers/snapArtistMapper.xml')
]);

// 배열/문자열 안전 변환 유틸
function arrToString(val) {
  if (Array.isArray(val)) return val.join(',');
  if (typeof val === 'string') return val;
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'object') return JSON.stringify(val);
  return '';
}

class SnapArtistService {
  constructor() {
    this.format = { language: 'sql', indent: '  ' };
  }

  // 스냅작가 등록
  async createSnapArtist(data) {
    let param = null;
    try {
      // param 생성 직전 상세 로그
      console.log('[param 생성전] mainImages:', data.mainImages, 'main_images:', data.main_images);
      console.log('[param 생성전] introImages:', data.introImages, 'intro_images:', data.intro_images);
      console.log('[param 생성전] subCategories:', data.subCategories, 'sub_categories:', data.sub_categories);
      param = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        instagram: data.instagram,
        business_number: data.businessNumber || data.business_number,
        available_time: data.availableTime || data.available_time,
        main_images: arrToString(data.mainImages || data.main_images),
        floor_parking: data.floorParking || data.floor_parking,
        equipment: data.equipment,
        shoot_guide: data.shootGuide || data.shoot_guide,
        use_guide: data.useGuide || data.use_guide,
        etc: data.etc,
        photographer_count: data.photographerCount || data.photographer_count,
        intro: data.intro,
        intro_images: arrToString(data.introImages || data.intro_images),
        main_category: data.mainCategory || data.main_category,
        sub_categories: arrToString(data.subCategories || data.sub_categories),
        ad_category: data.adCategory || data.ad_category
      };
      console.log('SnapArtist param:', JSON.stringify(param));
    } catch (err) {
      throw new Error('[param 생성] ' + err.message + ' | data=' + JSON.stringify(data));
    }
    try {
      // 실제 쿼리 실행
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'createSnapArtist', param, this.format);
      const result = await db.query(query);
      const id = result.insertId || (result[0] && result[0].insertId);
      logInfo('스냅작가 등록 성공', { id });
      return this.getSnapArtistById(id);
    } catch (err) {
      throw new Error('[쿼리 실행] ' + err.message + ' | param=' + JSON.stringify(param));
    }
  }

  // 스냅작가 목록 조회
  async getSnapArtists(category = null) {
    try {
      const param = {};
      if (category) param.category = category;
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'getSnapArtists', param, this.format);
      const results = await db.query(query);
      return results.map(row => new SnapArtistModel(row));
    } catch (error) {
      logError('스냅작가 목록 조회 오류', error);
      throw error;
    }
  }

  // 스냅작가 상세 조회
  async getSnapArtistById(id) {
    try {
      const param = { id };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'getSnapArtistById', param, this.format);
      const result = await db.queryOne(query);
      if (!result) return null;
      return new SnapArtistModel(result);
    } catch (error) {
      logError('스냅작가 상세 조회 오류', error);
      throw error;
    }
  }

  // 스냅작가 수정
  async updateSnapArtist(id, data) {
    try {
      // 기존 데이터 조회
      const existing = await this.getSnapArtistById(id);
      if (!existing) throw new Error('해당 작가가 존재하지 않습니다.');
      // 기존 데이터와 병합
      const merged = { ...existing, ...data };
      const param = {
        id,
        name: merged.name,
        phone: merged.phone,
        email: merged.email,
        instagram: merged.instagram,
        business_number: merged.businessNumber || merged.business_number,
        available_time: merged.availableTime || merged.available_time,
        main_images: arrToString(merged.mainImages || merged.main_images),
        floor_parking: merged.floorParking || merged.floor_parking,
        equipment: merged.equipment,
        shoot_guide: merged.shootGuide || merged.shoot_guide,
        use_guide: merged.useGuide || merged.use_guide,
        etc: merged.etc,
        photographer_count: merged.photographerCount || merged.photographer_count,
        intro: merged.intro,
        intro_images: arrToString(merged.introImages || merged.intro_images),
        main_category: merged.mainCategory || merged.main_category,
        sub_categories: arrToString(merged.subCategories || merged.sub_categories),
        ad_category: merged.adCategory || merged.ad_category
      };
      console.log('[update param]', JSON.stringify(param));
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'updateSnapArtist', param, this.format);
      await db.execute(query);
      logInfo('스냅작가 수정 성공', { id });
      return this.getSnapArtistById(id);
    } catch (error) {
      logError('스냅작가 수정 오류', error);
      throw error;
    }
  }

  // 스냅작가 삭제
  async deleteSnapArtist(id) {
    try {
      const param = { id };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'deleteSnapArtist', param, this.format);
      await db.execute(query);
      logInfo('스냅작가 삭제 성공', { id });
      return true;
    } catch (error) {
      logError('스냅작가 삭제 오류', error);
      throw error;
    }
  }

  // ===== 상품 =====

  // 상품 등록
  async createSnapProduct(artistId, data) {
    try {
      // product_images 타입/값 로그
      console.log('[createSnapProduct] product_images typeof:', typeof data.product_images, 'value:', data.product_images);
      let productImages = data.product_images || data.productImages;
      if (productImages === undefined || productImages === null) productImages = '';
      const param = {
        artist_id: artistId,
        name: data.name,
        description: data.description,
        price: data.price,
        product_images: arrToString(productImages)
      };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'createSnapProduct', param, this.format);
      console.log('[createSnapProduct] param:', JSON.stringify(param));
      console.log('[createSnapProduct] query:', query);
      const [result] = await db.query(query);
      const id = result.insertId;
      logInfo('스냅작가 상품 등록 성공', { id, artistId });
      return this.getSnapProductById(artistId, id);
    } catch (error) {
      logError('스냅작가 상품 등록 오류', error);
      throw error;
    }
  }

  // 상품 목록 조회
  async getSnapProductsByArtistId(artistId) {
    try {
      const param = { artist_id: artistId };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'getSnapProductsByArtistId', param, this.format);
      const results = await db.query(query);
      return results.map(row => new SnapProductModel(row));
    } catch (error) {
      logError('스냅작가 상품 목록 조회 오류', error);
      throw error;
    }
  }

  // 상품 상세 조회
  async getSnapProductById(artistId, productId) {
    try {
      const param = { artist_id: artistId, id: productId };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'getSnapProductById', param, this.format);
      const result = await db.queryOne(query);
      if (!result) return null;
      return new SnapProductModel(result);
    } catch (error) {
      logError('스냅작가 상품 상세 조회 오류', error);
      throw error;
    }
  }

  // 상품 수정
  async updateSnapProduct(artistId, productId, data) {
    try {
      const param = { artist_id: artistId, id: productId, ...data };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'updateSnapProduct', param, this.format);
      await db.execute(query);
      logInfo('스냅작가 상품 수정 성공', { artistId, productId });
      return this.getSnapProductById(artistId, productId);
    } catch (error) {
      logError('스냅작가 상품 수정 오류', error);
      throw error;
    }
  }

  // 상품 삭제
  async deleteSnapProduct(artistId, productId) {
    try {
      const param = { artist_id: artistId, id: productId };
      const query = mybatisMapper.getStatement('SnapArtistMapper', 'deleteSnapProduct', param, this.format);
      await db.execute(query);
      logInfo('스냅작가 상품 삭제 성공', { artistId, productId });
      return true;
    } catch (error) {
      logError('스냅작가 상품 삭제 오류', error);
      throw error;
    }
  }
}

export default new SnapArtistService(); 