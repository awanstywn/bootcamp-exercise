// Interactive introduction script with input validation
// Run with: node intro.js

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) =>
    rl.question(question, (answer) => resolve(answer)),
  );
}

function validateName(name) {
  if (!name || !name.trim()) return "Name cannot be empty.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

function validateAge(ageStr) {
  if (!ageStr || !ageStr.trim()) return "Age cannot be empty.";
  const n = Number(ageStr);
  if (!Number.isFinite(n) || !/^[0-9]+(\.[0-9]+)?$/.test(ageStr.trim()))
    return "Age must be a valid number.";
  if (n <= 0) return "Age must be greater than 0.";
  if (!Number.isInteger(n)) return "Age must be a whole number.";
  if (n > 120) return "Please enter a realistic age (<= 120).";
  return null;
}

function validateLanguage(lang) {
  if (!lang || !lang.trim()) return "Favorite language cannot be empty.";
  if (lang.trim().length < 2)
    return "Favorite language must be at least 2 characters.";
  return null;
}

async function promptWithValidation(promptText, validator) {
  while (true) {
    const answer = await ask(promptText);
    const error = validator(answer);
    if (!error) return answer.trim();
    console.log(`✖ ${error}\n`);
  }
}

(async () => {
  try {
    const name = await promptWithValidation("Enter your name: ", validateName);
    const ageStr = await promptWithValidation("Enter your age: ", validateAge);
    const age = Number(ageStr);
    const language = await promptWithValidation(
      "Enter your favorite programming language: ",
      validateLanguage,
    );

    console.log(
      `\nHi, my name is ${name}, I am ${age} years old and I love ${language}.`,
    );
  } catch (err) {
    console.error("An unexpected error occurred:", err);
  } finally {
    rl.close();
  }
})();
