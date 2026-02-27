//Exercise 1 : merge two arrays that contain objects students with name and email properties. The merged array should not contain duplicate students.
interface Student {
  name: string;
  email: string;
}

const mergeStudentArrays = (arr1: Student[], arr2: Student[]): Student[] => {
  //create a new array to store the merged students
  const merged: Student[] = [];
  //create a set to track unique names and emails
  const seen: Set<string> = new Set();

  //function to add students to the merged array if they are unique
  const addUniqueStudents = (students: Student[]) => {
    for (const student of students) {
      const identifier = `${student.name}-${student.email}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        merged.push(student);
      }
    }
  };

  //add students from both arrays
  addUniqueStudents(arr1);
  addUniqueStudents(arr2);

  return merged;
};

//Example usage:
const students1: Student[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
  { name: "Charlie", email: "charlie@example.com" },
];

const students2: Student[] = [
  { name: "Alice", email: "alice@example.com" }, // duplicate
  { name: "David", email: "david@example.com" },
  { name: "Eve", email: "eve@example.com" },
];

const mergedStudents = mergeStudentArrays(students1, students2);
console.log(mergedStudents);

//Exercise 2 : Write a function that accepts an array of objects. Switch all values into keys and all keys into values.
interface KeyValue {
  [key: string]: any;
}

const switchKeyValue = (arr: KeyValue[]): KeyValue[] => {
  return arr.map((obj) => {
    const switched: KeyValue = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        switched[value] = key;
      }
    }
    return switched;
  });
};

//Example usage:
const originalArray: KeyValue[] = [
  { name: "David", age: 20 },
  { name: "Alice", age: 30, city: "New York" },
];

const switchedArray = switchKeyValue(originalArray);
console.log(switchedArray);

//Exercise 3 : write a function to calculate the factorial of a number using recursion.
const factorial = (n: number): number => {
  //create a constraint for negative numbers
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  }
  //base case for 0 and 1
  if (n === 0 || n === 1) {
    return 1;
  }
  //recursive case for the incrementing numbers
  return n * factorial(n - 1);
};

//Example usage:
console.log(factorial(5)); // Output: 120
console.log(factorial(0)); // Output: 1
console.log(factorial(-1)); // Throws an error: "Factorial is not defined for negative numbers"
