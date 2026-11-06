const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

let current = "0";
let stored = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

const symbols = { "+": "+", "−": "−", "×": "×", "÷": "÷" };

function render() {
  display.textContent = current;
  expression.textContent = stored !== null && operator
    ? `${formatNumber(stored)} ${symbols[operator]}`
    : "";
  keypad.querySelectorAll("[data-operator]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.operator === operator && !waitingForOperand);
  });
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(Number.parseFloat(value.toPrecision(12)));
}

function inputNumber(number) {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = number;
    waitingForOperand = false;
    justCalculated = false;
  } else {
    current = current === "0" ? number : current + number;
  }
  render();
}

function inputDecimal() {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = "0.";
    waitingForOperand = false;
    justCalculated = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  render();
}

function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;
  const inputValue = Number(current);

  if (operator && !waitingForOperand) {
    const result = calculate(stored, inputValue, operator);
    if (!Number.isFinite(result)) {
      showError();
      return;
    }
    current = formatNumber(result);
    stored = result;
  } else {
    stored = inputValue;
  }

  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;
  render();
}

function equals() {
  if (!operator || stored === null || current === "Error") return;
  const secondValue = waitingForOperand ? stored : Number(current);
  const result = calculate(stored, secondValue, operator);
  if (!Number.isFinite(result)) {
    showError();
    return;
  }

  expression.textContent = `${formatNumber(stored)} ${symbols[operator]} ${formatNumber(secondValue)} =`;
  current = formatNumber(result);
  stored = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = true;
  renderResultOnly();
}

function renderResultOnly() {
  display.textContent = current;
  keypad.querySelectorAll("[data-operator]").forEach((button) => button.classList.remove("selected"));
}

function showError() {
  current = "Error";
  stored = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = true;
  expression.textContent = "Cannot divide by zero";
  renderResultOnly();
}

function clear() {
  current = "0";
  stored = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  render();
}

function removeLast() {
  if (current === "Error" || waitingForOperand || justCalculated) {
    clear();
    return;
  }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

function toggleSign() {
  if (current === "Error" || Number(current) === 0) return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  render();
}

function percent() {
  if (current === "Error") return;
  current = formatNumber(Number(current) / 100);
  render();
}

function handleAction(action) {
  switch (action) {
    case "clear": clear(); break;
    case "delete": removeLast(); break;
    case "decimal": inputDecimal(); break;
    case "sign": toggleSign(); break;
    case "percent": percent(); break;
    case "equals": equals(); break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
  else if (event.key === ".") inputDecimal();
  else if (event.key === "+") chooseOperator("+");
  else if (event.key === "-") chooseOperator("−");
  else if (event.key === "*") chooseOperator("×");
  else if (event.key === "/") { event.preventDefault(); chooseOperator("÷"); }
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); equals(); }
  else if (event.key === "Backspace") removeLast();
  else if (event.key === "Escape") clear();
  else if (event.key === "%") percent();
});

render();