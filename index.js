import express from 'express';
import doSomeHeavyTask from './util.js';
import client from 'prom-client';

const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is up and running!' });
});

app.get('/slow', async (req, res) => {
    try {
        const timeTaken = await doSomeHeavyTask();
        res.status(200).json({ success: true, message: `Task completed in ${timeTaken} ms` });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
})

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});