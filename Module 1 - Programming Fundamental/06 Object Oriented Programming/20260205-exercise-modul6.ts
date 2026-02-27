//Exercise 1 : Find the highest, lowest, and average of score and age from array of student data
//Create interface to define the types of data
interface Student {
  name: string;
  email: string;
  age: number;
  score: number;
}

interface Statistics {
  highest: number;
  lowest: number;
  average: number;
}

interface StudentDataResult {
  scoreStats: Statistics;
  ageStats: Statistics;
}

//Function to calculate statistics
const calculateStudentStats = function (arr: Student[]): StudentDataResult {
  //Validate input
  if (arr.length === 0) {
    throw new Error("Array is empty");
  }
  //Declare initial statistics
  let scoreStats: Statistics = {
    highest: arr[0].score,
    lowest: arr[0].score,
    average: 0,
  };

  let ageStats: Statistics = {
    highest: arr[0].age,
    lowest: arr[0].age,
    average: 0,
  };

  //Calculate highest, lowest, and total for average calculation
  let totalScore = 0;
  let totalAge = 0;

  for (const student of arr) {
    //Score calculations
    if (student.score > scoreStats.highest) {
      scoreStats.highest = student.score;
    }
    if (student.score < scoreStats.lowest) {
      scoreStats.lowest = student.score;
    }
    totalScore += student.score;

    //Age calculations
    if (student.age > ageStats.highest) {
      ageStats.highest = student.age;
    }
    if (student.age < ageStats.lowest) {
      ageStats.lowest = student.age;
    }
    totalAge += student.age;
  }

  //Calculate averages
  scoreStats.average = totalScore / arr.length;
  ageStats.average = totalAge / arr.length;

  return {
    scoreStats,
    ageStats,
  };
};

//Example usage
const students: Student[] = [
  { name: "John", email: "john@example.com", age: 25, score: 85 },
  { name: "Jane", email: "jane@example.com", age: 22, score: 90 },
  { name: "Mike", email: "mike@example.com", age: 28, score: 88 },
  { name: "Sarah", email: "sarah@example.com", age: 24, score: 92 },
];

console.log(calculateStudentStats(students));

//EXERCISE 2 + extra exercise 1 (showcase program to use class extend, use getter and setter methods, and private / protected properties) + extra exercise 2 (showcase using instanceof keyword and this keyword)
//create a class product that hold properties name (private and readonly) and price (private) with getter for each properties and setter for price only
class Product {
  private readonly _name: string;
  private _price: number;

  constructor(name: string, price: number) {
    this._name = name;
    this._price = price;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  set price(newPrice: number) {
    if (newPrice < 0) {
      throw new Error("Price cannot be negative");
    }
    this._price = newPrice;
  }
}

//Create a class CartItem that inherits Product class and hold quantity property with getter and setter also a method to calculate subtotal
class CartItem extends Product {
  private _quantity: number;

  //based on chat with AI, we can directly mention the private properties from parent in super for constructor but to call those properties we still need to use getter from parent class
  constructor(name: string, price: number, quantity: number) {
    super(name, price);
    this._quantity = quantity;
  }

  get quantity(): number {
    return this._quantity;
  }

  set quantity(newQuantity: number) {
    if (newQuantity < 0) {
      throw new Error("Quantity cannot be negative");
    }
    this._quantity = newQuantity;
  }

  calculateSubtotal(): number {
    return this.price * this.quantity;
  }
}

//create a class transaction that hold products information as array of CartItem
class Transaction {
  private products: CartItem[] = [];

  //Add method to add product to cart
  addProductToCart(product: Product, qty: number = 1): void {
    const cartItem = new CartItem(product.name, product.price, qty);
    this.products.push(cartItem);
  }

  //Method to calculate total price of transaction
  calculateTotal(): number {
    return this.products.reduce(
      (total, item) => total + item.calculateSubtotal(),
      0,
    );
  }

  //Method to list all products in the cart
  listCartItems(): string {
    return this.products
      .map(
        (item) =>
          `Product: ${item.name}, Price: ${item.price}, Quantity: ${item.quantity}, Subtotal: ${item.calculateSubtotal()}`,
      )
      .join("\n");
  }
}

//create an example an console.log that example
const product_1 = new Product("Laptop", 1200);
console.log(product_1); // Expected: Product { name: 'Laptop', price: 1200 }
const product_2 = new Product("Smartphone", 500);
const transaction = new Transaction();
transaction.addProductToCart(product_1, 2);
transaction.addProductToCart(product_2, 3);
console.log("Cart Items:\n" + transaction.listCartItems());
console.log("Total Price: " + transaction.calculateTotal());

//use intanceof to check it the object is belong to other class
console.log(product_1 instanceof Product); // Expected: true
console.log(transaction instanceof Transaction); // Expected: true
console.log(product_2 instanceof Transaction); // Expected: false

//EXTRA EXERCISE 3 : real life example of OOP concept
// 🎧 HEADPHONES
// Imagine headphones...
// The CLASS = The factory instructions for making headphones
// The OBJECT = Your actual headphones
// Your AirPods
// Your friend's big gaming headset
// Dad's noise-canceling headphones

class Headphones {
  // PROPERTIES = What headphones HAVE
  readonly brand: string; // Sony, Apple, etc. (doesn't change)
  readonly model: string; // Which model
  private _volume: number; // How loud (0 to 100)
  private _batteryLevel: number; // Battery % (0 to 100)
  private _isConnected: boolean; // Connected to phone?
  private _isPlaying: boolean; // Playing music?
  readonly maxVolume: number = 100; // Maximum volume allowed

  // CONSTRUCTOR = Building new headphones
  constructor(brand: string, model: string) {
    this.brand = brand;
    this.model = model;
    this._volume = 50; // Start at medium volume
    this._batteryLevel = 100; // Start fully charged
    this._isConnected = false; // Start disconnected
    this._isPlaying = false; // Start not playing
  }

  // GETTERS = Checking the headphones' status
  get volume(): number {
    return this._volume;
  }

  get batteryLevel(): number {
    return this._batteryLevel;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get status(): string {
    return `${this.brand} ${this.model} - Battery: ${this._batteryLevel}%, Volume: ${this._volume}, ${this._isConnected ? "Connected" : "Disconnected"}`;
  }

  // SETTERS = Changing volume with safety rules
  set volume(newVolume: number) {
    if (newVolume < 0) {
      console.log("❌ Volume can't be negative!");
      this._volume = 0;
    } else if (newVolume > this.maxVolume) {
      console.log("❌ That's too loud! Maximum is 100");
      this._volume = this.maxVolume;
    } else {
      this._volume = newVolume;
      console.log(`🔊 Volume set to ${this._volume}`);
    }
  }

  // METHODS = What headphones can DO
  connect(): void {
    if (this._batteryLevel === 0) {
      console.log("❌ Battery dead! Charge first!");
      return;
    }
    if (this._isConnected) {
      console.log("❌ Already connected!");
    } else {
      this._isConnected = true;
      console.log("✅ Connected to device!");
    }
  }

  disconnect(): void {
    if (!this._isConnected) {
      console.log("❌ Already disconnected!");
    } else {
      this._isConnected = false;
      this._isPlaying = false;
      console.log("✅ Disconnected from device!");
    }
  }

  play(): void {
    if (!this._isConnected) {
      console.log("❌ Can't play! Not connected to any device!");
    } else if (this._batteryLevel === 0) {
      console.log("❌ Battery dead!");
    } else if (this._isPlaying) {
      console.log("❌ Already playing music!");
    } else {
      this._isPlaying = true;
      console.log("🎵 Playing music!");
    }
  }

  pause(): void {
    if (!this._isPlaying) {
      console.log("❌ Music is not playing!");
    } else {
      this._isPlaying = false;
      console.log("⏸️ Music paused!");
    }
  }

  charge(): void {
    this._batteryLevel = 100;
    console.log("🔋 Fully charged!");
  }

  useBattery(): void {
    if (this._isPlaying && this._batteryLevel > 0) {
      this._batteryLevel -= 1;
      if (this._batteryLevel === 0) {
        this._isPlaying = false;
        this._isConnected = false;
        console.log("💀 Battery died! Headphones turned off.");
      }
    }
  }

  volumeUp(): void {
    this.volume = this._volume + 10; // Uses setter (safe)
  }

  volumeDown(): void {
    this.volume = this._volume - 10; // Uses setter (safe)
  }
}

// Create different headphone objects!

const myAirPods = new Headphones("Apple", "AirPods Pro");
console.log(myAirPods.status);
// "Apple AirPods Pro - Battery: 100%, Volume: 50, Disconnected"

myAirPods.play(); // ❌ Can't play! Not connected to any device!
myAirPods.connect(); // ✅ Connected to device!
myAirPods.play(); // 🎵 Playing music!

myAirPods.volumeUp(); // 🔊 Volume set to 60
myAirPods.volumeUp(); // 🔊 Volume set to 70
myAirPods.volumeDown(); // 🔊 Volume set to 60

console.log(myAirPods.batteryLevel); // 100

// Simulate battery draining
for (let i = 0; i < 100; i++) {
  myAirPods.useBattery();
}
// 💀 Battery died! Headphones turned off.

myAirPods.play(); // ❌ Battery dead!
myAirPods.charge(); // 🔋 Fully charged!
myAirPods.connect(); // ✅ Connected to device!
myAirPods.play(); // 🎵 Playing music!

// Create different headphones
const gamingHeadset = new Headphones("Razer", "Kraken");
console.log(gamingHeadset.status);
// "Razer Kraken - Battery: 100%, Volume: 50, Disconnected"
