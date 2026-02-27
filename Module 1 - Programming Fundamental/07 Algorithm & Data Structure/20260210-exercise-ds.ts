//Exercise 1 : Find the majority element in an array that appears more than n/2 times.
const majorityElement = (nums: number[]): number => {
  //check if the input array is empty
  if (nums.length === 0) {
    throw new Error("Input array cannot be empty");
  }
  //check if the input array has only one or two elements
  if (nums.length === 1) {
    return nums[0];
  }

  //create an object to store the count of each element
  const count: { [key: number]: number } = {};
  //declare the number of times an element should appear to be considered a majority
  const majorityCount = Math.floor(nums.length / 2) + 1;
  //iterate through the input array and count the occurrences of each element
  for (const num of nums) {
    if (count[num] === undefined) {
      count[num] = 1;
    } else {
      count[num]++;
    }
    console.log(num, count[num]);
    //check if the current element has reached the majority count
    if (count[num] >= majorityCount) {
      return num;
    }
  }
  //if no majority element is found
  console.log("No majority element found");
  return -1;
};

//Example usage:
const nums = [2, 2, 1, 1, 1, 2, 2];
console.log(majorityElement(nums));
const nums2 = [3, 3, 4, 4];
console.log(majorityElement(nums2));

//Exercise 2 : Convert roman numerals to integers.
const romanToInt = (s: string): number => {
  //check if the input string is empty
  if (s.length === 0) {
    throw new Error("Input string cannot be empty");
  }
  //create a mapping of roman numerals to their integer values
  const romanMap: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  //initialize the result variable to store the final integer value
  let result = 0;
  //iterate through the input string and convert each roman numeral to its integer value
  for (let i = 0; i < s.length; i++) {
    const currentVal = romanMap[s[i]];
    const nextVal = romanMap[s[i + 1]];
    //check if the current numeral is less than the next numeral, which indicates a subtraction case
    if (nextVal && currentVal < nextVal) {
      result -= currentVal;
    } else {
      result += currentVal;
    }
    console.log(result);
  }
  return result;
};

//Example usage:
console.log(romanToInt("III")); // Output: 3
console.log(romanToInt("IV")); // Output: 4
console.log(romanToInt("IX")); // Output: 9
console.log(romanToInt("LVIII")); // Output: 58
console.log(romanToInt("MCMXCIV")); // Output: 1994

//Exercise 3 : Create a Pascal's Triangle up to a given number of rows.
const generatePascalsTriangle = (numRows: number): number[][] => {
  //check if the input number of rows is less than or equal to zero
  if (numRows <= 0) {
    throw new Error("Number of rows must be a positive integer");
  }
  //initialize the triangle with the first row
  const triangle: number[][] = [[1]];
  //build each row of the triangle
  for (let row = 1; row < numRows; row++) {
    //initialize the current row with the first element as 1
    const currentRow: number[] = [1];
    //calculate the values for the current row based on the previous row
    const prevRow = triangle[row - 1];
    //each element (except the first and last) is the sum of the two elements above it
    for (let j = 0; j < prevRow.length - 1; j++) {
      //calculate the value by summing the two elements from the previous row
      currentRow.push(prevRow[j] + prevRow[j + 1]);
    }

    currentRow.push(1);
    triangle.push(currentRow);
    console.log(triangle);
  }
  return triangle;
};

//Example usage:
console.log(generatePascalsTriangle(5));

//Exercise 4 : Maximize profit from stock prices.
const maxProfit = (prices: number[]): number => {
  //check if the input array is empty
  if (prices.length === 0) {
    throw new Error("Prices array cannot be empty");
  }
  //initialize variables to store the minimum price and maximum profit
  let minPrice = Infinity;
  let maxProfit = 0;
  //iterate through the prices array to calculate the maximum profit
  for (const price of prices) {
    //update the minimum price if the current price is lower
    minPrice = Math.min(minPrice, price);
    //calculate the potential profit and update the maximum profit if it's higher
    maxProfit = Math.max(maxProfit, price - minPrice);
    console.log(minPrice, maxProfit);
  }

  return maxProfit;
};

//Example usage:
const prices = [7, 1, 5, 3, 6, 4];
console.log(maxProfit(prices)); // Output: 5
const prices2 = [7, 6, 4, 3, 1];
console.log(maxProfit(prices2)); // Output: 0
const prices3 = [7, 3, 4, 6, 2, 4, 4];
console.log(maxProfit(prices3)); // Output: 3
