import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(filePath)) {
      return { data: [] };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(fileContent);
    
    return users.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createError({
      statusCode: 500,
      message: '사용자 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
}); 