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
    const n = s.length;

    let res = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            if (checkRepetition(s, i, j)) {
                res = Math.max(res, j - i + 1);
            }
        }
    }

    function checkRepetition(s: string, start: number, end: number): boolean {
        const chars = new Set<string>();

        for (let i = start; i <= end; i++) {
            const c = s[i];
            if (chars.has(c)) {
                return false;
            }
            chars.add(c);
        }

        return true;
    }

    return res;
}