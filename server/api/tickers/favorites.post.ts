import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, favorite_name, ticker } = body;

    if (!userId || !favorite_name || !ticker) {
      throw createError({
        statusCode: 400,
        message: '필수 정보가 누락되었습니다.'
      });
    }

    const filePath = path.join(process.cwd(), 'data', 'favorites.json');
    const dataDir = path.join(process.cwd(), 'data');

    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // 기존 데이터 읽기 또는 새로운 배열 생성
    let favorites = [];
    if (fs.existsSync(filePath)) {
      favorites = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // 새로운 favorite 추가
    favorites.push({
      userId,
      favorite_name,
      ticker,
      createdAt: new Date().toISOString()
    });

    // 파일에 저장
    fs.writeFileSync(filePath, JSON.stringify(favorites, null, 2));

    return { success: true, message: '즐겨찾기가 추가되었습니다.' };
  } catch (error) {
    console.error('Error in favorites post:', error);
    throw createError({
      statusCode: 500,
      message: '즐겨찾기 저장 중 오류가 발생했습니다.'
    });
  }
}); 
 