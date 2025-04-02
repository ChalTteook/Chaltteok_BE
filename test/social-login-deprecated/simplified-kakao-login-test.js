#!/usr/bin/env node

/**
 * 간소화된 카카오 로그인 테스트 스크립트
 * 
 * 이 스크립트는 카카오 인증 URL을 가져오고, API 엔드포인트가 
 * 올바르게 응답하는지 확인합니다. 실제 로그인은 수행하지 않으며
 * API 연결이 올바르게 구성되어 있는지 확인하는 용도입니다.
 * 
 * 실행 방법: node test/simplified-kakao-login-test.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경 변수 로드
dotenv.config({ path: './test/.env.test' });

// __dirname 설정 (ES Modules에서는 __dirname이 기본적으로 정의되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API 기본 URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9801/api/v1';

async function runKakaoLoginTest() {
  console.log('====================================');
  console.log('간소화된 카카오 로그인 테스트');
  console.log('====================================');
  
  try {
    console.log('1. 카카오 인증 URL 요청 중...');
    const response = await axios.get(`${API_BASE_URL}/auth/kakao_auth`);
    
    if (response.data && response.data.success && response.data.data) {
      console.log('✅ 카카오 인증 URL 가져오기 성공!');
      const authUrl = response.data.data;
      console.log(`👉 인증 URL: ${authUrl.substring(0, 50)}...`);
      
      // 테스트 결과를 파일에 저장
      const resultPath = path.join(__dirname, 'kakao-login-test-result.json');
      fs.writeFileSync(resultPath, JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        authUrl: authUrl
      }, null, 2));
      
      console.log(`✅ 테스트 결과가 ${resultPath}에 저장되었습니다.`);
      
      // 인증 URL을 받았으므로 API 엔드포인트가 올바르게 구성됨
      console.log('\n📝 소셜 로그인 수동 테스트 방법:');
      console.log('1. 위 URL을 브라우저에서 열고 카카오 계정으로 로그인');
      console.log('2. 인증 후 리다이렉트 URL에서 인증 코드(code 파라미터) 확인');
      console.log('3. 인증 코드로 아래 명령 실행:');
      console.log(`curl -X POST "${API_BASE_URL}/auth/social-login" \\
     -H "Content-Type: application/json" \\
     -d '{"provider": "kakao", "code": "인증_코드"}'`);
      
      return true;
    } else {
      console.error('❌ 카카오 인증 URL 가져오기 실패!');
      console.error('응답:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생!');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else {
      console.error('오류:', error.message);
    }
    return false;
  }
}

// 테스트 실행
runKakaoLoginTest()
  .then(success => {
    if (success) {
      console.log('\n✅ 카카오 로그인 테스트 완료!');
      process.exit(0);
    } else {
      console.error('\n❌ 카카오 로그인 테스트 실패!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ 예상치 못한 오류:', error);
    process.exit(1);
  }); 