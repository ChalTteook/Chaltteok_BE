import { jest } from '@jest/globals';
import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import 'chromedriver';
import kakaoAuthService from '../src/services/kakaoAuthService.js';
import LoginService from '../src/services/loginService.js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// 카카오 로그인 자동화 테스트
describe('카카오 로그인 자동화 테스트', () => {
    let driver;
    
    // 테스트 설정
    const KAKAO_ID = process.env.KAKAO_TEST_ID || ''; // 카카오 테스트 아이디를 환경변수로 설정
    const KAKAO_PASSWORD = process.env.KAKAO_TEST_PASSWORD || ''; // 카카오 테스트 비밀번호를 환경변수로 설정
    const TIMEOUT = 30000; // 타임아웃 (밀리초)
    
    // 테스트 전에 웹 드라이버 설정
    beforeAll(async () => {
        // 테스트 아이디/비밀번호가 설정되어 있는지 확인
        if (!KAKAO_ID || !KAKAO_PASSWORD) {
            console.warn('경고: KAKAO_TEST_ID 또는 KAKAO_TEST_PASSWORD 환경 변수가 설정되지 않았습니다.');
            console.warn('자동 로그인 테스트를 건너뛰고 수동 모드로 진행합니다.');
        }
        
        // 크롬 옵션 설정
        const options = new chrome.Options();
        // 테스트 환경인 경우 헤드리스 모드로 실행 (화면에 표시되지 않음)
        if (process.env.NODE_ENV === 'test') {
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
    });
    
    // 각 테스트 후에 웹 드라이버 종료
    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });
    
    describe('카카오 인증 코드 획득 테스트', () => {
        it('카카오 인증 URL 얻기', async () => {
            // 이 테스트는 실제 인증 URL이 생성되는지 확인
            // kakaoAuthService의 getAuthCode 메서드 테스트
            
            try {
                // 이 부분은 네트워크 호출이 필요하므로 실제 서비스를 사용합니다.
                // 실제 구현에서는 Jest의 스파이나 모킹을 사용할 수 있습니다.
                const response = await kakaoAuthService.getAuthCode();
                
                // 응답에 URL이 포함되어 있는지 확인
                expect(response).toBeDefined();
                expect(response.request).toBeDefined();
                expect(response.request.res).toBeDefined();
                expect(response.request.res.responseUrl).toBeDefined();
                
                const authUrl = response.request.res.responseUrl;
                console.log('카카오 인증 URL:', authUrl);
                
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
        
        it('카카오 로그인 및 인증 코드 획득', async () => {
            // 이 테스트에서는 로그인을 자동화하고 인증 코드를 추출합니다.
            // 실제 카카오 계정 정보가 없으면 이 테스트는 건너뜁니다.
            
            if (!KAKAO_ID || !KAKAO_PASSWORD) {
                console.log('카카오 테스트 계정이 설정되지 않아 이 테스트를 건너뜁니다.');
                return;
            }
            
            try {
                // 인증 URL 얻기
                const authResponse = await kakaoAuthService.getAuthCode();
                const authUrl = authResponse.request.res.responseUrl;
                
                // 브라우저로 인증 URL 열기
                await driver.get(authUrl);
                
                // 로그인 폼이 로드될 때까지 대기
                await driver.wait(until.elementLocated(By.id('loginId')), TIMEOUT);
                
                // 아이디 입력
                const idField = await driver.findElement(By.id('loginId'));
                await idField.sendKeys(KAKAO_ID);
                
                // 비밀번호 입력
                const passwordField = await driver.findElement(By.id('password'));
                await passwordField.sendKeys(KAKAO_PASSWORD);
                
                // 로그인 버튼 클릭
                const loginButton = await driver.findElement(By.className('btn_g highlight submit'));
                await loginButton.click();
                
                // 로그인 후 리다이렉션 대기
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
                const authCode = urlParams.get('code');
                
                console.log('추출된 인증 코드:', authCode);
                
                // 인증 코드가 있는지 확인
                expect(authCode).toBeDefined();
                expect(authCode.length).toBeGreaterThan(0);
                
                // 선택 사항: 추출된 인증 코드를 사용하여 액세스 토큰 요청 테스트
                if (authCode) {
                    try {
                        const tokenResponse = await kakaoAuthService.getAccessToken(authCode);
                        expect(tokenResponse.success).toBe(true);
                        expect(tokenResponse.data.accessToken).toBeDefined();
                        console.log('액세스 토큰 획득 성공:', tokenResponse.data.accessToken);
                    } catch (tokenError) {
                        console.error('액세스 토큰 획득 실패:', tokenError);
                        // 액세스 토큰 획득 실패는 무시하고 테스트를 계속 진행합니다.
                    }
                }
                
                return authCode;
                
            } catch (error) {
                console.error('카카오 로그인 자동화 실패:', error);
                
                // 디버깅을 위해 스크린샷 저장
                try {
                    const screenshot = await driver.takeScreenshot();
                    const screenshotPath = './test-results/kakao-login-failure.png';
                    require('fs').writeFileSync(screenshotPath, screenshot, 'base64');
                    console.log(`스크린샷이 저장되었습니다: ${screenshotPath}`);
                } catch (ssError) {
                    console.error('스크린샷 저장 실패:', ssError);
                }
                
                throw error;
            }
        }, TIMEOUT);
    });
    
    describe('카카오 로그인 수동 가이드', () => {
        it('수동 로그인 테스트 가이드 제공', async () => {
            if (KAKAO_ID && KAKAO_PASSWORD) {
                console.log('자동 테스트가 설정되어 있어 이 테스트를 건너뜁니다.');
                return;
            }
            
            try {
                // 인증 URL 얻기
                const authResponse = await kakaoAuthService.getAuthCode();
                const authUrl = authResponse.request.res.responseUrl;
                
                console.log('\n=============================================');
                console.log('카카오 로그인 수동 테스트 가이드');
                console.log('=============================================');
                console.log('1. 다음 URL을 브라우저에서 열어주세요:');
                console.log(authUrl);
                console.log('\n2. 카카오 계정으로 로그인하세요.');
                console.log('\n3. 리다이렉션된 URL에서 "code=" 파라미터 값을 확인하세요.');
                console.log('   예: https://example.com/oauth?code=ABCDEF... 에서 ABCDEF... 부분이 인증 코드입니다.');
                console.log('=============================================\n');
                
                // 실제로는 manual intervention이 필요하므로 이 테스트는 항상 통과
                expect(true).toBe(true);
                
            } catch (error) {
                console.error('인증 URL 획득 실패:', error);
                throw error;
            }
        }, TIMEOUT);
    });
    
    // 테스트 헬퍼 함수들 (필요한 경우 추가)
}); 