/**
 * AI Service Layer
 * 
 * Abstraction layer for AI providers (Groq, OpenAI, Gemini, Claude, etc.)
 * Currently configured for Groq (gsk_... API key format).
 * 
 * To switch providers:
 * 1. Change the provider in config
 * 2. Add the corresponding API key to .env
 * 3. Update the getCompletion function if needed
 */

const AI_PROVIDERS = {
  GROQ: 'groq',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
  DEEPSEEK: 'deepseek',
  OLLAMA: 'ollama',
};

const config = {
  provider: process.env.AI_PROVIDER || AI_PROVIDERS.GROQ,
  groqApiKey: process.env.GROQ_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  claudeApiKey: process.env.CLAUDE_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.AI_MODEL || 'llama3-70b-8192', // Groq default
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 4096,
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
};

/**
 * Get completion from the configured AI provider
 * @param {Array} messages - Array of {role, content} messages
 * @param {Object} options - Optional overrides for model, temperature, etc.
 * @returns {Promise<string>} The AI response text
 */
async function getCompletion(messages, options = {}) {
  const provider = options.provider || config.provider;
  const model = options.model || config.model;
  const temperature = options.temperature ?? config.temperature;

  switch (provider) {
    case AI_PROVIDERS.GROQ:
      return groqCompletion(messages, model, temperature);
    case AI_PROVIDERS.OPENAI:
      return openaiCompletion(messages, model, temperature);
    case AI_PROVIDERS.OLLAMA:
      return ollamaCompletion(messages, model, temperature);
    default:
      return groqCompletion(messages, model, temperature);
  }
}

/**
 * Groq API completion
 */
async function groqCompletion(messages, model, temperature) {
  if (!config.groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured. Set it in your .env file.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: model || 'llama3-70b-8192',
      messages,
      temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * OpenAI API completion (placeholder - ready for future use)
 */
async function openaiCompletion(messages, model, temperature) {
  throw new Error('OpenAI provider not yet implemented. Switch to Groq or configure OpenAI key.');
}

/**
 * Ollama API completion (placeholder - for local AI)
 */
async function ollamaCompletion(messages, model, temperature) {
  throw new Error('Ollama provider not yet implemented. Switch to Groq or configure Ollama.');
}

/**
 * Structured AI prompts for each feature
 */
const PROMPTS = {
  summarize: (text) => ({
    role: 'user',
    content: `Summarize the following note concisely, extracting the key points and main ideas:\n\n"""${text}"""`,
  }),

  rewrite: (text, tone) => ({
    role: 'user', 
    content: `Rewrite the following note in a ${tone} tone. Keep the same information but adjust the style:\n\n"""${text}"""`,
  }),

  continueWriting: (text) => ({
    role: 'user',
    content: `Continue writing the following incomplete note naturally, maintaining the same style and topic:\n\n"""${text}"""`,
  }),

  grammarCheck: (text) => ({
    role: 'user',
    content: `Check the following text for grammar, spelling, and punctuation errors. Return a corrected version with a brief list of changes made:\n\n"""${text}"""`,
  }),

  improveWriting: (text) => ({
    role: 'user',
    content: `Improve the following text for clarity, readability, and sentence structure. Maintain the original meaning:\n\n"""${text}"""`,
  }),

  translate: (text, language) => ({
    role: 'user',
    content: `Translate the following text into ${language}. Preserve the original meaning and tone:\n\n"""${text}"""`,
  }),

  explain: (text) => ({
    role: 'user',
    content: `Explain the following topic in simple, easy-to-understand language. Break down complex concepts:\n\n"""${text}"""`,
  }),

  chatWithNotes: (question, context) => ({
    role: 'user',
    content: `Based on the following notes, answer this question: "${question}"\n\nNotes context:\n"""${context}"""`,
  }),

  smartSearch: (query, notes) => ({
    role: 'user',
    content: `Given these notes, find the most relevant ones matching this natural language query: "${query}"\n\nNotes:\n"""${notes}"""`,
  }),

  smartTags: (text) => ({
    role: 'user',
    content: `Generate 3-5 relevant tags for the following note. Return only the tags as a comma-separated list:\n\n"""${text}"""`,
  }),

  flashcards: (text) => ({
    role: 'user',
    content: `Convert the following notes into study flashcards. Format each as Q: [question] / A: [answer]. Create at least 5 flashcards:\n\n"""${text}"""`,
  }),

  quizGenerator: (text, type) => ({
    role: 'user',
    content: `Generate ${type} questions from the following notes. Include the correct answers:\n\n"""${text}"""`,
  }),

  mindMap: (text) => ({
    role: 'user',
    content: `Convert the following notes into a mind map structure. Use indentation to show hierarchical relationships:\n\n"""${text}"""`,
  }),

  meetingNotes: (text) => ({
    role: 'user',
    content: `Convert the following meeting notes into structured minutes. Include: attendees, decisions made, action items, and next steps:\n\n"""${text}"""`,
  }),

  actionItems: (text) => ({
    role: 'user',
    content: `Extract all tasks, deadlines, and responsibilities from the following notes. Format as a bulleted action list:\n\n"""${text}"""`,
  }),

  pdfSummarizer: (text) => ({
    role: 'user',
    content: `Summarize the following PDF content concisely, highlighting key findings and conclusions:\n\n"""${text}"""`,
  }),

  ocrText: (text) => ({
    role: 'user',
    content: `Clean up and format the following OCR-extracted text, correcting any obvious errors:\n\n"""${text}"""`,
  }),

  voiceToNotes: (text) => ({
    role: 'user',
    content: `Convert the following voice transcription into well-formatted, organized notes:\n\n"""${text}"""`,
  }),

  emailGenerator: (text, tone) => ({
    role: 'user',
    content: `Convert the following notes into a professional email with a ${tone} tone. Include subject line, greeting, body, and signature:\n\n"""${text}"""`,
  }),

  blogGenerator: (text) => ({
    role: 'user',
    content: `Expand the following notes into a well-structured blog post or article with headings and paragraphs:\n\n"""${text}"""`,
  }),

  studyNotes: (text) => ({
    role: 'user',
    content: `Convert the following complex notes into easy-to-read study material. Use headings, bullet points, and summaries:\n\n"""${text}"""`,
  }),

  interviewQuestions: (text) => ({
    role: 'user',
    content: `Generate interview questions based on the following technical or study notes. Include expected answers:\n\n"""${text}"""`,
  }),

  todoGenerator: (text) => ({
    role: 'user',
    content: `Extract actionable tasks from the following notes and create a structured to-do list with priorities:\n\n"""${text}"""`,
  }),

  presentationGenerator: (text) => ({
    role: 'user',
    content: `Convert the following notes into presentation slides format. Use --- to separate slides. Each slide should have a title and bullet points:\n\n"""${text}"""`,
  }),

  timelineGenerator: (text) => ({
    role: 'user',
    content: `Convert the following notes into a chronological timeline. Format as: [Date/Time] - [Event/Item]:\n\n"""${text}"""`,
  }),

  tableGenerator: (text) => ({
    role: 'user',
    content: `Convert the following plain text into a structured table. Use markdown table format:\n\n"""${text}"""`,
  }),

  codeExplanation: (code) => ({
    role: 'user',
    content: `Explain the following code snippet in simple language. Describe what it does, how it works, and any important concepts:\n\n"""${code}"""`,
  }),

  codeGenerator: (prompt, language) => ({
    role: 'user',
    content: `Generate ${language} code based on the following description. Include comments explaining the code:\n\n"""${prompt}"""`,
  }),

  dailyRecap: (notes) => ({
    role: 'user',
    content: `Generate a brief daily recap summarizing the following notes created today:\n\n"""${notes}"""`,
  }),

  weeklyInsights: (notes) => ({
    role: 'user',
    content: `Analyze the following notes and provide weekly insights including: writing statistics, productivity trends, and suggestions for improvement:\n\n"""${notes}"""`,
  }),
};

/**
 * Execute an AI feature with the given parameters
 * @param {string} feature - Feature name (e.g., 'summarize', 'rewrite')
 * @param {Object} params - Feature-specific parameters
 * @returns {Promise<Object>} { result, usage }
 */
async function executeFeature(feature, params = {}) {
  const promptFn = PROMPTS[feature];
  if (!promptFn) {
    throw new Error(`Unknown AI feature: ${feature}`);
  }

  const { text, code, notes, question, context, tone, language, type, prompt: userPrompt } = params;

  // Build the appropriate message based on feature
  let messages = [];

  switch (feature) {
    case 'rewrite':
      messages = [
        { role: 'system', content: 'You are a professional writing assistant.' },
        promptFn(text, tone || 'professional'),
      ];
      break;
    case 'translate':
      messages = [
        { role: 'system', content: 'You are a professional translator.' },
        promptFn(text, language || 'English'),
      ];
      break;
    case 'chatWithNotes':
      messages = [
        { role: 'system', content: 'You are a helpful assistant that answers questions based on the user\'s notes.' },
        promptFn(question, context),
      ];
      break;
    case 'smartSearch':
      messages = [
        { role: 'system', content: 'You are a search assistant that finds relevant information from notes.' },
        promptFn(query, notes),
      ];
      break;
    case 'codeGenerator':
      messages = [
        { role: 'system', content: 'You are a code generation assistant.' },
        promptFn(userPrompt, language || 'JavaScript'),
      ];
      break;
    case 'quizGenerator':
      messages = [
        { role: 'system', content: 'You are an educational assistant that creates quizzes.' },
        promptFn(text, type || 'MCQs'),
      ];
      break;
    case 'emailGenerator':
      messages = [
        { role: 'system', content: 'You are a professional email writing assistant.' },
        promptFn(text, tone || 'professional'),
      ];
      break;
    default:
      messages = [
        { role: 'system', content: 'You are a helpful AI assistant for a note-taking application.' },
        promptFn(text || code || notes),
      ];
  }

  const result = await getCompletion(messages);
  return { result, provider: config.provider, model: config.model };
}

module.exports = {
  executeFeature,
  getCompletion,
  PROMPTS,
  AI_PROVIDERS,
  config,
};
