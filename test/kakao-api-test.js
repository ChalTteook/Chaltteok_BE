#!/usr/bin/env node

/**
 * 카카오 소셜 로그인 API 테스트 스크립트
 * 
 * 이 스크립트는 다음 기능을 테스트합니다:
 * 1. 카카오 인증 URL 획득 (/api/v1/auth/kakao_auth)
 * 2. 인증 코드를 수동으로 입력받음
 * 3. 인증 코드로 소셜 로그인 API 호출 (/api/v1/auth/social-login)
 * 
 * 실행 방법: node test/kakao-api-test.js
 */

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

// API 테스트 실행 함수
async function runKakaoLoginApiTest() {
    console.log('====================================');
    console.log('카카오 소셜 로그인 API 테스트');
    console.log('====================================');
    
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
                console.log(`👉 인증 URL: ${authUrl}`);
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
        
        // 2단계: 인증 코드 수동 입력
        console.log('\n🔹 2단계: 인증 코드 획득');
        console.log('📝 소셜 로그인 수동 테스트 방법:');
        console.log('1. 다음 URL을 브라우저에서 복사하여 열고 카카오 계정으로 로그인하세요:');
        console.log(authUrl);
        console.log('2. 로그인 후 리다이렉트되는 URL에서 "code" 파라미터 값을 복사하세요.');
        
        authCode = await askQuestion('인증 코드를 입력하세요: ');
        if (!authCode) {
            throw new Error('인증 코드가 입력되지 않았습니다.');
        }
        console.log(`👉 입력된 인증 코드: ${authCode}`);
        
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
                
                if (loginResult.token) {
                    console.log('🔑 로그인 토큰:', `${loginResult.token.substring(0, 20)}...`);
                }
                
                if (loginResult.user) {
                    console.log('👤 사용자 정보:');
                    console.log(`   ID: ${loginResult.user.id}`);
                    console.log(`   소셜 ID: ${loginResult.user.socialId}`);
                    console.log(`   타입: ${loginResult.user.type}`);
                    // 추가 사용자 정보가 있다면 출력
                    if (loginResult.user.name) console.log(`   이름: ${loginResult.user.name}`);
                    if (loginResult.user.email) console.log(`   이메일: ${loginResult.user.email}`);
                }
                
                // 테스트 결과 저장
                const resultPath = path.join(resultsDir, 'kakao-login-api-result.json');
                fs.writeFileSync(resultPath, JSON.stringify({
                    success: true,
                    timestamp: new Date().toISOString(),
                    userId: loginResult.user ? loginResult.user.id : null,
                    tokenPreview: loginResult.token ? `${loginResult.token.substring(0, 10)}...` : null
                }, null, 2));
                
                console.log(`\n✅ 테스트 결과가 ${resultPath}에 저장되었습니다.`);
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
        console.error('\n❌ API 테스트 실패!');
        console.error('오류:', error.message);
        
        // 테스트 실패 결과 저장
        const resultPath = path.join(resultsDir, 'kakao-login-api-result.json');
        fs.writeFileSync(resultPath, JSON.stringify({
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message
        }, null, 2));
        
        console.log(`\n❌ 테스트 실패 결과가 ${resultPath}에 저장되었습니다.`);
        return false;
    }
}

// 테스트 실행
(async () => {
    try {
        const success = await runKakaoLoginApiTest();
        if (success) {
            console.log('\n✅ 카카오 소셜 로그인 API 테스트 성공!');
            process.exit(0);
        } else {
            console.error('\n❌ 카카오 소셜 로그인 API 테스트 실패!');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ 예상치 못한 오류:', error);
        process.exit(1);
    }
})(); 