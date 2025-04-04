// 2025-04-04: Created API client for Gemini integration
// - Handles communication with Express backend
// - Provides methods for text generation and prize suggestions
// - Includes error handling and response formatting

class ApiClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async generateText(prompt, maxTokens = 256) {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, maxTokens }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  async suggestPrizes(theme, count = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/suggest-prizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, count }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suggest prizes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error suggesting prizes:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}
