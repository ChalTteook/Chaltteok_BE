#!/usr/bin/env node

/**
 * 간소화된 카카오 로그인 E2E 테스트 스크립트
 * 
 * 이 스크립트는 다음 기능을 테스트합니다:
 * 1. 카카오 인증 URL 획득 (/api/v1/auth/kakao_auth)
 * 2. 선택적: Selenium을 사용한 카카오 로그인 자동화
 * 3. 인증 코드를 사용한 소셜 로그인 API 호출 (/api/v1/auth/social-login)
 * 
 * 환경 변수:
 * - KAKAO_TEST_ID: 카카오 테스트 계정 아이디 (선택)
 * - KAKAO_TEST_PASSWORD: 카카오 테스트 계정 비밀번호 (선택)
 * - HEADLESS: 'false'로 설정하면 브라우저를 시각적으로 볼 수 있음 (선택)
 * 
 * 실행 방법: node test/kakao-login-e2e-simple.js
 */

import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import 'chromedriver';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// 환경 변수 로드
dotenv.config({ path: './test/.env.test' });

// __dirname 설정 (ES Modules에서는 __dirname이 기본적으로 정의되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API 기본 URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9801/api/v1';

// 테스트 설정
const KAKAO_ID = process.env.KAKAO_TEST_ID || '';
const KAKAO_PASSWORD = process.env.KAKAO_TEST_PASSWORD || '';
const TIMEOUT = 60000; // 타임아웃 (밀리초)
const HEADLESS = process.env.HEADLESS !== 'false'; // 헤드리스 모드 (기본: 활성화)

// 결과 저장을 위한 디렉토리
const resultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

// 사용자에게 입력을 요청하는 함수
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

// 스크린샷 저장 함수
async function takeScreenshot(driver, name) {
    try {
        const screenshot = await driver.takeScreenshot();
        const screenshotPath = path.join(resultsDir, `${name}.png`);
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        console.log(`📸 스크린샷이 ${screenshotPath}에 저장되었습니다.`);
    } catch (error) {
        console.error('스크린샷 저장 중 오류:', error.message);
    }
}

// E2E 테스트 실행 함수
async function runKakaoLoginE2ETest() {
    console.log('====================================');
    console.log('카카오 로그인 E2E 테스트');
    console.log('====================================');
    
    let driver = null;
    let authUrl = null;
    let authCode = null;
    let loginResult = null;
    
    try {
        // 1단계: 카카오 인증 URL 획득
        console.log('\n🔹 1단계: 카카오 인증 URL 획득');
        try {
            console.log('인증 URL 요청 중...');
            const response = await axios.get(`${API_BASE_URL}/auth/kakao_auth`);
            
            if (response.data && response.data.success && response.data.data) {
                authUrl = response.data.data;
                console.log('✅ 카카오 인증 URL 획득 성공!');
                console.log(`👉 인증 URL: ${authUrl.substring(0, 50)}...`);
            } else {
                throw new Error('인증 URL 응답 형식이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('❌ 카카오 인증 URL 획득 실패!');
            if (error.response) {
                console.error('응답 상태:', error.response.status);
                console.error('응답 데이터:', error.response.data);
            } else {
                console.error('오류:', error.message);
            }
            throw error;
        }
        
        // 2단계: Selenium으로 카카오 로그인 및 인증 코드 획득
        console.log('\n🔹 2단계: 카카오 로그인 및 인증 코드 획득');
        
        // 테스트 계정 정보 확인
        if (!KAKAO_ID || !KAKAO_PASSWORD) {
            console.warn('⚠️ 카카오 테스트 계정 정보가 설정되지 않았습니다.');
            const useSelenium = await askQuestion('Selenium을 사용하여 수동으로 로그인 하시겠습니까? (y/n): ');
            
            if (useSelenium.toLowerCase() !== 'y') {
                console.log('🔶 자동 테스트를 건너뛰고 수동 테스트 방법을 안내합니다.');
                console.log('\n📝 소셜 로그인 수동 테스트 방법:');
                console.log('1. 다음 URL을 브라우저에서 열어 카카오 계정으로 로그인하세요:');
                console.log(authUrl);
                console.log('2. 로그인 후 리다이렉트되는 URL에서 "code" 파라미터 값을 복사하세요.');
                
                authCode = await askQuestion('인증 코드를 입력하세요: ');
                if (!authCode) {
                    throw new Error('인증 코드가 입력되지 않았습니다.');
                }
                console.log(`👉 입력된 인증 코드: ${authCode}`);
            }
        }
        
        // Selenium 설정 및 브라우저 시작
        if (!authCode) {
            console.log('🌐 Selenium 웹드라이버 설정 중...');
            
            // 크롬 옵션 설정
            const options = new chrome.Options();
            if (HEADLESS) {
                console.log('🖥️ 헤드리스 모드로 실행합니다 (브라우저가 화면에 표시되지 않습니다).');
                options.addArguments('--headless');
            } else {
                console.log('🖥️ 브라우저가 화면에 표시됩니다.');
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
            await driver.manage().setTimeouts({ implicit: 10000 });
            
            try {
                // 카카오 로그인 페이지 열기
                console.log('🌐 카카오 인증 페이지로 이동 중...');
                await driver.get(authUrl);
                await takeScreenshot(driver, 'kakao-login-page');
                
                // 자동 로그인 가능한 경우
                if (KAKAO_ID && KAKAO_PASSWORD) {
                    console.log('🔑 자동 로그인 시도 중...');
                    try {
                        // 로그인 폼이 로드될 때까지 대기
                        await driver.wait(until.elementLocated(By.id('loginId')), TIMEOUT);
                        
                        // 아이디 입력
                        const idField = await driver.findElement(By.id('loginId'));
                        await idField.clear();
                        await idField.sendKeys(KAKAO_ID);
                        
                        // 비밀번호 입력
                        const passwordField = await driver.findElement(By.id('password'));
                        await passwordField.clear();
                        await passwordField.sendKeys(KAKAO_PASSWORD);
                        
                        // 로그인 버튼 클릭
                        console.log('🖱️ 로그인 버튼 클릭...');
                        const loginButton = await driver.findElement(By.className('btn_g highlight submit'));
                        await loginButton.click();
                        
                    } catch (error) {
                        console.warn('⚠️ 자동 로그인 실패:', error.message);
                        console.log('수동 로그인이 필요합니다...');
                    }
                } else {
                    console.log('👤 카카오 계정으로 수동 로그인하세요. 브라우저에서 로그인 작업을 완료하면 다음 단계로 진행됩니다.');
                }
                
                // 리다이렉트 대기 (redirect_uri로 이동)
                console.log('🔄 인증 완료 후 리다이렉트 대기 중...');
                
                let isManualInput = false;
                
                try {
                    // 15초 동안 URL에 'code=' 파라미터가 포함될 때까지 대기
                    await driver.wait(async () => {
                        const currentUrl = await driver.getCurrentUrl();
                        return currentUrl.includes('code=');
                    }, 15000);
                    
                    // 현재 URL에서 code 파라미터 추출
                    const currentUrl = await driver.getCurrentUrl();
                    console.log('👉 리다이렉트된 URL:', currentUrl);
                    
                    const urlObj = new URL(currentUrl);
                    authCode = urlObj.searchParams.get('code');
                    console.log('✅ 인증 코드 획득 성공!');
                    console.log(`👉 인증 코드: ${authCode.substring(0, 10)}...`);
                    
                } catch (error) {
                    console.warn('⚠️ 자동으로 인증 코드를 가져오지 못했습니다:', error.message);
                    await takeScreenshot(driver, 'kakao-auth-failed');
                    
                    isManualInput = true;
                }
                
                // 인증 코드를 얻지 못한 경우 수동 입력 요청
                if (!authCode || isManualInput) {
                    console.log('현재 URL에서 인증 코드를 찾을 수 없습니다.');
                    const currentUrl = await driver.getCurrentUrl();
                    console.log('현재 URL:', currentUrl);
                    
                    authCode = await askQuestion('브라우저에서 리다이렉트된 URL의 "code" 파라미터 값을 입력하세요: ');
                    if (!authCode) {
                        throw new Error('인증 코드가 입력되지 않았습니다.');
                    }
                }
                
            } catch (error) {
                console.error('❌ Selenium 테스트 중 오류:', error.message);
                await takeScreenshot(driver, 'kakao-auth-error');
                throw error;
            }
        }
        
        // 3단계: 인증 코드로 소셜 로그인 API 호출
        console.log('\n🔹 3단계: 소셜 로그인 API 호출');
        try {
            console.log('소셜 로그인 API 호출 중...');
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/social-login`, {
                provider: 'kakao',
                code: authCode
            });
            
            if (loginResponse.data && loginResponse.data.success) {
                loginResult = loginResponse.data;
                console.log('✅ 소셜 로그인 성공!');
                console.log('🔑 로그인 토큰:', loginResult.token ? `${loginResult.token.substring(0, 20)}...` : '없음');
                console.log('👤 사용자 ID:', loginResult.user ? loginResult.user.id : '없음');
                
                // 테스트 결과 저장
                const resultPath = path.join(resultsDir, 'kakao-login-e2e-result.json');
                fs.writeFileSync(resultPath, JSON.stringify({
                    success: true,
                    timestamp: new Date().toISOString(),
                    userId: loginResult.user ? loginResult.user.id : null,
                    tokenPreview: loginResult.token ? `${loginResult.token.substring(0, 10)}...` : null
                }, null, 2));
                
                console.log(`✅ 테스트 결과가 ${resultPath}에 저장되었습니다.`);
                return true;
            } else {
                console.error('❌ 소셜 로그인 실패!');
                console.error('응답:', loginResponse.data);
                throw new Error('소셜 로그인 실패');
            }
        } catch (error) {
            console.error('❌ 소셜 로그인 API 호출 중 오류!');
            if (error.response) {
                console.error('응답 상태:', error.response.status);
                console.error('응답 데이터:', error.response.data);
            } else {
                console.error('오류:', error.message);
            }
            throw error;
        }
        
    } catch (error) {
        console.error('\n❌ E2E 테스트 실패!');
        console.error('오류:', error.message);
        
        // 테스트 실패 결과 저장
        const resultPath = path.join(resultsDir, 'kakao-login-e2e-result.json');
        fs.writeFileSync(resultPath, JSON.stringify({
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message
        }, null, 2));
        
        console.log(`❌ 테스트 실패 결과가 ${resultPath}에 저장되었습니다.`);
        return false;
    } finally {
        // 브라우저 종료
        if (driver) {
            console.log('\n🖥️ 브라우저 종료 중...');
            await driver.quit();
        }
    }
}

// 테스트 실행
(async () => {
    try {
        const success = await runKakaoLoginE2ETest();
        if (success) {
            console.log('\n✅ 카카오 로그인 E2E 테스트 성공!');
            process.exit(0);
        } else {
            console.error('\n❌ 카카오 로그인 E2E 테스트 실패!');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ 예상치 못한 오류:', error);
        process.exit(1);
    }
})(); 