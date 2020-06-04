const buttons = document.querySelectorAll(".pick");
const scoreEl = document.getElementById("score");
const main = document.getElementById("main");
const selection = document.getElementById("selection");
const reset = document.getElementById("reset");
const user_select = document.getElementById("user_select");
const house_select = document.getElementById("house_select");
const winner = document.getElementById("winner");
//modal buttons
const openBtn = document.getElementById("open");
const closeBtn = document.getElementById("close");
const modal = document.getElementById("modal");

const choices = ["paper", "rock", "scissors"];
let userChoice = undefined;
let score = 0;
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    userChoice = button.getAttribute("data-choice");

    checkWinner();
  });
});
reset.addEventListener("click", () => {
  main.style.display = "flex";
  selection.style.display = "none";
});
openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
function checkWinner() {
  const computerChoice = pickRandomChoice();
  //update view selection
  updateSelection(user_select,userChoice);
  updateSelection(house_select,computerChoice);

  if (userChoice === computerChoice) {
    //draw
    winner.innerText = 'Draw';
  } else if (
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    //user won
    updateScore(1);
    winner.innerText = "Won"
  } else {
    //user lost
    updateScore(-1);
    winner.innerText = "Lost"
  }
  //show selection || hide main
  main.style.display = "none";
  selection.style.display = "flex";
}
function updateScore(value) {
  score += value;
  scoreEl.innerText = score;
}
function pickRandomChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}
function updateSelection(selectionEl  , choice) {
    //reset
    selectionEl.classList.remove('btn-paper');
    selectionEl.classList.remove('btn-rock');
    selectionEl.classList.remove('btn-scissors');
    // update img
    const img =  selectionEl.querySelector('img');
    selectionEl.classList.add(`btn-${choice}`);
    img.src = `./images/icon-${choice}.svg`;
    img.alt = choice;
}