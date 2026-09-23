import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const notes = `
A stack is Last In, First Out (LIFO). Items are added with push and removed with pop.
A queue is First In, First Out (FIFO). Breadth-first search uses a queue; depth-first search uses a stack.
Binary search on a sorted array runs in O(log n) time.
`;

const quizTool = {
  name: "create_quiz",
  description: "Return multiple-choice quiz questions based on the notes.",
  input_schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
            answerIndex: { type: "integer", minimum: 0, maximum: 3 },
            explanation: { type: "string" },
          },
          required: ["question", "options", "answerIndex", "explanation"],
        },
      },
    },
    required: ["questions"],
  },
};

const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1000,
  system: "You create multiple-choice revision questions. Use ONLY the information in the notes provided.",
  tools: [quizTool],
  tool_choice: { type: "tool", name: "create_quiz" },
  messages: [{ role: "user", content: `Write 3 questions from these notes:\n${notes}` }],
});

if (response.stop_reason === "max_tokens") {
  throw new Error("Response was cut off. Increase max_tokens.");
}

const toolCall = response.content.find((block) => block.type === "tool_use");
const quiz = toolCall.input; // already a JavaScript object, no JSON.parse needed

quiz.questions.forEach((q, i) => {
  console.log(`\nQ${i + 1}: ${q.question}`);
  q.options.forEach((opt, j) => console.log(`  ${"ABCD"[j]}) ${opt}`));
  console.log(`  Answer: ${"ABCD"[q.answerIndex]}. ${q.explanation}`);
});