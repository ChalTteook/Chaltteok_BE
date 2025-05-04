import 'dotenv/config';
// 네이버 소셜 로그인 E2E 테스트 (수동 실행용)
// 실행: node test/naver-login-e2e-test.js

import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';
import readline from 'readline';

const API_BASE_URL = 'http://localhost:9801/api/v1'; // 백엔드 API 주소
const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';

// 네이버 OAuth 클라이언트 정보 (환경변수 또는 직접 입력)
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || 'YOUR_CLIENT_ID';
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI || 'YOUR_REDIRECT_URI';
const NAVER_STATE = 'test_state_1234'; // CSRF 방지용 임의값

// 콘솔 입력 대기 함수
function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

(async () => {
  console.log('=== 네이버 소셜 로그인 E2E 테스트 시작 ===');
  let driver;
  try {
    // 1. 네이버 인증 URL 생성
    const authUrl = `${NAVER_AUTH_URL}?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${NAVER_STATE}`;
    console.log('[1단계] 네이버 인증 URL 생성 완료');
    console.log('인증 URL:', authUrl);

    // 2. 셀레니움으로 브라우저 열기
    driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
    console.log('[2단계] 웹브라우저(Chrome) 실행');
    await driver.get(authUrl);
    console.log('네이버 로그인 페이지가 열렸습니다. 수동으로 로그인 후, 동의 및 인증을 완료하세요.');

    // 3. 리다이렉트 URL 대기 및 code 추출
    let code = null;
    let redirectedUrl = null;
    console.log('[3단계] 인증 후 리다이렉트 URL에서 code 파라미터 추출 대기...');
    // 네이버 로그인 후 리다이렉트가 발생할 때까지 대기 (최대 2분)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      if (url.startsWith(NAVER_REDIRECT_URI) && url.includes('code=')) {
        redirectedUrl = url;
        return true;
      }
      return false;
    }, 120000);
    console.log('리다이렉트 URL 감지:', redirectedUrl);
    // code 파라미터 추출
    const urlObj = new URL(redirectedUrl);
    code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    if (!code) {
      throw new Error('code 파라미터를 추출하지 못했습니다.');
    }
    console.log('[4단계] code 추출 성공:', code);
    console.log('state:', state);

    // 4. 백엔드에 code로 소셜 로그인 요청
    console.log('[5단계] 백엔드에 code로 소셜 로그인 API 호출');
    const response = await axios.post(`${API_BASE_URL}/auth/social-login`, {
      provider: 'naver',
      code
    });
    console.log('백엔드 응답:', response.data);
    if (response.data.success) {
      console.log('✅ 네이버 소셜 로그인 E2E 테스트 성공!');
      if (response.data.token) {
        console.log('발급된 토큰:', response.data.token.substring(0, 20) + '...');
      }
      if (response.data.user) {
        console.log('유저 정보:', response.data.user);
      }
    } else {
      console.error('❌ 백엔드 인증 실패:', response.data);
    }
  } catch (err) {
    console.error('테스트 중 오류 발생:', err.message);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('브라우저 종료');
    }
    console.log('=== 네이버 소셜 로그인 E2E 테스트 종료 ===');
  }
})(); 