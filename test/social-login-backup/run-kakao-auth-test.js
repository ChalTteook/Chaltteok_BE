#!/usr/bin/env node

/**
 * 카카오 인증 코드 테스트 실행 스크립트
 * 
 * 이 스크립트는 Selenium 웹드라이버를 사용하여 카카오 로그인 과정을 자동화하고
 * 인증 코드를 획득하는 테스트를 실행합니다.
 * 
 * 실행 방법:
 * 1. 환경 변수 설정: test/.env.test 파일을 수정하여 필요한 설정 입력
 * 2. 실행: node test/run-kakao-auth-test.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// 환경 변수 설정 파일 로드
dotenv.config({ path: './test/.env.test' });

// __dirname 설정 (ES Modules에서는 __dirname이 기본적으로 정의되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 경로
const projectRoot = path.resolve(__dirname, '..');

// 결과 저장을 위한 디렉토리
const resultsDir = path.join(projectRoot, 'test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

console.log('====================================');
console.log('카카오 인증 자동화 테스트 실행');
console.log('====================================');

// 환경 변수 설정 확인
if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_REDIRECT_URI) {
    console.error('오류: KAKAO_CLIENT_ID 또는 KAKAO_REDIRECT_URI 환경 변수가 설정되지 않았습니다.');
    console.error('test/.env.test 파일을 확인해주세요.');
    process.exit(1);
}

// 자동화 테스트 실행 여부 확인
let runAutomatedTest = false;
if (process.env.KAKAO_TEST_ID && process.env.KAKAO_TEST_PASSWORD) {
    runAutomatedTest = true;
    console.log('✅ 카카오 테스트 계정이 설정되어 있어 자동화 테스트를 실행합니다.');
} else {
    console.log('⚠️ 카카오 테스트 계정이 설정되지 않아 수동 가이드만 제공합니다.');
}

try {
    // 카카오 인증 테스트 실행
    const testPath = path.join(__dirname, 'kakao-login-automation.test.js');
    
    if (!fs.existsSync(testPath)) {
        console.error(`오류: 테스트 파일이 존재하지 않습니다. - ${testPath}`);
        process.exit(1);
    }

    // 테스트 실행
    const command = `node --experimental-vm-modules node_modules/jest/bin/jest.js ${testPath} --testTimeout=60000`;
    execSync(command, { 
        cwd: projectRoot,
        stdio: 'inherit' // 콘솔에 출력 표시
    });
    
    console.log('\n✅ 카카오 인증 테스트 실행 완료!');
    
    if (!runAutomatedTest) {
        console.log('\n📝 인증 코드를 획득한 후, 다음 명령으로 소셜 로그인 API를 직접 테스트할 수 있습니다:');
        console.log(`curl -X POST "http://localhost:9801/api/v1/auth/social-login" \\
       -H "Content-Type: application/json" \\
       -d '{"provider": "kakao", "code": "획득한_인증_코드"}'`);
    }
    
    process.exit(0);
} catch (error) {
    console.error('\n❌ 카카오 인증 테스트 실행 중 오류가 발생했습니다.');
    console.error(`오류 메시지: ${error.message}`);
    process.exit(1);
} 