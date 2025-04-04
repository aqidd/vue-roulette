// 2025-04-04: Created Express server with Gemini API integration
// - Simple REST API for LLM capabilities
// - Environment variables for API key security
// - CORS enabled for frontend communication
// - Error handling for API requests

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Gemini text generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, maxTokens = 256 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      generated_text: text,
      model: process.env.GEMINI_MODEL
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
});

// Prize suggestion endpoint using Gemini
app.post('/api/suggest-prizes', async (req, res) => {
  try {
    const { theme, count = 5 } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
    
    const prompt = `Generate ${count} creative prize ideas for a roulette wheel with the theme: "${theme}". 
    Return only the prize names as a JSON array of strings. No explanations or other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array from response
    let prizes;
    try {
      // Try to extract JSON if the response is wrapped in code blocks or has extra text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        prizes = JSON.parse(jsonMatch[0]);
      } else {
        prizes = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response:', parseError);
      // Fallback: split by commas or newlines if JSON parsing fails
      prizes = text.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
    }

    res.status(200).json({ prizes });
  } catch (error) {
    console.error('Error suggesting prizes:', error);
    res.status(500).json({ 
      error: 'Failed to suggest prizes',
      details: error.message 
    });
  }
});

// Catch-all route to redirect back to index.html (for SPA routing)
app.get('*', (req, res) => {
  // Skip API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});
