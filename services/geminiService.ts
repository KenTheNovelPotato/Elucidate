import { GoogleGenAI, Type } from "@google/genai";
import { Message, Role, EvaluationResult, ChallengeCriteria, Lesson, LessonResult } from '../types';

// NOTE: In a production app, these should be proxy calls to a backend to hide the key.
// For this demo, we assume process.env.API_KEY is available in the build environment.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Using Gemini 3 Pro with thinking enabled as requested.
const GENERATION_MODEL = 'gemini-3-pro-preview';
const EVALUATION_MODEL = 'gemini-2.5-flash';

/**
 * Sends a message to Gemini and yields chunks of text as they stream in.
 */
export async function* streamChatResponse(
  history: Message[],
  newMessage: string,
  systemInstruction?: string
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  // Format history for the SDK
  const contents = history
    .filter(m => !m.isError)
    .map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

  const chat = ai.chats.create({
    model: GENERATION_MODEL,
    history: contents,
    config: {
      systemInstruction: systemInstruction || "You are a helpful AI assistant.",
      thinkingConfig: {
        thinkingBudget: 8192
      }
    }
  });

  const result = await chat.sendMessageStream({ message: newMessage });

  for await (const chunk of result) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

/**
 * Evaluates a user's prompt interaction against specific lesson criteria.
 * This uses a "Judge" pattern where the AI evaluates the AI.
 */
export async function evaluateChallenge(
  userPrompt: string,
  modelResponse: string,
  criteria: ChallengeCriteria
): Promise<EvaluationResult> {
  if (!API_KEY) return { passed: false, feedback: "API Key missing.", score: 0 };

  const promptForJudge = `
    You are an AI Tutor Evaluator.
    
    TASK:
    Analyze the following interaction between a User and an AI Model.
    Determine if the User's prompt and the Model's response satisfy the criteria provided.
    
    CRITERIA TO CHECK:
    ${criteria.validationPrompt}
    
    ---
    USER PROMPT:
    ${userPrompt}
    
    MODEL RESPONSE:
    ${modelResponse}
    ---
    
    Provide your assessment in JSON format.
  `;

  try {
    const result = await ai.models.generateContent({
      model: EVALUATION_MODEL,
      contents: promptForJudge,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN, description: "True if criteria met, false otherwise." },
            feedback: { type: Type.STRING, description: "Constructive feedback explaining why they passed or failed." },
            score: { type: Type.NUMBER, description: "A score from 0 to 100 based on quality." }
          },
          required: ["passed", "feedback", "score"]
        }
      }
    });

    const text = result.text;
    if (!text) throw new Error("No evaluation generated.");
    
    return JSON.parse(text) as EvaluationResult;

  } catch (error) {
    console.error("Evaluation failed", error);
    return {
      passed: false,
      feedback: "There was a technical error evaluating your response. Please try again.",
      score: 0
    };
  }
}

/**
 * Generates a helpful hint based on the current lesson and user history.
 */
export async function generateHint(
  lesson: Lesson,
  history: Message[]
): Promise<string> {
  if (!API_KEY) return "I can't generate a hint without an API key.";

  // Simplify history for the context window
  const recentHistory = history.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');

  const prompt = `
    You are a friendly, encouraging AI tutor assistant (like Clippy but less annoying).
    The user is working on a lesson titled: "${lesson.title}".
    The goal is: "${lesson.challenge.instruction}".
    
    Here is the recent conversation history:
    ${recentHistory || "(No history yet)"}

    The user has asked for a hint.
    Provide a short, specific pointer (max 40 words) that guides them toward the solution WITHOUT giving away the answer or writing the prompt for them.
    If the history is empty, give a tip on how to start based on the lesson theory.
    Be playful and helpful.
  `;

  try {
    const result = await ai.models.generateContent({
      model: EVALUATION_MODEL, // Use Flash for fast, cheap hints
      contents: prompt,
    });
    return result.text || "Try reviewing the lesson theory on the left!";
  } catch (error) {
    console.error("Hint generation failed", error);
    return "I'm having trouble thinking of a hint right now. Try reading the theory section again!";
  }
}

/**
 * Generates a final course analysis based on the user's performance across all lessons.
 */
export async function* generateFinalAnalysis(
  results: LessonResult[]
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) return;

  const resultsSummary = results.map(r => 
    `- Lesson: ${r.lessonTitle}\n  Score: ${r.score}/100\n  Attempts: ${r.attempts}`
  ).join('\n');

  const prompt = `
    You are a Senior AI Architecture Professor. The user has just completed a course on Prompt Engineering.
    
    Here is their performance report:
    ${resultsSummary}
    
    TASK:
    Write a personalized graduation speech and analysis for this student.
    
    Structure your response as follows:
    1. **Commendation:** Congratulate them on specific strengths based on their high scores.
    2. **Analysis:** Briefly analyze their learning curve. Did they struggle with structure (JSON/Delimiters) or creativity (Persona)?
    3. **Future Pointers:** Give 3 actionable, advanced tips for them to continue learning, based on where they might have had lower scores or higher attempts.
    
    Tone: Inspiring, professional, yet warm. Use formatting (bolding, lists) to make it readable.
  `;

  const chat = ai.chats.create({
    model: GENERATION_MODEL,
    config: {
      thinkingConfig: { thinkingBudget: 4096 } // A bit of thinking for a good analysis
    }
  });

  const stream = await chat.sendMessageStream({ message: prompt });
  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}