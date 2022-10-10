// TODO(you): Write the JavaScript necessary to complete the assignment.

const header = document.getElementById("header");
const screen1 = document.getElementById("introduction");
const screen2 = document.getElementById("attempt-quiz");
const screen3 = document.getElementById("review-quiz");
const resultBox = document.getElementById("box-result");
const modal = document.getElementById("modal");
const modalOkOption = document.querySelector(".ok-option");
const modalCancelOption = document.querySelector(".cancel-option");
const questionsContainer = document.querySelector(".questions");
const reviewQContainer = document.querySelector(".review-questions");
let inputs;
let handleCLick;
let quizId;
let dataQuestions;
let chosenAnswer = {};
let tryAgainBtn;
const startBtn = document.getElementById("btn-start");
const submitBtn = document.getElementById("btn-submit");

const scrollToTop = () => {
  header.scrollIntoView({
    block: "start",
    inline: "nearest",
    behavior: "smooth",
  });
};

const getQuiz = async () => {
  const response = await fetch("http://localhost:5000/api/attempts?limit=10", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

const submitQuiz = async () => {
  const response = await fetch(
    `http://localhost:5000/api/attempts/${quizId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: chosenAnswer,
      }),
    }
  );
  return response.json();
};

startBtn.addEventListener("click", () => {
  screen2.classList.remove("hidden");
  screen1.classList.add("hidden");
  getQuiz().then((data) => {
    console.log(data)
    dataQuestions = data.questions;
    quizId = data._id;
    let displayQuestion = dataQuestions.map((question, index) => {
      const answers = question.answers;
      return `<div class="attempt-question-container">
        <h2 class="question-index">Question ${index + 1} of 10</h2>
        <p class="question-text"> ${question.text.replace(
          "<",
          "&lt;"
        )}</p>
        <form id="question-form-${index + 1}">
          <div class="answer-container">
            ${answers.map((answer, i) => {
              return `<label class="option" id="label${i+1}">
              <input type="radio" name="option" id="${i+1}" class="input-option" onclick='handleCLick(this)'/>
              <label class="answer-text">${
                answer && answer.replace("<", "&lt;") 
              }</label>
            </label>`
            }).join('')}
          </div>
        </form>
      </div>`;
    });
    displayQuestion = displayQuestion.join("");
    questionsContainer.innerHTML = displayQuestion;
    inputs = document.querySelectorAll(".input-option");

    handleCLick = (element) => {
      inputs.forEach((input) => {
        if (!input.checked) {
          input.parentElement.classList.remove('checked')
        }
        element.parentElement.classList.add('checked')
      })
    }

  
  });
  scrollToTop();
});

submitBtn.addEventListener("click", () => {
  modal.classList.add("show-modal");
});

modalOkOption.addEventListener("click", () => {
  modal.classList.remove("show-modal");
  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");

  dataQuestions.forEach((question, index) => {
    const formContainer = document.querySelector(`#question-form-${index + 1}`)
    const options = formContainer.querySelectorAll('.input-option')
    options.forEach((option) => {
      if (option.checked) {
        chosenAnswer[question._id] = (option.id - 1).toString()
      }
    })
    // chosenAnswer[question._id] = userChoices()[index] - 1;
  });
  console.log(chosenAnswer)
  submitQuiz().then((data) => {
    const userAnswers = data.answers;
    const correctAnswers = data.correctAnswers;

    let displayReviewQuestion = data.questions.map((question, index) => {
      const questionId = question._id;
      let correctAnswer = ['', '', '', ''];
      const answers = question.answers
     
      if (userAnswers[questionId] !== null) {
        correctAnswer[userAnswers[questionId]] = 'userChoice';
      }
      if (correctAnswer.includes('userChoice')) {
        correctAnswer[correctAnswers[questionId]] = "correctAnswer";
      } else {
        correctAnswer[correctAnswers[questionId]] = "wrongAnswer";
      }
      if (correctAnswer.includes('userChoice') && correctAnswer.includes('correctAnswer')) {
        let index = correctAnswer.indexOf("correctAnswer");
        correctAnswer[index] = "wrongAnswer";
      }

      return `
      <div class="question-container">
        <h2 class="question-index">Question ${index + 1} of 10</h2>
        <p class="question-text">${index + 1}. ${question.text.replace(
        "<",
        "&lt;"
      )}</p>
        <form id="question-form-${index + 1}">
          <div class="answer-container">
          ${answers.map((answer, i) => {
            return `
            <label class="option 
            ${correctAnswer[i] == 'correctAnswer' ? 'correct-answer' : ''} 
            ${correctAnswer[i] == 'userChoice' && 'wrong-answer'}
            ${correctAnswer[i] == 'wrongAnswer' && 'option-correct'}" 
            id="label1">
            <input type="radio" name="option" id=${i + 1} disabled/>
            <label class="answer-text" for="${i + 1}">${
              answer ? answer.replace("<", "&lt;") : ""
            }</label>
            ${(correctAnswer[i] == 'correctAnswer' || correctAnswer[i] == 'wrongAnswer') ? '<div class="answer-label">Correct answer</div>' : ''}
            ${correctAnswer[i] == 'userChoice' ? '<div class="answer-label">Your answer</div>' : ''}
          </label>
            `
          }).join('')}
          </div>
        </div>
        `;
      
    });
    displayReviewQuestion = displayReviewQuestion.join("");
    reviewQContainer.innerHTML = displayReviewQuestion;

    resultBox.innerHTML = `
      <h2 id="result-text">Result:</h2>
      <p id="result-score">${data.score}/10</p>
      <p id="result-percent">${data.score * 10}%</p>
      <p id="result-feedback">${data.scoreText}</p>
      <button id="btn-try-again">Try again</button> 
    `;
    console.log(userAnswers)
    tryAgainBtn = document.getElementById("btn-try-again");
    tryAgainBtn.addEventListener('click', () => {
      location.reload()
    })
  });
});

modalCancelOption.addEventListener("click", () => {
  modal.classList.remove("show-modal");
});
