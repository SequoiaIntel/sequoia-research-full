const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Your Anthropic API key - keep this secure!
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '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';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Stock analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    console.log('📊 Analysis request received for:', req.body.ticker);
    
    const { ticker, researchPrompt } = req.body;

    if (!ticker || !researchPrompt) {
      return res.status(400).json({ 
        error: 'Missing ticker or research prompt' 
      });
    }

    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('❌ No API key configured');
      return res.status(500).json({ 
        error: 'API key not configured' 
      });
    }

    console.log('🚀 Making request to Anthropic API...');

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          { role: "user", content: researchPrompt }
        ]
      })
    });

    console.log('📡 Anthropic API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Anthropic API error:', errorText);
      return res.status(response.status).json({ 
        error: `Anthropic API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Successfully got response from Anthropic');

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.log('❌ Unexpected response structure:', data);
      return res.status(500).json({ 
        error: 'Invalid response structure from Anthropic API' 
      });
    }

    let responseText = data.content[0].text;
    
    // Clean up the response to ensure valid JSON
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
      console.log('✅ Successfully parsed analysis result');
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError);
      console.log('❌ Failed to parse text:', responseText.substring(0, 200) + '...');
      return res.status(500).json({ 
        error: 'Failed to parse analysis result as JSON',
        rawResponse: responseText.substring(0, 500)
      });
    }

    // Add metadata
    analysisResult.id = Date.now();
    analysisResult.created_at = new Date().toISOString();

    console.log('🎉 Sending successful analysis result');
    res.json(analysisResult);

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`🔑 API Key configured: ${ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;
