import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: '사용자 ID가 필요합니다.'
      });
    }

    const filePath = path.join(process.cwd(), 'data', 'favorites.json');
    
    if (!fs.existsSync(filePath)) {
      return { data: [] };
    }

    const favorites = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const userFavorites = favorites.filter((fav: any) => fav.userId === userId);

    return { data: userFavorites };
  } catch (error) {
    console.error('Error in favorites get:', error);
    throw createError({
      statusCode: 500,
      message: '즐겨찾기 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
}); 