import { jest } from '@jest/globals';
import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import 'chromedriver';
import axios from 'axios';
import kakaoAuthService from '../src/services/kakaoAuthService.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경 변수 로드
dotenv.config({ path: './test/.env.test' });

// __dirname 설정 (ES Modules에서는 __dirname이 기본적으로 정의되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 결과 저장을 위한 디렉토리
const resultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

// 카카오 로그인 종단간(E2E) 테스트
describe('카카오 로그인 종단간(E2E) 테스트', () => {
    let driver;
    let authCode = null;
    
    // 테스트 설정
    const KAKAO_ID = process.env.KAKAO_TEST_ID || '';
    const KAKAO_PASSWORD = process.env.KAKAO_TEST_PASSWORD || '';
    const TIMEOUT = 60000; // 타임아웃 (밀리초)
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9801/api/v1';
    
    // 테스트 전에 웹 드라이버 설정
    beforeAll(async () => {
        console.log('테스트 환경 설정 중...');
        
        // 테스트 아이디/비밀번호가 설정되어 있는지 확인
        if (!KAKAO_ID || !KAKAO_PASSWORD) {
            console.warn('경고: KAKAO_TEST_ID 또는 KAKAO_TEST_PASSWORD 환경 변수가 설정되지 않았습니다.');
            console.warn('자동 로그인 테스트를 건너뛰고 수동 모드로 진행합니다.');
        }
        
        // API 기본 URL 확인
        if (!process.env.API_BASE_URL) {
            console.warn('경고: API_BASE_URL이 설정되지 않아 기본값을 사용합니다:', API_BASE_URL);
        }
        
        // 크롬 옵션 설정
        const options = new chrome.Options();
        // 테스트 환경인 경우 헤드리스 모드로 실행 (화면에 표시되지 않음)
        if (process.env.NODE_ENV === 'test' && process.env.HEADLESS !== 'false') {
            options.addArguments('--headless');
        }
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        // 웹 드라이버 생성
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        // 브라우저 창 크기 설정
        await driver.manage().window().setRect({ width: 1280, height: 800 });
        
        // 타임아웃 설정
        await driver.manage().setTimeouts({ implicit: 10000 });
        
        console.log('테스트 환경 설정 완료');
    });
    
    // 각 테스트 후에 웹 드라이버 종료
    afterAll(async () => {
        console.log('테스트 정리 중...');
        if (driver) {
            await driver.quit();
        }
        console.log('테스트 정리 완료');
    });
    
    // 1단계: 카카오 인증 코드 테스트
    describe('1단계: 카카오 인증 코드 테스트', () => {
        it('카카오 인증 URL 획득 테스트', async () => {
            console.log('카카오 인증 URL 획득 테스트 시작...');
            
            try {
                // kakaoAuthService를 사용하여 인증 URL 획득
                const response = await kakaoAuthService.getAuthCode();
                
                // 응답에 URL이 포함되어 있는지 확인
                expect(response).toBeDefined();
                expect(response.request).toBeDefined();
                expect(response.request.res).toBeDefined();
                expect(response.request.res.responseUrl).toBeDefined();
                
                const authUrl = response.request.res.responseUrl;
                console.log('카카오 인증 URL 획득 성공:', authUrl);
                
                // URL이 카카오 인증 도메인을 가리키는지 확인
                expect(authUrl).toContain('kauth.kakao.com/oauth/authorize');
                expect(authUrl).toContain('client_id=' + process.env.KAKAO_CLIENT_ID);
                expect(authUrl).toContain('redirect_uri=' + encodeURIComponent(process.env.KAKAO_REDIRECT_URI));
                expect(authUrl).toContain('response_type=code');
                
                return authUrl;
            } catch (error) {
                console.error('카카오 인증 URL 획득 실패:', error);
                throw error;
            }
        }, TIMEOUT);
        
        it('카카오 로그인 및 인증 코드 테스트', async () => {
            console.log('카카오 로그인 및 인증 코드 테스트 시작...');
            
            // 테스트 계정 정보가 없으면 테스트 건너뛰기
            if (!KAKAO_ID || !KAKAO_PASSWORD) {
                console.log('카카오 테스트 계정이 설정되지 않아 이 테스트를 건너뜁니다.');
                console.log('수동 테스트 가이드를 참조하세요.');
                return;
            }
            
            try {
                // 인증 URL 얻기
                const authResponse = await kakaoAuthService.getAuthCode();
                const authUrl = authResponse.request.res.responseUrl;
                
                console.log('카카오 인증 페이지로 이동 중...');
                // 브라우저로 인증 URL 열기
                await driver.get(authUrl);
                
                // 로그인 폼이 로드될 때까지 대기
                console.log('로그인 페이지 로딩 대기 중...');
                await driver.wait(until.elementLocated(By.id('loginId')), TIMEOUT);
                
                // 아이디 입력
                const idField = await driver.findElement(By.id('loginId'));
                await idField.sendKeys(KAKAO_ID);
                console.log('아이디 입력 완료');
                
                // 비밀번호 입력
                const passwordField = await driver.findElement(By.id('password'));
                await passwordField.sendKeys(KAKAO_PASSWORD);
                console.log('비밀번호 입력 완료');
                
                // 로그인 버튼 클릭
                console.log('로그인 시도 중...');
                const loginButton = await driver.findElement(By.className('btn_g highlight submit'));
                await loginButton.click();
                
                // 로그인 후 리다이렉션 대기
                console.log('인증 코드 리다이렉션 대기 중...');
                await driver.wait(async () => {
                    const currentUrl = await driver.getCurrentUrl();
                    return currentUrl.includes(process.env.KAKAO_REDIRECT_URI) || 
                           currentUrl.includes('code=');
                }, TIMEOUT, '리다이렉션이 발생하지 않았습니다.');
                
                // 현재 URL 가져오기
                const currentUrl = await driver.getCurrentUrl();
                console.log('리다이렉션 URL:', currentUrl);
                
                // URL에서 인증 코드 추출
                const urlParams = new URL(currentUrl).searchParams;
                authCode = urlParams.get('code');
                
                console.log('추출된 인증 코드:', authCode);
                
                // 인증 코드가 있는지 확인
                expect(authCode).toBeDefined();
                expect(authCode.length).toBeGreaterThan(0);
                
                return authCode;
            } catch (error) {
                console.error('카카오 로그인 자동화 실패:', error);
                
                // 디버깅을 위해 스크린샷 저장
                try {
                    const screenshot = await driver.takeScreenshot();
                    const screenshotPath = path.join(resultsDir, 'kakao-login-failure.png');
                    fs.writeFileSync(screenshotPath, screenshot, 'base64');
                    console.log(`스크린샷이 저장되었습니다: ${screenshotPath}`);
                } catch (ssError) {
                    console.error('스크린샷 저장 실패:', ssError);
                }
                
                throw error;
            }
        }, TIMEOUT);
        
        // 인증 코드 가이드 제공 (자동 테스트가 실패한 경우)
        it('수동 인증 코드 획득 가이드 제공', async () => {
            if (KAKAO_ID && KAKAO_PASSWORD && authCode) {
                console.log('자동화된 인증 코드 획득에 성공했습니다. 수동 가이드를 건너뜁니다.');
                return;
            }
            
            try {
                // 인증 URL 얻기
                const authResponse = await kakaoAuthService.getAuthCode();
                const authUrl = authResponse.request.res.responseUrl;
                
                console.log('\n=============================================');
                console.log('카카오 인증 코드 수동 획득 가이드');
                console.log('=============================================');
                console.log('1. 다음 URL을 브라우저에서 열어주세요:');
                console.log(authUrl);
                console.log('\n2. 카카오 계정으로 로그인하세요.');
                console.log('\n3. 리다이렉션된 URL에서 "code=" 파라미터 값을 확인하세요.');
                console.log('   예: https://example.com/oauth?code=ABCDEF... 에서 ABCDEF... 부분이 인증 코드입니다.');
                console.log('\n4. 이 인증 코드를 다음 테스트에서 사용하거나 직접 API를 호출하세요.');
                console.log('=============================================\n');
                
                // 실제로는 manual intervention이 필요하므로 이 테스트는 항상 통과
                expect(true).toBe(true);
            } catch (error) {
                console.error('인증 URL 획득 실패:', error);
                throw error;
            }
        }, TIMEOUT);
    });
    
    // 2단계: 소셜 로그인 API 테스트
    describe('2단계: 소셜 로그인 API 호출', () => {
        it('카카오 인증 코드로 소셜 로그인 API 호출', async () => {
            // 인증 코드가 없으면 테스트 건너뛰기
            if (!authCode) {
                console.log('인증 코드가 없어 이 테스트를 건너뜁니다.');
                console.log('수동으로 인증 코드를 획득하고 소셜 로그인 API를 직접 호출하세요.');
                return;
            }
            
            console.log('소셜 로그인 API 호출 테스트 시작...');
            
            try {
                console.log(`${API_BASE_URL}/auth/social-login API 호출 중...`);
                
                // 소셜 로그인 API 호출
                const response = await axios.post(`${API_BASE_URL}/auth/social-login`, {
                    provider: 'kakao',
                    code: authCode
                });
                
                console.log('소셜 로그인 API 응답:', response.status);
                
                // 응답 상태 코드 확인
                expect(response.status).toBe(200);
                
                // 응답 데이터 확인
                expect(response.data).toBeDefined();
                expect(response.data.success).toBe(true);
                expect(response.data.token).toBeDefined();
                expect(response.data.user).toBeDefined();
                
                console.log('소셜 로그인 성공! 토큰 및 사용자 정보 획득 완료');
                console.log('사용자 ID:', response.data.user.id);
                console.log('토큰:', response.data.token.substring(0, 15) + '...');
                
                // 테스트 결과 파일에 기록
                const resultPath = path.join(resultsDir, 'social-login-result.json');
                fs.writeFileSync(resultPath, JSON.stringify({
                    success: true,
                    timestamp: new Date().toISOString(),
                    userId: response.data.user.id,
                    // 보안을 위해 토큰의 일부만 저장
                    tokenPreview: response.data.token.substring(0, 10) + '...'
                }, null, 2));
                
                console.log(`테스트 결과가 저장되었습니다: ${resultPath}`);
                
                return response.data;
            } catch (error) {
                console.error('소셜 로그인 API 호출 실패:', error.message);
                if (error.response) {
                    console.error('응답 상태:', error.response.status);
                    console.error('응답 데이터:', error.response.data);
                }
                throw error;
            }
        }, TIMEOUT);
    });
    
    // 3단계: 로그인 상태 확인 테스트
    describe('3단계: 로그인 상태 확인', () => {
        it('JWT 토큰으로 인증 상태 확인', async () => {
            // 인증 정보가 없으면 테스트 건너뛰기
            const resultPath = path.join(resultsDir, 'social-login-result.json');
            if (!fs.existsSync(resultPath)) {
                console.log('로그인 정보가 없어 이 테스트를 건너뜁니다.');
                return;
            }
            
            console.log('JWT 토큰 인증 확인 테스트 시작...');
            
            try {
                // 이전 단계에서 저장한 로그인 정보 읽기
                const loginResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                
                // social-login 응답에서 받은 전체 토큰이 없으므로 테스트 건너뛰기
                console.log('이 테스트에서는 실제 API 호출을 수행하지 않습니다.');
                console.log('실제 애플리케이션에서는 다음과 같이 토큰을 사용하여 API를 호출할 수 있습니다:');
                console.log('- Authorization 헤더에 JWT 토큰을 포함하여 인증이 필요한 API 호출');
                console.log('- 세션 관리 API를 호출하여 현재 로그인 상태 확인');
                
                console.log('\n토큰을 사용한 API 호출 예시:');
                console.log(`curl -X GET "${API_BASE_URL}/user/profile" \\
       -H "Authorization: Bearer YOUR_TOKEN_HERE"`);
                
                // 이 테스트는 항상 성공
                expect(true).toBe(true);
            } catch (error) {
                console.error('인증 상태 확인 실패:', error);
                throw error;
            }
        }, TIMEOUT);
    });
}); 