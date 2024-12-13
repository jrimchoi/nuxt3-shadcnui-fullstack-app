import fs from 'fs';
import path from 'path';

const MAX_REQUESTS_PER_MINUTE = 5;
const MINUTE = 60 * 1000;
let requestCount = 0;
let lastRequestTime = Date.now();

function canMakeRequest(): boolean {
  const now = Date.now();
  if (now - lastRequestTime >= MINUTE) {
    requestCount = 0;
    lastRequestTime = now;
    return true;
  }
  return requestCount < MAX_REQUESTS_PER_MINUTE;
}

async function waitForNextMinute() {
  const now = Date.now();
  const timeToWait = MINUTE - (now - lastRequestTime);
  console.log(`Waiting for ${timeToWait/1000} seconds...`);
  await new Promise(resolve => setTimeout(resolve, timeToWait));
  requestCount = 0;
  lastRequestTime = Date.now();
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.public.POLYGON_API_KEY;
  const filePath = path.join(process.cwd(), 'data', 'tickers.json');

  try {
    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }

    // 저장된 데이터가 있으면 반환
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }

    // 저장된 데이터가 없으면 API에서 가져오기
    let allTickers = [];
    let nextUrl = `https://api.polygon.io/v3/reference/tickers?active=true&limit=1000&apiKey=${apiKey}`;

    while (nextUrl) {
      // 요청 전 rate limit 체크
      if (!canMakeRequest()) {
        console.log(`Rate limit reached (${requestCount} requests made). Waiting for next minute...`);
        await waitForNextMinute();
      }

      console.log(`Making request #${requestCount + 1}...`);
      requestCount++;
      
      const response = await fetch(nextUrl);
      const data = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error);
      }

      if (data.results) {
        console.log(`Received ${data.results.length} tickers`);
        allTickers = [...allTickers, ...data.results];
      }

      // 다음 URL이 있으면 apiKey 추가
      nextUrl = data.next_url ? `${data.next_url}&apiKey=${apiKey}` : '';
      
      // 다음 요청 전에 잠시 대기 (안전을 위해)
      if (nextUrl) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Total tickers fetched: ${allTickers.length}`);
    
    // 데이터를 파일에 저장
    fs.writeFileSync(filePath, JSON.stringify(allTickers, null, 2));
    console.log('Data saved to file successfully');

    return allTickers;

  } catch (error) {
    console.error('Error in all_tickers:', error);
    throw createError({
      statusCode: 500,
      message: '티커 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});
