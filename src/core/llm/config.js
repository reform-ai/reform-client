// LLM Configuration
// Set your OpenAI API key here or as an environment variable

export const LLM_CONFIG = {
  // Get your API key from: https://platform.openai.com/api-keys
  // Replace 'your-openai-api-key-here' with your actual API key
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
  
  // Model configuration
  MODEL: 'gpt-4',
  MAX_TOKENS: 50,
  TEMPERATURE: 0.7,
  
  // Rate limiting (optional)
  MAX_REQUESTS_PER_MINUTE: 20,
  
  // Fallback settings
  ENABLE_FALLBACK: true,
  FALLBACK_DELAY_MS: 1000
};

// Instructions for setup:
// 1. Get your OpenAI API key from https://platform.openai.com/api-keys
// 2. Set it as an environment variable: export OPENAI_API_KEY="your-key-here"
// 3. Or replace 'your-openai-api-key-here' above with your actual key
// 4. Install OpenAI package: npm install openai
