#!/usr/bin/env node

/**
 * 카카오 인증 테스트 직접 실행 스크립트 (개선된 버전)
 * 
 * 자동 로그인 및 리다이렉션 처리 개선
 */

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

async function runTest() {
    console.log('====================================');
    console.log('카카오 인증 테스트 직접 실행 (개선버전)');
    console.log('====================================');
    
    // 테스트 설정
    const KAKAO_ID = process.env.KAKAO_TEST_ID || '';
    const KAKAO_PASSWORD = process.env.KAKAO_TEST_PASSWORD || '';
    const TIMEOUT = 60000; // 타임아웃 (밀리초)
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9801/api/v1';
    
    let driver;
    let authCode = null;
    
    try {
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
        
        // 리다이렉션 URI 확인
        if (!process.env.KAKAO_REDIRECT_URI) {
            console.error('오류: KAKAO_REDIRECT_URI 환경 변수가 설정되지 않았습니다.');
            process.exit(1);
        }
        
        console.log('리다이렉션 URI:', process.env.KAKAO_REDIRECT_URI);
        
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
        
        // 1단계: 카카오 인증 URL 획득 테스트
        console.log('\n1단계: 카카오 인증 URL 획득 테스트 시작...');
        
        try {
            // kakaoAuthService를 사용하여 인증 URL 획득
            const response = await kakaoAuthService.getAuthCode();
            
            // 응답에 URL이 포함되어 있는지 확인
            if (!response || !response.request || !response.request.res || !response.request.res.responseUrl) {
                throw new Error('인증 URL을 획득하지 못했습니다.');
            }
            
            const authUrl = response.request.res.responseUrl;
            console.log('카카오 인증 URL 획득 성공:', authUrl);
            
            // URL이 카카오 도메인을 가리키는지 확인 (로그인 또는 인증 페이지)
            if (!authUrl.includes('kauth.kakao.com') && !authUrl.includes('accounts.kakao.com')) {
                throw new Error('잘못된 인증 URL 형식입니다.');
            }
            
            // 2단계: 카카오 로그인 및 인증 코드 획득 테스트
            if (KAKAO_ID && KAKAO_PASSWORD) {
                console.log('\n2단계: 카카오 로그인 및 인증 코드 테스트 시작...');
                
                console.log('카카오 인증 페이지로 이동 중...');
                // 브라우저로 인증 URL 열기
                await driver.get(authUrl);
                
                // 현재 URL 확인
                const initialUrl = await driver.getCurrentUrl();
                console.log('초기 URL:', initialUrl);
                
                // 인증 코드가 이미 있는지 확인 (자동 리다이렉션 또는 이미 로그인된 경우)
                const redirectUriBase = process.env.KAKAO_REDIRECT_URI.split('?')[0]; // 쿼리 파라미터 제외
                
                // 이미 리다이렉션된 경우 체크
                if (initialUrl.includes(redirectUriBase) && initialUrl.includes('code=')) {
                    console.log('자동 리다이렉션 감지: 이미 인증 코드가 포함된 URL로 리다이렉션되었습니다.');
                    
                    // URL에서 인증 코드 직접 추출
                    authCode = extractAuthCode(initialUrl);
                    
                    if (authCode) {
                        console.log('리다이렉션 URL에서 직접 인증 코드 추출 성공!');
                    } else {
                        throw new Error('리다이렉션 URL에서 인증 코드를 추출할 수 없습니다.');
                    }
                } else {
                    // 로그인 화면인 경우 로그인 필드 찾기 시도
                    console.log('로그인 페이지 로딩 대기 중...');
                    
                    // 로그인 화면 대기 및 로그인 시도
                    const loginResult = await attemptLogin(driver, KAKAO_ID, KAKAO_PASSWORD);
                    
                    if (loginResult.success) {
                        // 로그인 성공, 리다이렉션 대기
                        console.log('로그인 성공, 리다이렉션 대기 중...');
                        
                        // 리다이렉션 대기
                        const redirectionResult = await waitForRedirection(driver, redirectUriBase);
                        
                        if (redirectionResult.success) {
                            // 리다이렉션 URL에서 인증 코드 추출
                            authCode = extractAuthCode(redirectionResult.url);
                            
                            if (!authCode) {
                                throw new Error('리다이렉션 후 인증 코드를 추출할 수 없습니다.');
                            }
                        } else {
                            throw new Error(redirectionResult.error || '리다이렉션 대기 실패');
                        }
                    } else if (loginResult.alreadyRedirected) {
                        // 이미 리다이렉션됨 (로그인 화면 없이 바로 리다이렉션)
                        console.log('로그인 화면 없이 바로 리다이렉션되었습니다.');
                        
                        // 현재 URL에서 인증 코드 추출
                        const currentUrl = await driver.getCurrentUrl();
                        authCode = extractAuthCode(currentUrl);
                        
                        if (!authCode) {
                            throw new Error('리다이렉션 URL에서 인증 코드를 추출할 수 없습니다.');
                        }
                    } else {
                        throw new Error(loginResult.error || '로그인 실패');
                    }
                }
                
                if (authCode) {
                    console.log('인증 코드 획득 성공:', authCode.substring(0, 10) + '...');
                    console.log('인증 코드 길이:', authCode.length);
                } else {
                    throw new Error('인증 코드를 획득하지 못했습니다.');
                }
                
                // 3단계: 소셜 로그인 API 호출
                console.log('\n3단계: 소셜 로그인 API 호출 테스트 시작...');
                
                // API 서버에 소셜 로그인 요청
                try {
                    console.log(`${API_BASE_URL}/auth/social-login API 호출 중...`);
                    
                    // 소셜 로그인 API 호출
                    const response = await axios.post(`${API_BASE_URL}/auth/social-login`, {
                        provider: 'kakao',
                        code: authCode
                    });
                    
                    console.log('소셜 로그인 API 응답 상태:', response.status);
                    
                    // 응답 데이터 확인
                    if (response.status !== 200 || !response.data.success) {
                        throw new Error('소셜 로그인 API 호출 실패');
                    }
                    
                    console.log('소셜 로그인 성공! 토큰 및 사용자 정보 획득 완료');
                    
                    if (response.data.user) {
                        console.log('사용자 ID:', response.data.user.id);
                    }
                    
                    if (response.data.token) {
                        console.log('토큰:', response.data.token.substring(0, 15) + '...');
                    }
                    
                    // 테스트 결과 파일에 기록
                    const resultPath = path.join(resultsDir, 'social-login-result.json');
                    fs.writeFileSync(resultPath, JSON.stringify({
                        success: true,
                        timestamp: new Date().toISOString(),
                        userId: response.data.user?.id,
                        // 보안을 위해 토큰의 일부만 저장
                        tokenPreview: response.data.token ? response.data.token.substring(0, 10) + '...' : null
                    }, null, 2));
                    
                    console.log(`테스트 결과가 저장되었습니다: ${resultPath}`);
                    
                } catch (error) {
                    console.error('소셜 로그인 API 호출 실패:', error.message);
                    if (error.response) {
                        console.error('응답 상태:', error.response.status);
                        console.error('응답 데이터:', error.response.data);
                    }
                    throw error;
                }
            } else {
                // 수동 가이드 제공
                console.log('\n수동 인증 코드 가이드:');
                console.log('=============================================');
                console.log('1. 다음 URL을 브라우저에서 열어주세요:');
                console.log(authUrl);
                console.log('\n2. 카카오 계정으로 로그인하세요.');
                console.log('\n3. 리다이렉션된 URL에서 "code=" 파라미터 값을 확인하세요.');
                console.log('   예시: http://43.201.211.39/?code=3ipuiIBQpk5GnOYsqnX-v-i3YSvhOD6PJs0wAJd04UaEDY-NzRx2XAAAAAQKPXPsAAABlZuPwwLE017PSiBv1Q');
                console.log('   위 URL에서 code 값은 "3ipuiIBQpk5GnOYsqnX-v-i3YSvhOD6PJs0wAJd04UaEDY-NzRx2XAAAAAQKPXPsAAABlZuPwwLE017PSiBv1Q" 입니다.');
                console.log('\n4. 이 인증 코드를 사용하여 다음과 같이 소셜 로그인 API를 호출할 수 있습니다:');
                console.log(`curl -X POST "${API_BASE_URL}/auth/social-login" \\
     -H "Content-Type: application/json" \\
     -d '{"provider": "kakao", "code": "획득한_인증_코드"}'`);
                console.log('=============================================\n');
            }
            
        } catch (error) {
            console.error('카카오 인증 테스트 실패:', error);
            
            // 디버깅을 위해 스크린샷 저장
            if (driver) {
                try {
                    const screenshot = await driver.takeScreenshot();
                    const screenshotPath = path.join(resultsDir, 'kakao-login-failure.png');
                    fs.writeFileSync(screenshotPath, screenshot, 'base64');
                    console.log(`스크린샷이 저장되었습니다: ${screenshotPath}`);
                } catch (ssError) {
                    console.error('스크린샷 저장 실패:', ssError);
                }
            }
            
            throw error;
        }
        
        console.log('\n✅ 카카오 인증 테스트 완료!');
        
    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류가 발생했습니다.');
        console.error('오류 메시지:', error.message);
    } finally {
        // 드라이버 종료
        if (driver) {
            console.log('브라우저 종료 중...');
            await driver.quit();
        }
        console.log('테스트 종료');
    }
}

// URL에서 인증 코드 추출 함수
function extractAuthCode(url) {
    try {
        // URL 파싱 방법 시도
        const urlObj = new URL(url);
        const authCode = urlObj.searchParams.get('code');
        
        if (authCode) {
            return authCode;
        }
        
        // 정규식으로 시도
        const codeMatches = url.match(/[\?&]code=([^&]+)/);
        if (codeMatches && codeMatches[1]) {
            return codeMatches[1];
        }
        
        return null;
    } catch (error) {
        console.error('URL 파싱 오류:', error.message);
        
        // URL 객체 생성에 실패한 경우 정규식만 시도
        const codeMatches = url.match(/[\?&]code=([^&]+)/);
        if (codeMatches && codeMatches[1]) {
            return codeMatches[1];
        }
        
        return null;
    }
}

// 로그인 시도 함수
async function attemptLogin(driver, username, password) {
    const EXTENDED_TIMEOUT = 90000; // 타임아웃 확장 (90초)
    
    try {
        // 현재 URL 확인 - 이미 리다이렉션된 경우 처리
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('code=')) {
            return { 
                success: false, 
                alreadyRedirected: true,
                message: '이미 리다이렉션 되었습니다.' 
            };
        }
        
        // 가능한 여러 셀렉터 시도 (아이디 필드)
        let loginIdElement = null;
        const possibleSelectors = [
            By.id('loginId'),
            By.id('id_email_2'),
            By.name('email'),
            By.css('input[type="text"][data-type="text"]'),
            By.css('input[type="email"]'),
            By.css('input[placeholder*="이메일"]'),
            By.css('input[placeholder*="아이디"]')
        ];
        
        // 각 셀렉터를 순차적으로 시도
        for (const selector of possibleSelectors) {
            try {
                console.log(`셀렉터 시도: ${selector}`);
                await driver.wait(until.elementLocated(selector), 5000);
                loginIdElement = await driver.findElement(selector);
                console.log(`셀렉터 찾음: ${selector}`);
                break;
            } catch (e) {
                // 다음 셀렉터 시도
                console.log(`셀렉터 실패: ${selector}`);
            }
        }
        
        if (!loginIdElement) {
            // 다시 URL 확인 - 이미 리다이렉션되었는지 체크
            const newUrl = await driver.getCurrentUrl();
            if (newUrl.includes('code=')) {
                return { 
                    success: false,
                    alreadyRedirected: true,
                    message: '로그인 필드 검색 중 리다이렉션 되었습니다.' 
                };
            }
            
            // 디버깅을 위해 페이지 소스 출력
            const pageSource = await driver.getPageSource();
            console.log('페이지 소스 일부:', pageSource.substring(0, 1000) + '...');
            
            return { 
                success: false, 
                error: '로그인 아이디 입력 필드를 찾을 수 없습니다.' 
            };
        }
        
        // 아이디 입력
        await loginIdElement.sendKeys(username);
        console.log('아이디 입력 완료');
        
        // 비밀번호 입력 필드 찾기
        let passwordElement = null;
        const possiblePasswordSelectors = [
            By.id('password'),
            By.name('password'),
            By.css('input[type="password"]'),
            By.css('input[placeholder*="비밀번호"]')
        ];
        
        for (const selector of possiblePasswordSelectors) {
            try {
                await driver.wait(until.elementLocated(selector), 5000);
                passwordElement = await driver.findElement(selector);
                break;
            } catch (e) {
                // 다음 셀렉터 시도
            }
        }
        
        if (!passwordElement) {
            return { 
                success: false, 
                error: '비밀번호 입력 필드를 찾을 수 없습니다.' 
            };
        }
        
        // 비밀번호 입력
        await passwordElement.sendKeys(password);
        console.log('비밀번호 입력 완료');
        
        // 로그인 버튼 찾기
        let loginButton = null;
        const possibleButtonSelectors = [
            By.className('btn_g highlight submit'),
            By.css('button[type="submit"]'),
            By.css('input[type="submit"]'),
            By.css('button.submit'),
            By.css('button.login'),
            By.xpath('//button[contains(text(), "로그인")]')
        ];
        
        for (const selector of possibleButtonSelectors) {
            try {
                await driver.wait(until.elementLocated(selector), 5000);
                loginButton = await driver.findElement(selector);
                break;
            } catch (e) {
                // 다음 셀렉터 시도
            }
        }
        
        if (!loginButton) {
            return { 
                success: false, 
                error: '로그인 버튼을 찾을 수 없습니다.' 
            };
        }
        
        // 로그인 버튼 클릭
        console.log('로그인 시도 중...');
        await loginButton.click();
        
        return { success: true };
        
    } catch (error) {
        // 에러 발생 시 현재 URL 확인
        try {
            const currentUrl = await driver.getCurrentUrl();
            console.log('로그인 중 현재 URL:', currentUrl);
            
            // 이미 리다이렉션된 경우
            if (currentUrl.includes('code=')) {
                return { 
                    success: false,
                    alreadyRedirected: true,
                    message: '로그인 중 리다이렉션 되었습니다.' 
                };
            }
        } catch (e) {
            console.error('URL 확인 실패:', e);
        }
        
        return { 
            success: false, 
            error: `로그인 과정 오류: ${error.message}` 
        };
    }
}

// 리다이렉션 대기 함수
async function waitForRedirection(driver, expectedUriBase) {
    const EXTENDED_TIMEOUT = 90000; // 타임아웃 확장 (90초)
    
    try {
        console.log('인증 코드 리다이렉션 대기 중...');
        console.log('예상 리다이렉션 URI 기본 주소:', expectedUriBase);
        
        await driver.wait(async () => {
            const currentUrl = await driver.getCurrentUrl();
            console.log('현재 URL 확인 중:', currentUrl);
            
            // 리다이렉션 URL의 기본 주소가 포함되어 있는지 확인
            const hasRedirectUri = currentUrl.includes(expectedUriBase);
            
            // code 파라미터가 포함되어 있는지 확인
            const hasCodeParam = currentUrl.includes('code=');
            
            if (hasRedirectUri || hasCodeParam) {
                console.log('리다이렉션 감지됨!');
                if (hasRedirectUri) console.log('- 리다이렉션 URI 확인됨');
                if (hasCodeParam) console.log('- 인증 코드 파라미터 확인됨');
                return true;
            }
            
            return false;
        }, EXTENDED_TIMEOUT, '리다이렉션이 발생하지 않았습니다.');
        
        const currentUrl = await driver.getCurrentUrl();
        return { 
            success: true, 
            url: currentUrl 
        };
        
    } catch (error) {
        return { 
            success: false, 
            error: `리다이렉션 대기 오류: ${error.message}` 
        };
    }
}

// 테스트 실행
runTest().catch(error => {
    console.error('테스트 실행 오류:', error);
    process.exit(1);
}); 