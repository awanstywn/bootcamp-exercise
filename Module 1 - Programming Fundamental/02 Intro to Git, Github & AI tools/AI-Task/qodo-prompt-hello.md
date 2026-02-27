Qodo Prompt
@hello.js:1-1 Modify this code to ask for the user's name. Implement logic to detect the current time of day (Morning, Afternoon, Evening, Night). Create a randomizer that selects a greeting based on the time of day and user's name.

Qodo Reply

I will modify hello.js to prompt for the user's name, determine the current time of day, and output a randomized greeting tailored to that time and name. This makes the script interactive and dynamic.

I will update hello.js by replacing the static console.log with an interactive Node script that:

- Prompts the user for their name
- Detects the current time of day (Morning, Afternoon, Evening, Night)
- Randomly selects a greeting tailored to the time of day and the user's name
  This ensures the script is dynamic and personalized.

Implemented the requested changes in hello.js:

- Prompts the user for their name with basic non-empty validation.
- Detects current time of day: Morning (5–11), Afternoon (12–16), Evening (17–20), Night (21–4).
- Randomly selects a greeting tailored to the time of day and the provided name.

Run it with:
node hello.js
