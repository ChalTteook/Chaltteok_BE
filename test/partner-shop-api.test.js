import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './test/.env.test' });

// API 베이스 URL
const API_BASE_URL = 'http://localhost:9801/api/v1';

// 테스트용 변수
let userToken = '';
let adminToken = '';
let testShopId = 0;
let testPartnerShopId = 0;

// 일반 사용자 로그인
async function userLogin() {
  try {
    console.log('\n--- 일반 사용자 로그인 테스트 ---');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'test@newaccount.com',
      password: process.env.TEST_USER_PASSWORD || 'newpass1234'
    });
    
    if (response.data.success) {
      // 토큰 필드 확인 (token 또는 accessToken)
      if (response.data.token) {
        userToken = response.data.token;
      } else if (response.data.data && response.data.data.accessToken) {
        userToken = response.data.data.accessToken;
      } else if (response.data.accessToken) {
        userToken = response.data.accessToken;
      } else {
        console.error('토큰을 찾을 수 없습니다:', response.data);
        return false;
      }
      
      console.log('사용자 로그인 성공! 토큰 발급 완료');
      return true;
    } else {
      console.error('사용자 로그인 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('사용자 로그인 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 관리자 로그인
async function adminLogin() {
  try {
    console.log('\n--- 관리자 로그인 테스트 ---');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'test1234'
    });
    
    if (response.data.success) {
      // 토큰 필드 확인 (token 또는 accessToken)
      if (response.data.token) {
        adminToken = response.data.token;
      } else if (response.data.data && response.data.data.accessToken) {
        adminToken = response.data.data.accessToken;
      } else if (response.data.accessToken) {
        adminToken = response.data.accessToken;
      } else {
        console.error('토큰을 찾을 수 없습니다:', response.data);
        return false;
      }
      
      console.log('관리자 로그인 성공! 토큰 발급 완료');
      return true;
    } else {
      console.error('관리자 로그인 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('관리자 로그인 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 테스트용 매장 ID 가져오기
async function getTestShopId() {
  try {
    console.log('\n--- 테스트용 매장 ID 가져오기 ---');
    const response = await axios.get(`${API_BASE_URL}/shops?limit=1`);
    
    if (response.data.success && response.data.data.length > 0) {
      testShopId = response.data.data[0].id;
      console.log('테스트용 매장 ID 가져오기 성공:', testShopId);
      return true;
    } else {
      console.error('테스트용 매장 ID 가져오기 실패: 매장이 없습니다.');
      return false;
    }
  } catch (error) {
    console.error('테스트용 매장 ID 가져오기 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 1. 일반 매장 목록 조회 테스트 (제휴매장 우선 표시)
async function testGetShops() {
  try {
    console.log('\n--- 1. 매장 목록 조회 테스트 (제휴매장 우선 표시) ---');
    const response = await axios.get(`${API_BASE_URL}/shops`);
    
    if (response.data.success) {
      const shops = response.data.data;
      console.log(`총 ${shops.length}개의 매장이 조회되었습니다.`);
      
      // 처음 매장 몇 개 정보 출력
      const sampleSize = Math.min(3, shops.length);
      for (let i = 0; i < sampleSize; i++) {
        const shop = shops[i];
        console.log(`매장 #${i+1}:`, {
          id: shop.id,
          title: shop.title,
          is_partner: shop.is_partner,
          partner_status: shop.partner_status
        });
      }
      
      // 제휴매장 우선 표시 확인
      const partnerShops = shops.filter(shop => shop.is_partner === 1 || shop.is_partner === true);
      const nonPartnerShops = shops.filter(shop => !shop.is_partner || shop.is_partner === 0);
      
      if (partnerShops.length > 0 && nonPartnerShops.length > 0) {
        // 제휴매장이 먼저 나오는지 확인
        const firstPartnerShopIndex = shops.findIndex(shop => shop.is_partner === 1 || shop.is_partner === true);
        const firstNonPartnerShopIndex = shops.findIndex(shop => !shop.is_partner || shop.is_partner === 0);
        
        if (firstPartnerShopIndex < firstNonPartnerShopIndex) {
          console.log('테스트 성공: 제휴매장이 일반 매장보다 먼저 표시됩니다.');
        } else {
          console.log('테스트 실패: 제휴매장이 일반 매장보다 먼저 표시되지 않습니다.');
        }
      } else {
        console.log('제휴매장 또는 일반 매장이 없어 우선 표시 여부를 확인할 수 없습니다.');
      }
      
      return true;
    } else {
      console.error('매장 목록 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('매장 목록 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 2. 제휴매장만 조회 테스트
async function testGetPartnerShopsOnly() {
  try {
    console.log('\n--- 2. 제휴매장만 조회 테스트 ---');
    const response = await axios.get(`${API_BASE_URL}/shops?partner_only=true`);
    
    if (response.data.success) {
      const shops = response.data.data;
      console.log(`총 ${shops.length}개의 제휴매장이 조회되었습니다.`);
      
      // 모든 매장이 제휴매장인지 확인
      const allPartners = shops.every(shop => shop.is_partner === 1 || shop.is_partner === true);
      
      if (allPartners) {
        console.log('테스트 성공: 모든 매장이 제휴매장입니다.');
      } else {
        console.log('테스트 실패: 일부 매장이 제휴매장이 아닙니다.');
      }
      
      // 처음 매장 몇 개 정보 출력
      const sampleSize = Math.min(3, shops.length);
      for (let i = 0; i < sampleSize; i++) {
        const shop = shops[i];
        console.log(`매장 #${i+1}:`, {
          id: shop.id,
          title: shop.title,
          is_partner: shop.is_partner,
          partner_date: shop.partner_date,
          partner_status: shop.partner_status
        });
      }
      
      return true;
    } else {
      console.error('제휴매장 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('제휴매장 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 3. 매장 상세 조회 테스트 (제휴매장 정보 포함)
async function testGetShopDetail() {
  try {
    console.log('\n--- 3. 매장 상세 조회 테스트 ---');
    if (!testShopId) {
      console.error('테스트용 매장 ID가 없습니다.');
      return false;
    }
    
    const response = await axios.get(`${API_BASE_URL}/shops/${testShopId}`);
    
    if (response.data.success) {
      const shop = response.data.data;
      console.log('매장 상세 정보:', {
        id: shop.id,
        title: shop.title,
        is_partner: shop.is_partner,
        partner_date: shop.partner_date,
        partner_status: shop.partner_status
      });
      
      return true;
    } else {
      console.error('매장 상세 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('매장 상세 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 4. 관리자 제휴매장 목록 조회 테스트
async function testAdminGetPartnerShops() {
  try {
    console.log('\n--- 4. 관리자 제휴매장 목록 조회 테스트 ---');
    if (!adminToken) {
      console.error('관리자 토큰이 없습니다.');
      return false;
    }
    
    const response = await axios.get(`${API_BASE_URL}/admin/partner-shops`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      const partnerShops = response.data.data;
      console.log(`총 ${partnerShops.length}개의 제휴매장이 조회되었습니다.`);
      
      // 처음 매장 몇 개 정보 출력
      const sampleSize = Math.min(3, partnerShops.length);
      for (let i = 0; i < sampleSize; i++) {
        const shop = partnerShops[i];
        console.log(`제휴매장 #${i+1}:`, {
          id: shop.id,
          shop_id: shop.shop_id,
          title: shop.title,
          partner_date: shop.partner_date,
          expiry_date: shop.expiry_date,
          status: shop.status
        });
      }
      
      // 테스트용 제휴매장 ID 저장
      if (partnerShops.length > 0) {
        testPartnerShopId = partnerShops[0].shop_id;
      }
      
      return true;
    } else {
      console.error('관리자 제휴매장 목록 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('관리자 제휴매장 목록 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 5. 관리자 제휴매장 상세 조회 테스트
async function testAdminGetPartnerShopDetail() {
  try {
    console.log('\n--- 5. 관리자 제휴매장 상세 조회 테스트 ---');
    if (!adminToken || !testPartnerShopId) {
      console.error('관리자 토큰 또는 테스트용 제휴매장 ID가 없습니다.');
      return false;
    }
    
    const response = await axios.get(`${API_BASE_URL}/admin/partner-shops/${testPartnerShopId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      const shop = response.data.data;
      console.log('제휴매장 상세 정보:', {
        id: shop.id,
        shop_id: shop.shop_id,
        title: shop.title,
        partner_date: shop.partner_date,
        expiry_date: shop.expiry_date,
        status: shop.status
      });
      
      return true;
    } else {
      console.error('관리자 제휴매장 상세 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('관리자 제휴매장 상세 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 6. 관리자 제휴매장 등록 테스트
async function testAdminCreatePartnerShop() {
  try {
    console.log('\n--- 6. 관리자 제휴매장 등록 테스트 ---');
    if (!adminToken || !testShopId) {
      console.error('관리자 토큰 또는 테스트용 매장 ID가 없습니다.');
      return false;
    }
    
    // 테스트용 날짜 설정
    const today = new Date();
    const partnerDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0]; // 1년 후
    
    const response = await axios.post(
      `${API_BASE_URL}/admin/partner-shops`,
      {
        shopId: testShopId,
        partnerDate,
        expiryDate
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success) {
      const shop = response.data.data;
      console.log('등록된 제휴매장 정보:', {
        id: shop.id,
        shop_id: shop.shop_id,
        title: shop.title,
        partner_date: shop.partner_date,
        expiry_date: shop.expiry_date,
        status: shop.status
      });
      
      // 이미 등록된 매장인 경우 테스트 성공으로 간주
      return true;
    } else {
      // 이미 등록된 매장인 경우
      if (response.data.message.includes('이미 제휴매장으로 등록')) {
        console.log('테스트 매장이 이미 제휴매장으로 등록되어 있습니다. (이 경우 테스트 성공으로 간주)');
        return true;
      }
      
      console.error('관리자 제휴매장 등록 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    // 이미 등록된 매장인 경우
    if (error.response?.data?.message.includes('이미 제휴매장으로 등록')) {
      console.log('테스트 매장이 이미 제휴매장으로 등록되어 있습니다. (이 경우 테스트 성공으로 간주)');
      return true;
    }
    
    console.error('관리자 제휴매장 등록 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 7. 관리자 제휴매장 수정 테스트
async function testAdminUpdatePartnerShop() {
  try {
    console.log('\n--- 7. 관리자 제휴매장 수정 테스트 ---');
    if (!adminToken || !testPartnerShopId) {
      console.error('관리자 토큰 또는 테스트용 제휴매장 ID가 없습니다.');
      return false;
    }
    
    // 테스트용 날짜 설정
    const today = new Date();
    const expiryDate = new Date(today.setFullYear(today.getFullYear() + 2)).toISOString().split('T')[0]; // 2년 후
    
    const response = await axios.put(
      `${API_BASE_URL}/admin/partner-shops/${testPartnerShopId}`,
      {
        expiryDate,
        status: 'active'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success) {
      const shop = response.data.data;
      console.log('수정된 제휴매장 정보:', {
        id: shop.id,
        shop_id: shop.shop_id,
        title: shop.title,
        partner_date: shop.partner_date,
        expiry_date: shop.expiry_date,
        status: shop.status
      });
      
      return true;
    } else {
      console.error('관리자 제휴매장 수정 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('관리자 제휴매장 수정 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 8. 모든 매장 검색 테스트 (정렬 옵션 테스트)
async function testGetShopsWithSorting() {
  try {
    console.log('\n--- 8. 매장 정렬 옵션 테스트 ---');
    
    // 가격순 정렬 테스트
    console.log('8-1. 가격순 정렬 테스트');
    const priceResponse = await axios.get(`${API_BASE_URL}/shops?sort=price`);
    
    if (priceResponse.data.success) {
      const shops = priceResponse.data.data;
      console.log(`총 ${shops.length}개의 매장이 조회되었습니다.`);
      
      // 제휴매장이 먼저 표시되는지 확인
      const firstPartnerIndex = shops.findIndex(shop => shop.is_partner === 1 || shop.is_partner === true);
      const firstNonPartnerIndex = shops.findIndex(shop => !shop.is_partner || shop.is_partner === 0);
      
      if (firstPartnerIndex < firstNonPartnerIndex) {
        console.log('테스트 성공: 가격순 정렬에서도 제휴매장이 우선 표시됩니다.');
      } else {
        console.log('테스트 실패: 가격순 정렬에서 제휴매장이 우선 표시되지 않습니다.');
      }
    } else {
      console.error('가격순 정렬 테스트 실패:', priceResponse.data.message);
    }
    
    // 리뷰순 정렬 테스트
    console.log('\n8-2. 리뷰순 정렬 테스트');
    const reviewResponse = await axios.get(`${API_BASE_URL}/shops?sort=review`);
    
    if (reviewResponse.data.success) {
      const shops = reviewResponse.data.data;
      console.log(`총 ${shops.length}개의 매장이 조회되었습니다.`);
      
      // 제휴매장이 먼저 표시되는지 확인
      const firstPartnerIndex = shops.findIndex(shop => shop.is_partner === 1 || shop.is_partner === true);
      const firstNonPartnerIndex = shops.findIndex(shop => !shop.is_partner || shop.is_partner === 0);
      
      if (firstPartnerIndex < firstNonPartnerIndex) {
        console.log('테스트 성공: 리뷰순 정렬에서도 제휴매장이 우선 표시됩니다.');
      } else {
        console.log('테스트 실패: 리뷰순 정렬에서 제휴매장이 우선 표시되지 않습니다.');
      }
    } else {
      console.error('리뷰순 정렬 테스트 실패:', reviewResponse.data.message);
    }
    
    return true;
  } catch (error) {
    console.error('매장 정렬 옵션 테스트 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('===== 제휴매장 기능 API 테스트 시작 =====');
  
  // 사전 준비
  await userLogin();
  await adminLogin();
  await getTestShopId();
  
  // 테스트 실행
  await testGetShops();
  await testGetPartnerShopsOnly();
  await testGetShopDetail();
  await testAdminGetPartnerShops();
  await testAdminGetPartnerShopDetail();
  await testAdminCreatePartnerShop();
  await testAdminUpdatePartnerShop();
  await testGetShopsWithSorting();
  
  console.log('\n===== 제휴매장 기능 API 테스트 완료 =====');
}

// 테스트 실행
runAllTests(); 