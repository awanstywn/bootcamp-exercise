const checkOddEven = function (number) {
  if (number % 2 === 0) {
    return "Even";
  } else {
    return "Odd";
  }
};

console.log(checkOddEven(25));
console.log(checkOddEven(2));

const checkPrime = function (number) {
  if (number <= 1) {
    return false;
  }
  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      return false;
    }
  }
  return true;
};

console.log(checkPrime(7));
console.log(checkPrime(6));

const sum = function (number) {
  let total = 0;
  for (let i = 1; i <= number; i++) {
    total += i;
  }
  return total;
};

console.log(sum(5));
console.log(sum(3));

const factorial = function (number) {
  let result = 1;
  for (let i = 1; i <= number; i++) {
    result *= i;
  }
  return result;
};

console.log(factorial(4));
console.log(factorial(6));

const firstNFibonacci = function (number) {
  //I want to find the first n fibonacci numbers
  //I want to use a while loop to find that number
  // This function now returns the nth Fibonacci number (1-indexed)
  if (number <= 0) return 0;
  if (number === 1 || number === 2) return 1;

  let a = 1; // F1
  let b = 1; // F2
  let i = 3;
  while (i <= number) {
    const c = a + b; // next Fibonacci
    a = b; // shift window forward
    b = c; // b becomes Fn
    i++;
  }
  return b;
};

console.log(firstNFibonacci(15));
