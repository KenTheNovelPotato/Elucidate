import { Lesson } from './types';

export const CURRICULUM: Lesson[] = [
  {
    id: 'intro-01',
    title: '1. The Persona Pattern',
    description: 'Learn how to shape AI behavior using personas.',
    theory: `
### The Persona Pattern

One of the most effective ways to control a Large Language Model (LLM) is to assign it a **Role** or **Persona**.

By default, an LLM tries to be a helpful generic assistant. However, by explicitly telling it *"You are a senior software engineer"* or *"You are a skeptical history professor"*, you prime the model to adopt specific vocabularies, tones, and reasoning styles.

**Why it works:**
Models are trained on vast datasets. Assigning a persona narrows the statistical probability of the next token to fit that specific archetype, reducing generic fluff and increasing domain-specific accuracy.
    `,
    challenge: {
      instruction: "Craft a prompt that makes the AI act like a 17th-century pirate explaining how to make a peanut butter and jelly sandwich. It MUST use pirate slang.",
      criteria: {
        description: "The response must clearly adopt a pirate persona and explain the PB&J process.",
        validationPrompt: "Check if the provided text acts like a pirate (uses slang like 'ahoy', 'matey', etc.) AND explains a PB&J sandwich. If both are true, pass. Otherwise fail."
      }
    }
  },
  {
    id: 'shot-02',
    title: '2. Few-Shot Prompting',
    description: 'Provide examples to guide structure and style.',
    theory: `
### Few-Shot Prompting

**Zero-Shot:** Asking the AI to do something without examples.
**Few-Shot:** Providing 1-3 examples of input and desired output before your actual request.

Few-shot prompting is the gold standard for getting consistent formatting (like JSON, CSV) or specific linguistic styles without writing complex instructions. It teaches by pattern matching.

**Example Pattern:**
Input: Happy
Output: Ecstatic
Input: Sad
Output: Devastated
Input: [User Input]
Output: ...
    `,
    challenge: {
      instruction: "Teach the AI to convert movie titles into emojis using 'Few-Shot' examples. Provide at least 2 examples in your prompt, then ask it to convert 'Star Wars'.",
      criteria: {
        description: "The prompt must contain examples (Input->Output format) and result in an emoji representation of Star Wars.",
        validationPrompt: "Check if the USER prompt contains at least two examples of text-to-emoji mapping. Check if the MODEL output is emoji-only representing Star Wars (like ⭐️⚔️). Pass only if examples were used."
      },
      initialPrompt: "Input: The Lion King\nOutput: 🦁👑\n\nInput: "
    }
  },
  {
    id: 'cot-03',
    title: '3. Chain of Thought',
    description: 'Improve reasoning by asking the AI to "think" first.',
    theory: `
### Chain of Thought (CoT)

For complex logic, math, or reasoning tasks, LLMs often fail if forced to give an immediate answer. 

**Chain of Thought** encourages the model to break down the problem step-by-step.
this is often triggered by the magic phrase: *"Let's think step by step"* or by explicitly asking for a reasoning block before the final answer.

**Gemini 2.5 Flash** and **Pro** are excellent at this. By externalizing the thought process, the model can 'catch' its own logic errors.
    `,
    challenge: {
      instruction: "Ask the AI to solve this riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?'\n\nRequirement: You must force the AI to explain its reasoning step-by-step before giving the answer.",
      criteria: {
        description: "The output must show a reasoning process followed by the answer 'Echo'.",
        validationPrompt: "Check if the model output contains a breakdown of the clues (reasoning) BEFORE the final answer 'Echo'. If it just says 'Echo', fail."
      }
    }
  },
  {
    id: 'safety-04',
    title: '4. Hallucination Guardrails',
    description: 'Techniques to prevent the AI from making things up.',
    theory: `
### Preventing Hallucinations

AI models can confidently state falsehoods. To mitigate this:

1.  **"Answer only using the provided text":** Give it a source document.
2.  **"If you don't know, say you don't know":** Explicitly permit negative answers.
3.  **Quote citations:** Ask it to cite the sentence where it found the info.

In this challenge, you will force the AI to admit ignorance rather than making up a fact.
    `,
    challenge: {
      instruction: "Ask the AI for the 'specific date of the first human landing on Mars'. Instruct it strictly that if the event has not happened, it must say 'DATA_NOT_FOUND'.",
      criteria: {
        description: "The model must output exactly 'DATA_NOT_FOUND'.",
        validationPrompt: "Check if the model output is exactly 'DATA_NOT_FOUND' (case insensitive is okay, but it shouldn't make up a date)."
      }
    }
  }
];
