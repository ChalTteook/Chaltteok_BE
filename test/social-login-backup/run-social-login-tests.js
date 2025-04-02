#!/usr/bin/env node

/**
 * 소셜 로그인 테스트 실행 스크립트
 * 
 * 이 스크립트는 Chaltteok_BE 프로젝트의 소셜 로그인 관련 모든 테스트를 실행합니다.
 * 소셜 로그인 기능 수정 후 정상 작동하는지 검증하기 위한 목적으로 사용됩니다.
 * 
 * 실행 방법: node test/run-social-login-tests.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// __dirname 설정 (ES Modules에서는 __dirname이 기본적으로 정의되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 경로
const projectRoot = path.resolve(__dirname, '..');

// 테스트 대상 파일들
const testFiles = [
    'kakaoAuthService.test.js',
    'naverAauthService.test.js',
    'socialLogin.test.js',
    'authController.test.js'
];

// 결과 저장을 위한 디렉토리
const resultsDir = path.join(projectRoot, 'test-results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
}

console.log('====================================');
console.log('소셜 로그인 테스트 실행을 시작합니다...');
console.log('====================================');

// 각 테스트 파일 실행
let hasError = false;
for (const testFile of testFiles) {
    try {
        console.log(`\n테스트 실행 중: ${testFile}...`);
        const testPath = path.join(__dirname, testFile);
        
        if (!fs.existsSync(testPath)) {
            console.error(`오류: 테스트 파일이 존재하지 않습니다. - ${testPath}`);
            continue;
        }

        const command = `node --experimental-vm-modules node_modules/jest/bin/jest.js ${testPath}`;
        execSync(command, { 
            cwd: projectRoot,
            stdio: 'inherit' // 콘솔에 출력 표시
        });
        
        console.log(`✅ 테스트 성공: ${testFile}`);
    } catch (error) {
        hasError = true;
        console.error(`❌ 테스트 실패: ${testFile}`);
        console.error(`오류 메시지: ${error.message}`);
    }
}

console.log('\n====================================');
if (hasError) {
    console.error('❌ 일부 테스트가 실패했습니다. 위의 오류 메시지를 확인하세요.');
    process.exit(1);
} else {
    console.log('✅ 모든 소셜 로그인 테스트가 성공적으로 완료되었습니다!');
    process.exit(0);
} 