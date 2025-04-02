import UserService from '../../src/services/userService.js';
import UserModel from '../../src/models/userModel.js';

// 테스트 사용자 생성
const createTestUser = async () => {
  try {
    console.log('새로운 테스트 사용자 생성 중...');
    
    // 기존 사용자 확인
    const existingUser = await UserService.findByEmail('test@newaccount.com');
    if (existingUser) {
      console.log('테스트 사용자가 이미 존재합니다:', existingUser.email);
      return existingUser;
    }
    
    // 새 사용자 모델 생성
    const userData = {
      email: 'test@newaccount.com',
      password: 'newpass1234',
      name: '새로운 테스트 사용자',
      phone: '01087654321',
      address: '서울시 마포구',
      age: 28,
      gender: 'F',
      nickName: '새테스트닉네임'
    };
    
    const userModel = new UserModel(userData);
    
    // 사용자 생성
    const newUser = await UserService.createUser(userModel);
    console.log('테스트 사용자가 성공적으로 생성되었습니다:', newUser.email);
    return newUser;
  } catch (error) {
    console.error('테스트 사용자 생성 오류:', error);
    throw error;
  }
};

// 스크립트 실행
createTestUser()
  .then(() => {
    console.log('스크립트 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('스크립트 오류:', error);
    process.exit(1);
  }); 