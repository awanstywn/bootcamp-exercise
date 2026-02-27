Qodo Prompt
@intro.js Make it more interactive and add input validation.

Qodo Reply

I will edit intro.js to prompt the user for their name, age, and favorite language, add input validation (non-empty name, numeric/positive age, non-empty language), and print helpful error messages. This makes the script interactive and robust.

I will update intro.js by replacing the static variables with interactive prompts using Node's readline module, including validation for each input and clear error handling, so the script can be run directly with node and guide the user.

Updated intro.js to be interactive with robust input validation:

- Replaced hardcoded values with prompts using Node’s readline.
- Added validation:
  - Name: required, min 2 chars.
  - Age: required, numeric, whole number, > 0, ≤ 120.
  - Language: required, min 2 chars.
- Clear error messages and retry until valid input.
- Handles unexpected errors and ensures the interface closes.

Run it with:
node intro.js
