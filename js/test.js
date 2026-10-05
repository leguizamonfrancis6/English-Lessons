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
let examDeadline;
let timerInterval;
let examFinished = false;

function renderQuestions() {
  questionsContainer.innerHTML = questions.map((question, questionIndex) => {
    const optionsMarkup = question.options.map((option, optionIndex) => `
      <label class="answer-option">
        <input type="radio" name="question-${questionIndex}" value="${optionIndex}">
        <span class="answer-marker" aria-hidden="true"></span>
        <span lang="en">${option}</span>
      </label>
    `).join("");

    return `
      <fieldset class="question-block">
        <legend><span class="question-number">${String(questionIndex + 1).padStart(2, "0")}</span><span lang="en">${question.prompt}</span></legend>
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

// El tiempo se calcula contra la hora de fin: si el celular frena el intervalo (pestaña en segundo plano), al volver el reloj se pone al día.
function updateTimer() {
  if (examDeadline) secondsRemaining = Math.max(0, Math.ceil((examDeadline - Date.now()) / 1000));
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
  const whatsappText = `Hola Darlene! Hice el test de nivel de inglés y saqué ${percentage}% (${correctAnswers} de ${questions.length} correctas).`;
  document.querySelector("#result-whatsapp").href = `https://wa.me/5493425202975?text=${encodeURIComponent(whatsappText)}`;
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
  examDeadline = Date.now() + EXAM_DURATION_SECONDS * 1000;
  updateTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
  timerInterval = window.setInterval(() => {
    updateTimer();
    if (secondsRemaining <= 0) finishExam();
  }, 1000);
}

document.querySelector("#start-test").addEventListener("click", startExam);

// Con el test en curso, avisa antes de cerrar o salir de la página (se perderían las respuestas).
window.addEventListener("beforeunload", (event) => {
  if (!examDeadline || examFinished) return;
  event.preventDefault();
  event.returnValue = "";
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden || !examDeadline || examFinished) return;
  updateTimer();
  if (secondsRemaining <= 0) finishExam();
});

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
