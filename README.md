# Elucidate: The GenAI Architect Tutor

**Elucidate** is an interactive, gamified web platform designed to democratize the art of Prompt Engineering. Built for the **Kaggle x Google DeepMind Hackathon**, it transforms the complex nuances of Generative AI interaction into a structured, hands-on curriculum.

## 🎯 Mission
As Large Language Models (LLMs) become ubiquitous, the "skill gap" isn't access—it's **interaction**. Most users treat AI like a search engine, missing out on its reasoning capabilities.

**Elucidate's goal is to shift users from "Consumers" to "Architects" of AI.**

Through a series of progressive challenges, users learn not just *what* to ask, but *how* to frame context, enforce constraints, and structure outputs for real-world applications.

---

## 🚀 Key Features

### 1. 🎓 Interactive Curriculum
The app features an 8-lesson course covering essential Prompt Engineering patterns:
*   **The Persona Pattern:** Shaping model behavior.
*   **Few-Shot Prompting:** Teaching by example.
*   **Chain of Thought:** Unlocking complex reasoning.
*   **Hallucination Guardrails:** Enforcing factual accuracy.
*   **Structured Data (JSON):** Preparing AI for code integration.
*   **The Socratic Tutor:** Overriding default helpfulness for education.

### 2. 🤖 AI-Powered "Judge" System
Unlike static coding tutorials, Elucidate uses a **LLM-as-a-Judge** architecture. When a user submits a prompt, a secondary AI model evaluates the result against strict success criteria, providing real-time, context-aware feedback on *why* a prompt passed or failed.

### 3. 🧠 Thinking Models (Gemini 3 Pro)
The application leverages the reasoning capabilities of **Gemini 3 Pro** (with `thinkingConfig` enabled) to provide deep, analytical feedback at the end of the course, acting as a virtual professor reviewing the user's entire learning journey.

### 4. 💡 Context-Aware Helper
Stuck on a lesson? The **Helper Avatar** (a friendly bot) reads the current lesson context and the user's chat history to generate subtle hints without giving away the answer, using **Gemini 2.5 Flash** for low-latency responses.

---

## 🏗️ Technical Architecture

### Tech Stack
*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Custom "Deep Violet/Fuchsia/Amber" theme)
*   **Icons:** Lucide React
*   **AI SDK:** `@google/genai` (Google GenAI SDK for Web)

### AI Integration Breakdown

The app employs a dual-model strategy to balance performance and depth:

| Feature | Model Used | Purpose |
| :--- | :--- | :--- |
| **Main Tutor/Chat** | **Gemini 3 Pro** | The primary model the user interacts with. Configured with a `thinkingBudget` to handle complex instructions and reasoning tasks. |
| **Real-time Evaluator** | **Gemini 2.5 Flash** | Acts as the "Judge". It receives the User's Prompt + The Model's Response + Lesson Criteria and outputs a JSON verdict (Pass/Fail + Feedback). |
| **Helper Avatar** | **Gemini 2.5 Flash** | Analyzes chat history to provide hints. Optimized for speed and cost. |
| **Final Analysis** | **Gemini 3 Pro** | Generates the "Graduation Speech" and learning curve analysis at the end of the course. |

---

## 🧩 Component Deep Dive

### `App.tsx` & `geminiService.ts`
The core logic. `geminiService` abstracts the AI complexity, handling the streaming chat responses and the "Evaluation Loop" where one AI call triggers a second "Judge" call invisible to the user.

### `LessonView.tsx`
Displays the educational theory and the current "Mission Objective". It reacts dynamically to the Evaluation state, triggering particle animations and "success" states when the AI Judge approves the user's interaction.

### `ChatInterface.tsx`
A robust workspace that mimics a real IDE/Chat environment. It features auto-scaling inputs and seamless message history rendering, crucial for testing "Few-Shot" prompts that require significant text space.

### `HelperAvatar.tsx`
An always-present companion. It maintains a separate context window to observe the user's struggle without interfering with the main chat session, providing "Socratic" nudges when requested.

### `CompletionView.tsx`
The "Graduation" ceremony. It visualizes performance stats (Avg Score, Attempts) and streams a personalized analysis from Gemini 3 Pro, commending the user on specific strengths (e.g., "You excelled at JSON formatting") and offering advice for weak points.

---

## 🛠️ Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set your API Key (env variable):
    ```bash
    export API_KEY="your_gemini_api_key"
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

---

*Submitted for the Kaggle x Google DeepMind Gemini AI Studio Hackathon Dec7th-Dec15th 2025.*
