/*
Create me a code based on the problem and pseudocode bellow:
1. Problem
There is an array that consist mulitple type of element (ex : number, object, etc). Create a function to return array that consist only the element with primitive types only.
2. Pseudocode
- Create an empty array to store the result
- Do loop for the function to check each element is primitive types or not
- Push the element to the result if meet the condition
- return the result
 */

// Function: return array containing only primitive type elements from an input array
// Primitive types in JS: string, number, boolean, null, undefined, symbol, bigint
const filterPrimitives = function (arr) {
  // Create an empty array to store the result
  const result = [];
  // Loop through each element and check if it's a primitive
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    const t = typeof val;
    const isPrimitive =
      val === null ||
      t === "string" ||
      t === "number" ||
      t === "boolean" ||
      t === "undefined" ||
      t === "symbol" ||
      t === "bigint";
    // Push the element to result if it is primitive
    if (isPrimitive) result.push(val);
  }
  // Return the result
  return result;
};

// Example usage
console.log(
  filterPrimitives([
    1,
    "a",
    true,
    { x: 1 },
    [2, 3],
    null,
    undefined,
    Symbol("s"),
    10n,
    function () {},
  ]),
); // Expected: [1, "a", true, null, undefined, Symbol("s"), 10n]

/*
Create me a code based on the problem and pseudocode bellow:
1. Problem
Write a function from the below array of number that will return sum of duplicate values.
a. let arr = [10, 20, 40, 10, 50, 30, 10, 60, 10];
b. The function will return 40
2. Pseudocode
- Declare an object to store the duplicate number and how many the number has appear
- Use for loop to check the if the element is duplicate or not
- If the element is duplicate, store to the object and increment the number it has appear
- Calculate the sum of duplicate number
 */

// Function: return the sum of all elements that are duplicates in the array
// A value is considered duplicate if it appears more than once; all its occurrences are summed.
const sumOfDuplicates = function (arr) {
  // Declare an object to store counts of each number
  const counts = {};
  for (let i = 0; i < arr.length; i++) {
    const n = arr[i];
    // Only handle numeric values
    if (typeof n !== "number" || Number.isNaN(n)) continue;
    counts[n] = (counts[n] || 0) + 1;
  }
  // Calculate the sum of numbers that appeared more than once (all occurrences)
  let sum = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > 1) sum += Number(key) * count;
  }
  return sum;
};

// Example usage
let arr = [10, 20, 40, 10, 50, 30, 10, 60, 10];
console.log(sumOfDuplicates(arr)); // Expected: 40

/*
Create me a code based on the problem and pseudocode bellow:
1. Problem
Write a game of rock, paper, scissor function that will return 'Win' or 'Lose'. The function will randomly pick between rock, paper, or scissor.
a. Example: if you throw a rock as an argument and the function pick a scissor then it will return 'Win'

2. Pseudocode
- Create an array to store the element of rock, paper, scissor
- For the computer output, use Math.floor and Math.random based on the length of the array.
- Compare the argument and the computer output to know who win the battle

Next chat :
update the code to add draw condition if the computer output same with the player throw
*/

// Function: rock, paper, scissor game returning 'Win' or 'Lose'
const rockPaperScissor = function (playerThrow) {
  // Normalize and validate input
  if (typeof playerThrow !== "string") throw new Error("Invalid input");
  let player = playerThrow.trim().toLowerCase();
  if (player === "scissors") player = "scissor"; // accept common variant

  const choices = ["rock", "paper", "scissor"];
  if (!choices.includes(player))
    throw new Error("Invalid throw. Use 'rock', 'paper', or 'scissor'.");

  // Computer random pick; allow draw when same as player
  const computer = choices[Math.floor(Math.random() * choices.length)];

  const beats = {
    rock: "scissor",
    paper: "rock",
    scissor: "paper",
  };

  if (computer === player) return "Draw";
  return beats[player] === computer ? "Win" : "Lose";
};

// Example usage
console.log("RPS Result:", rockPaperScissor("rock"));
