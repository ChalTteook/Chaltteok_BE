import express from 'express';
import SnapArtistService from '../services/snapArtistService.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// 스냅작가 등록
router.post('/', isAdmin, async (req, res) => {
  try {
    const result = await SnapArtistService.createSnapArtist(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // param, 주요 필드 타입/값을 포함하여 반환
    res.status(500).json({
      success: false,
      message: error.message,
      param: req.body,
      type_mainImages: typeof req.body.mainImages,
      type_main_images: typeof req.body.main_images,
      type_introImages: typeof req.body.introImages,
      type_intro_images: typeof req.body.intro_images,
      type_subCategories: typeof req.body.subCategories,
      type_sub_categories: typeof req.body.sub_categories
    });
  }
});

// 스냅작가 목록 조회
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const artists = await SnapArtistService.getSnapArtists(category);
    res.json({ success: true, data: artists });
  } catch (error) {
    console.error('스냅작가 목록 조회 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 스냅작가 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const artist = await SnapArtistService.getSnapArtistById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: '스냅작가를 찾을 수 없습니다.' });
    res.json({ success: true, data: artist });
  } catch (error) {
    console.error('스냅작가 상세 조회 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 스냅작가 수정
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const artist = await SnapArtistService.updateSnapArtist(req.params.id, req.body);
    res.json({ success: true, data: artist });
  } catch (error) {
    console.error('스냅작가 수정 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 스냅작가 삭제
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await SnapArtistService.deleteSnapArtist(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('스냅작가 삭제 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== 상품 =====

// 상품 등록
router.post('/:artistId/products', isAdmin, async (req, res) => {
  try {
    const product = await SnapArtistService.createSnapProduct(req.params.artistId, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('스냅작가 상품 등록 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 상품 목록 조회
router.get('/:artistId/products', async (req, res) => {
  try {
    const products = await SnapArtistService.getSnapProductsByArtistId(req.params.artistId);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('스냅작가 상품 목록 조회 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 상품 상세 조회
router.get('/:artistId/products/:productId', async (req, res) => {
  try {
    const product = await SnapArtistService.getSnapProductById(req.params.artistId, req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('스냅작가 상품 상세 조회 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 상품 수정
router.put('/:artistId/products/:productId', isAdmin, async (req, res) => {
  try {
    const product = await SnapArtistService.updateSnapProduct(req.params.artistId, req.params.productId, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('스냅작가 상품 수정 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 상품 삭제
router.delete('/:artistId/products/:productId', isAdmin, async (req, res) => {
  try {
    await SnapArtistService.deleteSnapProduct(req.params.artistId, req.params.productId);
    res.status(204).send();
  } catch (error) {
    console.error('스냅작가 상품 삭제 오류:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router; 