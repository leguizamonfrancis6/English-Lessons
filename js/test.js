const EXAM_DURATION_SECONDS = 20 * 60;

const welcomeScreen = document.querySelector("#test-welcome");
const quizScreen = document.querySelector("#quiz-screen");
const resultScreen = document.querySelector("#result-screen");
const questionsContainer = document.querySelector("#questions-container");
const quizForm = document.querySelector("#quiz-form");
const timerElement = document.querySelector("#timer");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const answeredCount = document.querySelector("#answered-count");
const answers = Array(questions.length).fill(null);
let secondsRemaining = EXAM_DURATION_SECONDS;
let timerInterval;
let examFinished = false;

function renderQuestions() {
  questionsContainer.innerHTML = questions.map((question, questionIndex) => {
    const optionsMarkup = question.options.map((option, optionIndex) => `
      <label class="answer-option">
        <input type="radio" name="question-${questionIndex}" value="${optionIndex}">
        <span class="answer-marker" aria-hidden="true"></span>
        <span>${option}</span>
      </label>
    `).join("");

    return `
      <fieldset class="question-block">
        <legend><span class="question-number">${String(questionIndex + 1).padStart(2, "0")}</span>${question.prompt}</legend>
        <div class="answer-options">${optionsMarkup}</div>
      </fieldset>
    `;
  }).join("");
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateProgress() {
  const completed = answers.filter((answer) => answer !== null).length;
  answeredCount.textContent = completed;
  progressTrack.setAttribute("aria-valuenow", completed);
  progressFill.style.width = `${(completed / questions.length) * 100}%`;
}

function updateTimer() {
  timerElement.textContent = formatTime(secondsRemaining);
  timerElement.classList.toggle("timer-warning", secondsRemaining <= 120);
}

function finishExam() {
  if (examFinished) return;
  examFinished = true;
  window.clearInterval(timerInterval);

  const correctAnswers = answers.reduce((total, answer, index) => total + (answer === questions[index].answer ? 1 : 0), 0);
  const percentage = Math.round((correctAnswers / questions.length) * 100);
  const message = percentage < 40
    ? "¡Bien! Hay mucho por mejorar, pero estamos a tiempo. Contactame y comencemos ya a planificar tu aprendizaje."
    : percentage < 75
      ? "¡Muy bien! Vas por buen camino. Contactame para que podamos perfeccionar tu nivel de inglés."
      : "¡Excelente! Tu nivel de inglés es muy bueno. Contactame para que sea aún mejor.";

  document.querySelector("#score-percentage").textContent = percentage;
  document.querySelector("#result-message").textContent = message;
  document.querySelector("#result-detail").textContent = `Respuestas correctas: ${correctAnswers} de ${questions.length}.`;
  quizScreen.hidden = true;
  resultScreen.hidden = false;
  document.querySelector("#result-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startExam() {
  welcomeScreen.hidden = true;
  quizScreen.hidden = false;
  renderQuestions();
  updateProgress();
  updateTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
  timerInterval = window.setInterval(() => {
    secondsRemaining -= 1;
    updateTimer();
    if (secondsRemaining <= 0) finishExam();
  }, 1000);
}

document.querySelector("#start-test").addEventListener("click", startExam);

quizForm.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "radio") return;
  const questionIndex = Number(input.name.replace("question-", ""));
  answers[questionIndex] = Number(input.value);
  updateProgress();
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const unanswered = answers.filter((answer) => answer === null).length;
  if (unanswered > 0 && !window.confirm(`Te quedan ${unanswered} preguntas sin responder. Se contarán como incorrectas. ¿Querés finalizar igual?`)) return;
  finishExam();
});

document.querySelector("#total-count").textContent = questions.length;
progressTrack.setAttribute("aria-valuemax", questions.length);
