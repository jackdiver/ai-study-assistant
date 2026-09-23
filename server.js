import express from "express";
import { generateQuiz } from "./quiz.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/quiz", async (req, res) => {
    const { notes } = req.body;

    if (!notes || notes.trim().length < 20) {
        return res.status(400).json({ error: "Please paste in some notes first."});
    }

    if (notes.length > 20000) {
        return res.status(400).json({ error: "Notes are too long. Try a shorter section."});
    }

    try {
        const quiz = await generateQuiz(notes);
        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not generate a quiz. Please try again."});
    }
});

app.listen(3000, () => console.log("Running at http://localhost:3000"));