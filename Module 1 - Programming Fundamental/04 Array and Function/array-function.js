//Exercise Example 1
const trianglePattern = (height) => {
  for (let i = 1; i <= height; i++) {
    //iteration to add new line/height for triangle
    let row = "";
    for (let j = 1; j <= i; j++) {
      //iteration for each line of triangle
      row += j;
    }
    console.log(row);
  }
};
trianglePattern(5);

//Exercise Example 2
const maxValue = function (arr) {
  let max = arr[0]; //define the initial max value
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      //update the max value if the current element is greater than the current max value
      max = arr[i];
    }
  }
  return max;
};

console.log(maxValue([10, 55, 79, 32]));

//Exercise 1
const trianglePattern2 = (height) => {
  /* Example output of the triangle is like the example bellow
01
02 03
04 05 06
07 08 09 10
*/
  let num = 1;
  for (let i = 1; i <= height; i++) {
    let rowParts = []; //array to hold each row of the triangle
    for (let j = 1; j <= i; j++) {
      rowParts.push(String(num).padStart(2, "0")); //padStart to ensure each number is two digits long
      num++; //increment the number for the next iteration
    }
    console.log(rowParts.join(" "));
  }
};
trianglePattern2(4);

//Exercise 2
const loopNumber = function (n) {
  let output = [];
  for (let i = 1; i <= n; i++) {
    //check if the element divide by the define number
    if (i % 3 === 0) {
      output.push("Fizz");
    } else if (i % 5 === 0) {
      output.push("Buzz");
    } else if (i % 3 === 0 && i % 5 === 0) {
      output.push("FizzBuzz");
    } else {
      output.push(i);
    }
  }
  return output;
};
console.log(loopNumber(6));
console.log(loopNumber(15));

//Exercise 3
const caclBMI = function (weight, height) {
  let bmi = weight / (height * height);
  if (bmi < 18.5) {
    //check if the bmi meet the condition
    return "less weight";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return "ideal";
  } else if (bmi >= 25 && bmi <= 29.9) {
    return "overweight";
  } else if (bmi >= 30 && bmi <= 39.9) {
    return "very overweight";
  } else {
    return "obesity";
  }
};

console.log(caclBMI(55, 1.6));

//Exercise 4
const removeOdd = function (arr) {
  let output = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] % 2 === 0) {
      //check if the number can divide by 2 to know it's even or odd
      output.push(arr[i]);
    }
  }
  return output;
};
console.log(removeOdd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

//Exercise 5
const splitStr = function (str) {
  //split if there is a space separator between words
  let output = str.split(" ");
  return output;
};
console.log(splitStr("Hello world!")); // ["Hello", "world!"]

//create another alternatives function to split str without using built in method in array
const splitStr2 = function (str) {
  let output = [];
  let currentWord = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === " ") {
      output.push(currentWord);
      currentWord = "";
    } else {
      currentWord += str[i];
    }
  }
  output.push(currentWord); // Add the last word
  return output;
};
console.log(splitStr2("Hello world!")); // ["Hello", "world!"]
