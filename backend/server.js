const express = require('express');
const cors = require('cors');

// ★ 최신 버전(v3) 규칙에 맞게 코드를 수정했습니다 ★
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const app = express();
app.use(cors()); 

app.get('/api/price/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const result = await yahooFinance.quote(ticker);
        
        res.json({
            ticker: ticker,
            name: result.shortName || ticker,
            price: result.regularMarketPrice,
            currency: result.currency
        });
    } catch (error) {
        console.error('에러 발생:', error.message);
        res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
    }
});

// 인터넷 배포를 위해 포트 설정을 유연하게 변경합니다.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`백엔드 서버 실행 중: 포트 ${PORT}`);
});