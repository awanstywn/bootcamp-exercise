//Exercise Number 1
//Create a function to convert excel sheet title column title to its corresponding column number
const excelColumnToNumber = function (columnTitle: string): number {
  //Validate input
  if (columnTitle.length === 0) {
    throw new Error("Column title is empty");
  }
  //convert the string to uppercase so it can give same result if it is lowercase or uppercase
  columnTitle = columnTitle.toUpperCase();

  let columnNumber = 0;
  //use for loop to convert each character to its corresponding number
  for (let i = 0; i < columnTitle.length; i++) {
    const charCode = columnTitle.charCodeAt(i) - 64; // 'A' is 65 in ASCII
    columnNumber = columnNumber * 26 + charCode;
    console.log(columnNumber);
  }
  return columnNumber;
};

//Test
console.log(excelColumnToNumber("A")); // Output: 1
console.log(excelColumnToNumber("AB")); // Output: 28
console.log(excelColumnToNumber("aB")); // Output: 701

//Exercise Number 2
//find the element that is only appear once
const singleNumber = function (nums: number[]): number {
  const numCount: { [key: number]: number } = {};
  //check for empty array
  if (nums.length === 0) {
    throw new Error("Input array is empty");
  }

  //check if array has only one element
  if (nums.length === 1) {
    return nums[0];
  }

  // Count occurrences of each number
  for (const num of nums) {
    if (numCount[num]) {
      numCount[num]++;
    } else {
      numCount[num] = 1;
    }
    console.log(numCount);
  }

  //Find the number that appears only once based on the count and return it
  //There is possibility that there can be more than one number that appears once, so return in array
  const singleNumbers: number[] = [];
  for (const num in numCount) {
    if (numCount[num] === 1) {
      singleNumbers.push(parseInt(num));
    }
    console.log(singleNumbers);
  }

  // If no single number is found, throw an error
  if (singleNumbers.length === 0) {
    throw new Error("No single number found");
  }
  return singleNumbers;
};

//Test
console.log(singleNumber([4, 1, 2, 1, 2])); // Output: 4
console.log(singleNumber([2, 2, 1, 4])); // Output: 1

//Exercise Number 3
//Given two strings, write a function to determine if they are anagrams of each other using maps
const areAnagrams = function (str1: string, str2: string): boolean {
  //If length of both strings are not equal, they cannot be anagrams
  if (str1.length !== str2.length) {
    return false;
  }
  //Check if one or both strings are empty
  if (str1.length === 0 || str2.length === 0) {
    throw new Error("One or both strings are empty");
  }

  //Convert both strings to lowercase to make the comparison case-insensitive
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  const charCountMap: Map<string, number> = new Map();

  //Count occurrences of each character in str1
  for (const char of str1) {
    charCountMap.set(char, (charCountMap.get(char) || 0) + 1);
    console.log(charCountMap);
  }

  //Decrease the count for each character found in str2
  for (const char of str2) {
    if (!charCountMap.has(char)) {
      return false; // Character in str2 not found in str1
    }
    charCountMap.set(char, charCountMap.get(char)! - 1);
    console.log(charCountMap);
    if (charCountMap.get(char) === 0) {
      charCountMap.delete(char); // Remove character count if it reaches zero
    }
  }

  //If map is empty, strings are anagrams
  return charCountMap.size === 0;
};

//Test
console.log(areAnagrams("listen", "silent")); // Output: true
console.log(areAnagrams("hello", "world")); // Output: false

//Exercise Number 4
//Find how many distinct way to climb to the top of n stairs with 1 or 2 steps at a time
const climbStairs2 = function (n: number): number {
  //Handle base cases
  if (n <= 0) {
    throw new Error("Number of stairs must be a positive integer");
  }
  if (n === 1) {
    return 1;
  }
  if (n === 2) {
    return 2;
  }

  let first = 1; // Ways to climb to the first stair
  let second = 2; // Ways to climb to the second stair
  let ways = 0;

  //Use for loop to calculate ways to climb to the nth stair
  for (let i = 3; i <= n; i++) {
    ways = first + second; // Current ways is sum of ways to reach the two previous stairs
    first = second; // Move to next stair
    second = ways; // Update second to current ways
    console.log(ways);
  }

  return ways;
};

//Test
console.log(climbStairs2(3)); // Output: 3
console.log(climbStairs2(5)); // Output: 8
