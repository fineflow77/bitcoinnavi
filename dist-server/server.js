import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'https://btcplan.jp'] }));
app.use(express.json());
app.use(express.static('dist'));
const serveIndex = (req, res) => {
    res.sendFile('index.html', { root: 'dist' });
};
app.get('*', serveIndex);
app.use((err, req, res, next) => {
    console.error('未処理エラー:', err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました', message: err.message });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
});
