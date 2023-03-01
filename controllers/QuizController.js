const Database = require("../middleware/database");
const db = new Database();
const _ = require("lodash");

const getQuizById = (req, res) => {
  const { id } = req.params;
  let sql = `SELECT id, title as quizTitle, description from tbl_quizes where id = ${id} limit 1`;
  db.query(sql)
    .then((quiz) => {
      if (quiz.length > 0) {
        let quizObj = quiz[0];
        sql = `SELECT tbl_questions.id as questionId, tbl_questions.question, tbl_questions.is_mandatory as isMandatory, tbl_answers.id as answerId, tbl_answers.answer, tbl_answers.is_correct as isCorrect from tbl_questions join tbl_answers on tbl_answers.question_id = tbl_questions.id where quiz_id = ${quizObj.id}`;
        db.query(sql)
          .then((questions) => {
            if (questions.length > 0) {
              let questionsArr = [];
              questions.map((question) => {
                let answerObjToPush = {
                  answerId: question.answerId,
                  answer: question.answer,
                  isCorrect: question.isCorrect === 0 ? false : true,
                };
                let questionObjToPush = {
                  questionId: question.questionId,
                  question: question.question,
                  isMandatory: question.isMandatory === 0 ? false : true,
                  answers: [answerObjToPush],
                };
                if (
                  questionsArr.some(
                    (item) => item.questionId == question.questionId
                  )
                ) {
                  let index = questionsArr.findIndex(
                    (q) => question.questionId == q.questionId
                  );
                  questionsArr[index].answers.push(answerObjToPush);
                } else {
                  questionsArr.push(questionObjToPush);
                }
              });
              quizObj.questions = questionsArr;
              res
                .status(200)
                .json({ success: true, error: null, data: quizObj });
            } else {
              quizObj.questions = null;
              res
                .status(500)
                .json({ success: false, error: [1032], data: quizObj });
            }
          })
          .catch((error) => {
            res
              .status(500)
              .json({ success: false, error: [1032], data: quizObj });
          });
      } else {
        res.status(500).json({ success: false, error: [1032], data: null });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: [1030], data: null });
    });
};
const getAllQuizes = (req,res) => {
    db.query("SELECT id, title, description from tbl_quizes").then(response => {
      if(response.length>0){
        res.status(200).json({
            success: true,
            error: null,
            data: response
          });
        }else{
          res.status(500).json({ success: false, error: [1030], data: null });
        }
    }).catch(error => {
      res.status(500).json({ success: false, error: [1030], data: null });
    });
}
const addQuiz = (req, res) => {
  let { quizTitle, description, questions } = req.body;
  let sql = `INSERT INTO  tbl_quizes (title, description) VALUES ('${quizTitle}','${description}')`;
  db.query(sql)
    .then((result) => {
      if (result.affectedRows) {
        let questionsPromises = questions.map((element, index) => {
          sql = `INSERT INTO  tbl_questions (question, is_mandatory, quiz_id) VALUES ('${element.question}',${element.isMandatory},'${result.insertId}')`;
          return db.query(sql);
        });
        Promise.all(questionsPromises)
          .then((resultq) => {
            let answerPromises = resultq.map((inserted, index) => {
              let answers = questions[index].answers;
              let insertAnswers = "";
              answers.forEach((element, index) => {
                index + 1 < answers.length
                  ? (insertAnswers += `('${element.answer}','${inserted.insertId}',${element.isCorrect}),`)
                  : (insertAnswers += `('${element.answer}','${inserted.insertId}',${element.isCorrect})`);
              });
              sql = `INSERT INTO  tbl_answers (answer, question_id, is_correct) VALUES ${insertAnswers}`;
              return db.query(sql);
            });
            Promise.all(answerPromises)
              .then((resulta) => {
                res.status(200).json({
                  success: true,
                  error: null,
                  data: {
                    quizId: result.insertId,
                  },
                });
              })
              .catch((error) => {
                res
                  .status(500)
                  .json({ success: false, error: [1092], data: null });
              });
          })
          .catch((error) => {
            res.status(500).json({ success: false, error: [1092], data: null });
          });
      } else {
        res.status(500).json({ success: false, error: [1092], data: null });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: [1092], data: null });
    });
};

module.exports = { getQuizById, addQuiz, getAllQuizes };
