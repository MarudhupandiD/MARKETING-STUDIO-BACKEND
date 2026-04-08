const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (response.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.error?.message || 'API error. Please try again.' });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    res.json({ result: text });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
