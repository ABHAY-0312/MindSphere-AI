import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import JSON5 from 'json5';

let genAI;
let model;

/**
 * Retry wrapper for Gemini API calls
 * Handles rate limiting and service unavailable errors (503, 429)
 * @param {Function} apiCall - The async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Result of the API call
 */
const retryWithExponentialBackoff = async (apiCall, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Gemini API attempt ${attempt}/${maxRetries}`);
      const result = await apiCall();
      console.log(`✅ Gemini API succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable (503 Service Unavailable, 429 Too Many Requests, 500 Internal Server Error)
      const isRetryable = error.status === 503 || error.status === 429 || error.status === 500;
      
      if (!isRetryable) {
        // Not a retryable error, throw immediately
        throw error;
      }
      
      if (attempt === maxRetries) {
        // Last attempt failed, throw error
        break;
      }
      
      // Calculate exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.warn(`⚠️ Gemini API error (${error.status}). Retrying in ${delayMs}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // All retries exhausted
  throw lastError;
};

// Generate a comprehensive note for a section on demand
export const generateComprehensiveNote = async (courseTitle, sectionTitle, summary, courseContext) => {
  if (!model) {
    throw new Error('Gemini AI is not initialized. Please check your API key.');
  }

  const prompt = `You are an expert educational content creator. Given the following course and section, generate a high-quality, one-page comprehensive note for the section. The note should be clear, well-structured, and suitable for deep understanding and revision. Avoid repeating the summary points; instead, expand on them with rich, specific, and educational content. Use engaging language and examples where appropriate.

Course Title: ${courseTitle}
Section Title: ${sectionTitle}
Section Summary (bullets):\n${summary}
Course Context (topics, other sections):\n${courseContext}

Return only the comprehensive note as a single string, no JSON or markdown formatting.`;

  try {
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating comprehensive note:', error);
    throw new Error('Failed to generate comprehensive note. Please try again.');
  }
};

export const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set. AI features will be disabled.');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`✅ Gemini AI initialized with model: ${modelName}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
    return false;
  }
};

export const generateCourseContent = async (title, sourceType, source) => {
  if (!model) {
    throw new Error('Gemini AI is not initialized. Please check your API key.');
  }
  
  let prompt;
  if (sourceType === 'pdf') {
   prompt = `You are an expert educational content creator. Analyze the following PDF content and generate a course:

Title: ${title}
Source Type: PDF
PDF Content: ${source}

Instructions:
1. Generate a brief summary (2-3 sentences).
2. Identify the category and level (Beginner, Intermediate, or Advanced).
3. List 3-5 key topics covered.
4. Create 5-8 lessons (title, description, duration, detailed content).
5. Generate exactly 5 multiple-choice questions (MCQ) based on the PDF content. For each question:
  - Provide 4 options (A, B, C, D).
  - IMPORTANT: Randomly vary the position of the correct answer (sometimes A, sometimes B, C, or D) to avoid predictable patterns.
  - Specify the correct answer.
  - For each incorrect option (A, B, C, D), provide a detailed, non-empty explanation of why it is incorrect. Do NOT leave any explanation blank or generic. Each explanation must be specific to the option and the question.
  - For the correct answer, provide a detailed, non-empty explanation of why it is correct. The explanation must clearly reference the question and the options, and explain why this answer is correct compared to the others. Do NOT leave this blank or generic.
  - If any explanation is missing, incomplete, or generic, regenerate that question.
  - Indicate the difficulty (easy, medium, or hard).
6. Generate 8-12 flashcards (front, back, difficulty).
7. Create 3-5 high-quality notes sections. For each note:
  - Provide a clear, concise headline (title) for the note. This will be shown as a clickable/expandable headline in the UI.
  - Provide a crisp summary (4-5 bullet points) for the note. Each bullet should be a key fact, insight, or takeaway from the section. Do NOT generate a comprehensive explanation or details at this stage.
  - Each note should be based on a key concept or section from the PDF.

Return the response as a valid JSON object with this exact structure:
{
  "summary": "string",
  "category": "string",
  "level": "Beginner|Intermediate|Advanced",
  "topics": ["string"],
  "lessons": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "content": "string",
      "order": number
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanations": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctExplanation": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "notes": [
    {
      "title": "string", // headline for the note
      "summary": "string", // crisp summary for the note (4-5 bullet points)
      "topics": ["string"]
    }
  ]
}`;
  } else {
    prompt = `You are an expert educational content creator. Create a comprehensive course structure based on the following:

Title: ${title}
Source Type: ${sourceType}
Source: ${source}

Generate a detailed course with:
1. A brief summary (2-3 sentences)
2. Category (e.g., Programming, Data Science, Business, Design, etc.)
3. Level (Beginner, Intermediate, or Advanced)
4. 3-5 key topics covered
5. 5-8 lessons with:
   - Title
   - Description (2-3 sentences)
   - Duration (e.g., "15 min", "30 min")
   - Detailed content (3-4 paragraphs)
6. 5-10 quiz questions with:
   - Question text
   - Type (multiple-choice, true-false, or fill-blank)
   - For multiple-choice questions: randomly vary the position of the correct answer (sometimes A, sometimes B, C, or D) to avoid predictable patterns
   - Options (for multiple-choice)
   - Correct answer
   - Explanation
   - Difficulty (easy, medium, or hard)
7. 8-12 flashcards with:
   - Front (question or term)
   - Back (answer or definition)
   - Difficulty level
8. 3-5 comprehensive notes with:
   - Title
   - Content (detailed explanation)
   - Related topics

Return the response as a valid JSON object with this exact structure:
{
  "summary": "string",
  "category": "string",
  "level": "Beginner|Intermediate|Advanced",
  "topics": ["string"],
  "lessons": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "content": "string",
      "order": number
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice|true-false|fill-blank",
      "question": "string",
      "options": ["string"] or null,
      "correctAnswer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "notes": [
    {
      "title": "string",
      "content": "string",
      "topics": ["string"]
    }
  ]
}`;
  }

  try {
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    const text = response.text();

    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Try to find JSON object in the text
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) {
        jsonText = objMatch[0];
      }
    }

    try {
      // Try normal JSON.parse first
      return JSON.parse(jsonText);
    } catch (parseErr) {
      // Log the raw response for debugging
      console.error('Raw AI response (for debugging):', jsonText);
      // Try JSON5 as a fallback (handles comments, trailing commas, unquoted keys)
      try {
        return JSON5.parse(jsonText);
      } catch (json5Err) {
        // Only apply minimal fixes: remove bold markdown
        let fixed = jsonText.replace(/\*\*(.*?)\*\*/g, '$1');
        try {
          return JSON5.parse(fixed);
        } catch (finalErr) {
          console.error('Fixed AI response (for debugging):', fixed);
          console.error('Still failed to parse AI response:', finalErr);
          throw new Error('Failed to parse AI response. Please try again.');
        }
      }
    }
  } catch (error) {
    console.error('Error generating course content:', error);
    throw new Error('Failed to generate course content. Please try again.');
  }
};

export const generateChatResponse = async (message, coursesContext) => {
  if (!model) {
    throw new Error('Gemini AI is not initialized. Please check your API key.');
  }
  
  const contextInfo = coursesContext.length > 0
    ? `The user is enrolled in these courses:\n${coursesContext.map(c => `- ${c.title}: ${c.summary || 'No summary'}`).join('\n')}`
    : 'The user has not enrolled in any courses yet.';
  
  const prompt = `You are a concise AI tutor helping a student learn. ${contextInfo}

Student's question: ${message}

IMPORTANT: Provide a SHORT, DIRECT answer (2-4 sentences max). 
- Answer the question directly and concisely
- No lengthy explanations or extra details unless specifically asked
- If the question relates to their enrolled courses, mention it briefly
- Be clear and to the point`;

  try {
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

export const generateAdditionalQuizQuestions = async (courseTitle, courseTopic, existingQuestions = 5) => {
  if (!model) {
    throw new Error('Gemini AI is not initialized. Please check your API key.');
  }

  const prompt = `You are an expert educational content creator. Generate ${existingQuestions} new and unique multiple-choice quiz questions for the following course topic. These questions should be different from the existing ones and test deeper understanding.

Course Title: ${courseTitle}
Course Topic: ${courseTopic}

For each question:
- Provide 4 distinct options (A, B, C, D).
- IMPORTANT: Randomly vary the position of the correct answer (sometimes A, sometimes B, C, or D) to avoid predictable patterns. Do NOT always put the correct answer in the same position.
- Specify the correct answer clearly.
- For each option, provide a detailed explanation of why it is correct or incorrect.
- Provide a specific explanation for why the correct answer is right, referencing the question and options.
- Vary the difficulty level (easy, medium, hard).

Return the response as a valid JSON object with this exact structure:
{
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanations": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctExplanation": "string",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  try {
    console.log('🤖 Calling Gemini AI for additional quiz questions...');
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    console.log('✅ Gemini API call completed');
    
    const response = await result.response;
    if (!response) {
      throw new Error('No response object from Gemini API');
    }
    
    // Check for safety ratings and blocked content
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('⚠️ Finish reason not STOP:', candidate.finishReason);
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Gemini blocked content due to safety filters. Please try with different course topic.');
        }
      }
    }
    
    const text = response.text();
    console.log('📝 Raw response length:', text.length, 'characters');
    
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned empty response text');
    }

    let jsonText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
      console.log('✅ Extracted JSON from code block');
    } else {
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) {
        jsonText = objMatch[0];
        console.log('✅ Extracted JSON object from text');
      } else {
        console.error('❌ Could not find JSON in response');
        console.error('Response preview:', text.substring(0, 300));
        throw new Error('Could not find JSON in Gemini response');
      }
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.quizQuestions || !Array.isArray(parsed.quizQuestions)) {
        throw new Error('Parsed JSON does not contain quizQuestions array');
      }
      console.log('✅ Successfully parsed JSON. Questions count:', parsed.quizQuestions.length);
      return parsed;
    } catch (parseErr) {
      console.error('❌ JSON.parse failed:', parseErr.message);
      console.error('Attempted JSON (first 300 chars):', jsonText.substring(0, 300));
      try {
        const parsed = JSON5.parse(jsonText);
        if (!parsed.quizQuestions || !Array.isArray(parsed.quizQuestions)) {
          throw new Error('Parsed JSON5 does not contain quizQuestions array');
        }
        console.log('✅ Successfully parsed with JSON5. Questions count:', parsed.quizQuestions.length);
        return parsed;
      } catch (json5Err) {
        console.error('❌ JSON5.parse also failed:', json5Err.message);
        let fixed = jsonText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*\*/g, '');
        try {
          const parsed = JSON5.parse(fixed);
          if (!parsed.quizQuestions || !Array.isArray(parsed.quizQuestions)) {
            throw new Error('Parsed JSON5 (after cleanup) does not contain quizQuestions array');
          }
          console.log('✅ Successfully parsed after markdown removal. Questions count:', parsed.quizQuestions.length);
          return parsed;
        } catch (finalErr) {
          console.error('❌ All parsing attempts failed');
          console.error('Final error:', finalErr.message);
          console.error('Response (first 500 chars):', jsonText.substring(0, 500));
          throw new Error(`Failed to parse AI response: ${finalErr.message}`);
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error generating additional quiz questions:', errorMsg);
    throw new Error(errorMsg || 'Failed to generate quiz questions. Please try again.');
  }
};
