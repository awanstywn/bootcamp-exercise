//Number 1 : sum number only of array
const sumNumbers = function (arr) {
  //check if the argument is array and not empty
  if (!Array.isArray(arr) || arr.length === 0) return "Invalid input";
  //check if the element is a number and only add if it is
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === "number") {
      sum += arr[i];
    }
  }
  return sum;
};
console.log(sumNumbers([1, 2, "a", 3, 4, "b", 5]));

//Number 2 : insert number to the array
const insertNumbers = function (arr, size, ...nums) {
  //check if the argument is array
  if (!Array.isArray(arr)) return "Invalid input";
  //check is the array is full or not
  if (arr.length >= size) {
    return "Array is full";
  }
  //loop to add the numbers to the array if the array is not full
  for (let i = 0; i < nums.length && arr.length < size; i++) {
    const value = nums[i];
    arr.push(value);
  }
  return arr;
};
console.log(insertNumbers([1, 2, 3, 4, 5], 10, 6, 7, 8));
console.log(insertNumbers([1, 2, 3, 4, 5], 5, 6));

//Number 3 : combine 2 arrays
const combineArr = function (arr1, arr2) {
  let combined = [...arr1, ...arr2];
  return combined;
};
console.log(combineArr([1, 2, 3], [4, 5, 6]));

//Number 4 : check the duplicate element
const findDuplicate = function (arr) {
  //store the value that has been checked
  let seen = {};
  let duplicates = {};
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (seen[val]) {
      duplicates[val] = true; // mark as duplicate once
    } else {
      seen[val] = true; // first time seen
    }
  }
  // Create an array of duplicate values
  let duplicateValues = Object.keys(duplicates);
  return duplicateValues;
};
console.log(findDuplicate([1, 2, 2, 2, 3, 3, 4, 5, 5]));

//Number 5 : find the difference of two array
const findDiff = function (arr1, arr2) {
  let diff = [];
  for (let i = 0; i < arr1.length; i++) {
    if (!arr2.includes(arr1[i])) {
      diff.push(arr1[i]);
    }
  }
  return diff;
};
