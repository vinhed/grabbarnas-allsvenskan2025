const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 52996;

app.use(cors());

app.get('/api/allsvenskan/standings', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;

    const targetUrl = 'https://allsvenskan.se/data-endpoint/statistics/standings/2025/total';
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch data');
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
