// Given two binary strings a and b, return their sum as a binary string.

 

// Example 1:

// Input: a = "11", b = "1"
// Output: "100"
// Example 2:

// Input: a = "1010", b = "1011"
// Output: "10101"
 

// Constraints:

// 1 <= a.length, b.length <= 104
// a and b consist only of '0' or '1' characters.
// Each string does not contain leading zeros except for the zero itself.

function addBinary(a: string, b: string): string {
    let n = a.length,
        m = b.length;
    if (n < m) return addBinary(b, a);

    let result: string[] = [];
    let carry = 0,
        j = m - 1;
    for (let i = n - 1; i >= 0; --i) {
        if (a[i] === "1") ++carry;
        if (j > -1 && b[j--] === "1") ++carry;

        result.push((carry % 2).toString());
        carry = Math.floor(carry / 2);
    }
    if (carry === 1) result.push("1");
    return result.reverse().join("");
}