//Number 1 : get the lowest, highest, and average value
const findLowHighAvg = function (arr) {
  //initiate the value of each parameter
  let low = arr[0];
  let high = arr[0];
  let sum = arr[0];
  //loop to check the highest, lowest, and increment sum value
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < low) {
      low = arr[i];
    }
    if (arr[i] > high) {
      high = arr[i];
    }
    sum += arr[i];
  }
  let avg = sum / arr.length; //calc the average value
  return { low, high, avg };
};
console.log(findLowHighAvg([12, 5, 23, 18, 4, 45, 32]));

//Number 2 : concatenating the words
const concatWords = function (arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "Invalid input"; //makesure that the input is array and has at least one element
  if (arr.length === 1) return String(arr[0]); //if the array only has one element return the element itself
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`; //if the array only 2 element just concat with and
  const allButLast = arr.slice(0, -1).join(", "); //if the array has more than 2 element concat all but last with and and last element
  const last = arr[arr.length - 1];
  return `${allButLast}, and ${last}`; // concat all elements with and
};
console.log(concatWords(["apple", "banana", "cherry", "date"]));

//Number 3 : Find the second smallest element in the array
const secondSmallest = function (arr) {
  //initialize the value of smallest and secondSmallest element
  let smallest = arr[0];
  let secondSmallest = arr[0];
  //checking and updating the value using  for loop
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < smallest) {
      secondSmallest = smallest;
      smallest = arr[i];
    } else if (arr[i] < secondSmallest && arr[i] !== smallest) {
      secondSmallest = arr[i];
    }
  }
  return secondSmallest;
};
console.log(secondSmallest([5, 3, 1, 7, 2, 6]));

//Number 4 : calculate each element in the same position from two arrays
const sumElement = function (arr1, arr2) {
  if (
    !Array.isArray(arr1) ||
    !Array.isArray(arr2) ||
    arr1.length !== arr2.length
  ) {
    return "Invalid input";
  }
  let result = [];
  for (let i = 0; i < arr1.length; i++) {
    result.push(arr1[i] + arr2[i]);
  }
  return result;
};
console.log(sumElement([1, 2, 3], [3, 2, 1]));

//Number 5 : adds an element to the end of array
const addDiffElement = function (arr, num) {
  let result = arr;
  //loop to check if there is any element in the array that is equal to num
  //if any element equal to the num, just return the array
  //if not, add num to the end of array
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === num) {
      return arr;
    }
  }
  result.push(num);
  return result;
};
console.log(addDiffElement([1, 2, 3, 4], 4));
console.log(addDiffElement([1, 2, 3, 4], 7));

console.log(typeof null);
