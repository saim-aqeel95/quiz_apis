const express = require("express");
const router = express.Router();
const quizController =  require("../controllers/QuizController");

router.get("/", quizController.getAllQuizes);
router.get("/:id", quizController.getQuizById);
router.post("/", quizController.addQuiz);

const quizRoute = router;
module.exports = quizRoute;