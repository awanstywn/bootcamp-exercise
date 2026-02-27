//ALGORITHM EXERECISE
/*1. Brushing Your Teeth
a. Get your toothbrush and toothpaste ready.
b. Put a little bit of toothpaste on the brush.
c. Wet the brush with a splash of water.
d. Brush every part of your teeth for about 2 minutes.
e. Spit out the toothpaste and rinse your mouth with water.
f. Wash the brush and put it away.

2. Ordering Food Online
a. Open the food app on your phone.
b. Pick a restaurant that looks good and is currently open.
c. Select the food you want and add it to your basket.
d. Check the total price to make sure it’s okay.
e. Click the "Order" button and pay.
f. Wait for the delivery driver to arrive at your door.

3. Crossing the Street
a. Stop at the edge of the road.
b. Look to the left, then to the right, and then to the left again.
c. Wait until there are no cars coming or the "Walk" sign turns green.
d. Walk across the road quickly but carefully.
e. Keep looking both ways until you reach the other side.

4. Deciding what to wear based on the weather
a. Check current weather condition
b. Check weather forecast for the day
c. If current weather = raining OR forecast shows rain, then Decision: Bring an umbrella
d. Else if current weather = sunny AND forecast remains sunny, then Decision: Wear sunglasses
e. Else if current weather = cold OR forecast shows temperature drop, then Decision: Wear a jacket
f. If forecast shows multiple conditions (e.g., sunny now but rain later), then Decision: Bring multiple items (sunglasses AND umbrella)
g. If temperature will drop significantly during the day, then Decision: Bring an extra layer regardless of current temperature
*/

//CODE EXERCISE
//find area of rectangle
let length = 5;
let width = 3;
let areaRect = length * width;
console.log(areaRect);

//find perimeter of rectangle
let perimeterRect = 2 * (length + width);
console.log(perimeterRect);

//diameter find diameter, circumference and area of a circle
let radius = 5;
let diameter = 2 * radius;
let circumference = (2 * Math.PI * radius).toFixed(4);
let area = (Math.PI * radius ** 2).toFixed(3);
let output = `diameter = ${diameter}, circumference = ${circumference}, area = ${area}`;
console.log(output);

//find angles of triangle if two angles are given.
let totalAngle = 180;
let angleA = 80;
let angleB = 65;
let angleC = totalAngle - (angleA + angleB);
console.log(angleC);

//convert days to years, months and days
function convertDays(totalDays) {
  let years = Math.floor(totalDays / 365);
  let months = Math.floor((totalDays % 365) / 30);
  let days = (totalDays % 365) % 30;
  let yearsOutput = `${years} year${years > 1 ? "s" : ""}`;
  let monthsOutput = `${months} month${months > 1 ? "s" : ""}`;
  let daysOutput = `${days} day${days > 1 ? "s" : ""}`;
  console.log(`${yearsOutput}, ${monthsOutput}, ${daysOutput}`);
}
//Example
convertDays(400);
convertDays(366);

//get difference between dates in days.
function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffInMs = Math.abs(d2 - d1);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
}

// Example
const date1 = "2022-01-20";
const date2 = "2022-01-22";
console.log(getDaysDifference(date1, date2));
