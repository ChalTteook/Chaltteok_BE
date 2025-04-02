#!/usr/bin/env node

/**
 * 카카오 소셜 로그인 종단간(E2E) 테스트 실행 스크립트
 * 
 * 이 스크립트는 카카오 로그인 과정부터 백엔드 API 연동까지
 * 전체 소셜 로그인 플로우를 테스트합니다.
 * 
 * 실행 방법:
 * 1. 환경 변수 설정: test/.env.test 파일에 필요한 정보 입력
 * 2. 실행: node test/run-social-login-e2e-test.js
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
console.log('카카오 소셜 로그인 종단간(E2E) 테스트 실행');
console.log('====================================');

// 환경 변수 설정 확인
if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_REDIRECT_URI) {
    console.error('오류: KAKAO_CLIENT_ID 또는 KAKAO_REDIRECT_URI 환경 변수가 설정되지 않았습니다.');
    console.error('test/.env.test 파일을 확인해주세요.');
    process.exit(1);
}

// API 기본 URL 확인
if (!process.env.API_BASE_URL) {
    console.warn('경고: API_BASE_URL이 설정되지 않아 기본값을 사용합니다: http://localhost:9801/api/v1');
}

// 서버가 실행 중인지 확인
console.log('서버 연결 확인 중...');
try {
    // 간단한 명령으로 서버가 실행 중인지 확인
    // 이 부분은 실제 환경에 맞게 조정 필요
    console.log('서버가 실행 중인지 확인하세요.');
    console.log('서버가 실행되고 있지 않다면 별도의 터미널에서 서버를 실행한 후 테스트를 진행하세요.');
} catch (error) {
    console.warn('경고: 서버 연결 확인에 실패했습니다. 서버가 실행 중인지 확인하세요.');
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
    // 테스트 파일 경로
    const testPath = path.join(__dirname, 'kakao-login-e2e-test.js');
    
    if (!fs.existsSync(testPath)) {
        console.error(`오류: 테스트 파일이 존재하지 않습니다. - ${testPath}`);
        process.exit(1);
    }

    // 헤드리스 모드 설정
    const headless = process.env.HEADLESS !== 'false';
    const headlessOption = headless ? '' : 'HEADLESS=false';
    
    // 테스트 실행
    console.log('\n테스트 실행 중...');
    const command = `${headlessOption} node --experimental-vm-modules node_modules/jest/bin/jest.js ${testPath} --testTimeout=90000`;
    
    execSync(command, { 
        cwd: projectRoot,
        stdio: 'inherit', // 콘솔에 출력 표시
        env: { ...process.env }
    });
    
    console.log('\n✅ 카카오 소셜 로그인 E2E 테스트 실행 완료!');
    
    // 결과 확인
    const resultPath = path.join(resultsDir, 'social-login-result.json');
    if (fs.existsSync(resultPath)) {
        try {
            const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
            console.log('\n📊 테스트 결과 요약:');
            console.log(`- 성공 여부: ${result.success ? '✅ 성공' : '❌ 실패'}`);
            console.log(`- 테스트 시간: ${result.timestamp}`);
            console.log(`- 사용자 ID: ${result.userId}`);
            console.log(`- 토큰: ${result.tokenPreview}`);
        } catch (error) {
            console.error('결과 파일 읽기 실패:', error.message);
        }
    } else if (runAutomatedTest) {
        console.warn('⚠️ 테스트 결과 파일을 찾을 수 없습니다. 테스트가 실패했을 수 있습니다.');
    }
    
    process.exit(0);
} catch (error) {
    console.error('\n❌ 카카오 소셜 로그인 E2E 테스트 실행 중 오류가 발생했습니다.');
    console.error(`오류 메시지: ${error.message}`);
    process.exit(1);
} 