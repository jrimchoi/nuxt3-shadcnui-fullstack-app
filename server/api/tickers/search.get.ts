import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = (query.search as string) || '';
  const name = (query.name as string) || '';

  try {
    const filePath = path.join(process.cwd(), 'data', 'tickers.json');
    
    // data 디렉토리가 없으면 생성
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // 파일이 없으면 all_tickers API를 호출하여 데이터 가져오기
    if (!fs.existsSync(filePath)) {
      const response = await $fetch('/api/tickers/all_tickers');
      fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // 검색 필터 적용
    let filteredData = data.filter((ticker: any) => {
      const matchTicker = !search || 
        ticker.ticker.toLowerCase().includes(search.toLowerCase());
      const matchName = !name || 
        ticker.name.toLowerCase().includes(name.toLowerCase());
      return matchTicker && matchName;
    });

    // 전체 결과 수
    const total = filteredData.length;
    
    // 페이징 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Error in tickers search:', error);
    throw createError({
      statusCode: 500,
      message: '티커 데이터를 가져오는 중 오류가 발생했습니다.',
      cause: error
    });
  }
}); 