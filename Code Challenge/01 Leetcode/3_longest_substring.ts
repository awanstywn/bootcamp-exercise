// Given a string s, find the length of the longest substring without duplicate characters.

 

// Example 1:

// Input: s = "abcabcbb"
// Output: 3
// Explanation: The answer is "abc", with the length of 3. Note that "bca" and "cab" are also correct answers.
// Example 2:

// Input: s = "bbbbb"
// Output: 1
// Explanation: The answer is "b", with the length of 1.
// Example 3:

// Input: s = "pwwkew"
// Output: 3
// Explanation: The answer is "wke", with the length of 3.
// Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
 

// Constraints:

// 0 <= s.length <= 5 * 104
// s consists of English letters, digits, symbols and spaces.

function lengthOfLongestSubstring(s: string): number {
    let maxLength = 0;
    let left = 0;
    const charMap = new Map<string, number>();

    for (let right = 0; right < s.length; right++) {
        const currentChar = s[right];

        // If the character is already in our map and its index is within our current window
        if (charMap.has(currentChar) && charMap.get(currentChar)! >= left) {
            // Move the left pointer past the previous occurrence of the duplicate character
            left = charMap.get(currentChar)! + 1;
        }

        // Store or update the last seen index of the character
        charMap.set(currentChar, right);

        // Calculate the current window size and update the max length
        maxLength = Math.max(maxLength, right - left + 1);
    }

    return maxLength;
}
