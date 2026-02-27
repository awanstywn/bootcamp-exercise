// Interactive greeting script
// Run with: node hello.js

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

function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = {
  Morning: [
    (name) => `Good morning, ${name}! Ready to seize the day?`,
    (name) => `Morning, ${name}! Let’s make today awesome.`,
    (name) => `Rise and shine, ${name}!`,
  ],
  Afternoon: [
    (name) => `Good afternoon, ${name}! Keep up the momentum.`,
    (name) => `Hey ${name}, hope your afternoon is going well!`,
    (name) => `Hi ${name}! A perfect afternoon to get things done.`,
  ],
  Evening: [
    (name) => `Good evening, ${name}! How was your day?`,
    (name) => `Evening, ${name}! Time to unwind and reflect.`,
    (name) => `Hi ${name}, wishing you a pleasant evening.`,
  ],
  Night: [
    (name) => `Good night, ${name}! Don’t forget to rest well.`,
    (name) => `Hey ${name}, late night coding session?`,
    (name) => `Night, ${name}! Dream big and recharge.`,
  ],
};

async function main() {
  try {
    let name = "";
    while (!name) {
      const answer = await ask("What is your name? ");
      name = answer.trim();
      if (!name) console.log("Name cannot be empty. Please try again.");
    }

    const timeOfDay = getTimeOfDay();
    const greetFn = randomItem(GREETINGS[timeOfDay]);
    const message = greetFn(name);

    console.log(`\n[${timeOfDay}] ${message}`);
  } catch (err) {
    console.error("An unexpected error occurred:", err);
  } finally {
    rl.close();
  }
}

main();
