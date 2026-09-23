import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
        { role: "user", content: "Write three multiple-choice question about Data Structures and Algorithms, with 4 options and the correct answer."}
    ],
});

console.log(response.content[0].text);