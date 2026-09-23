# AI Study Assistant

A web app that turns study notes into multiple-choice quizzes using the Claude API. Paste in a section of your notes, and it generates questions based only on that material, with explanations for each answer.

I built it to extend the interactive study apps I use for revision in my Software Development degree, and to learn how to build a reliable application on top of a large language model.

![Screenshot](screenshot.png)

## Features

- Generates multiple-choice questions from any notes you paste in
- Questions are grounded in your notes rather than general knowledge
- Playable quiz: pick an answer, see whether you were right, and read the explanation
- Running score and a final result
- Answer options are shuffled so the correct answer isn't predictable
- Clear loading and error states
- Dark, mobile-first design

## How it works

```
Browser  →  Express server  →  Claude API
   ↑              │
   └── validated quiz (JSON) ──┘
```

1. The page sends the notes to the server's `/api/quiz` endpoint.
2. The server checks the input, then calls the Claude API (Claude Haiku 4.5) with a `create_quiz` tool.
3. The model returns the quiz as structured data matching the tool's schema.
4. The server validates the quiz and sends it back to the page, which renders it.

### Project structure

| File | Purpose |
|------|---------|
| `server.js` | Express server: serves the page, validates input, handles errors |
| `quiz.js` | Calls the Claude API and validates the quiz it returns |
| `public/index.html` | The front end: HTML, CSS and JavaScript |

## Design decisions

**The API key stays on the server.** The browser never talks to the Claude API directly. If the key were in the front-end JavaScript, anyone who opened the page could copy it. The key is loaded from a `.env` file that is excluded from Git.

**Tool use instead of asking for JSON.** My first version asked the model to reply with JSON in the prompt. Even with an instruction not to, it sometimes wrapped the JSON in markdown code fences, which broke `JSON.parse`. I switched to tool use: the quiz format is defined as a JSON Schema, and `tool_choice` forces the model to return data in that shape. There's no text to parse, and the formatting rules moved out of the prompt and into the schema.

**Model output is treated as untrusted input.** The schema makes the right shape very likely, but not guaranteed, so the server still checks it before use: the response wasn't cut off (`stop_reason`), a tool call was returned, `questions` is an array, each question has exactly four options, and `answerIndex` is a whole number from 0 to 3.

**User input is validated before spending money.** The server rejects notes that are too short or too long before calling the API. The length limit also caps the cost of a single request.

**Errors are logged in full but shown to users simply.** The complete error goes to the server log, while the user sees a short, friendly message. Exposing internal error details to users is a security risk.

**`textContent`, not `innerHTML`.** Questions are generated from user-supplied notes, so the page inserts all model output as plain text. Using `innerHTML` could let HTML or script in the notes run in the browser (cross-site scripting).

**Shuffling to fix position bias.** While testing, I noticed the correct answer was usually B. Each option is tagged with whether it's correct before a Fisher–Yates shuffle, so the correct answer can be found in its new position. I used Fisher–Yates rather than the common `sort(() => Math.random() - 0.5)` shortcut, which doesn't give every order an equal chance.

**Limits of grounding.** The system prompt tells the model to use only the provided notes. In testing, it sometimes still added correct details from general knowledge in its explanations. Instructions reduce this but don't eliminate it, which is one reason for the RAG work planned below.

## Running it locally

You'll need [Node.js](https://nodejs.org) 20.6 or later and a [Claude API key](https://docs.claude.com).

```bash
git clone https://github.com/jackdiver/ai-study-assistant.git
cd ai-study-assistant
npm install
```

Copy `.env.example` to a new file called `.env` and add your API key:

```
ANTHROPIC_API_KEY=your-api-key-here
```

Start the server:

```bash
node --env-file=.env server.js
```

Then open http://localhost:3000.

## Built with

- Node.js and Express
- Anthropic's Claude API (`@anthropic-ai/sdk`), using tool use for structured output
- HTML, CSS and vanilla JavaScript

## What I'd add next

- **RAG (Retrieval-Augmented Generation):** split notes into chunks, find the sections most relevant to a question, and answer using only those, showing which section each answer came from
- Choosing the number of questions and the difficulty
- Saving quizzes to revisit later