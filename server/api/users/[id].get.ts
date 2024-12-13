import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const user = users.find((u: any) => u.id === id);

    if (!user) {
      throw createError({
        statusCode: 404,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw createError({
      statusCode: 500,
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
}); 