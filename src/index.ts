import express from 'express';

const app = express();
const PORT = 7001;

app.get('/', (_, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
