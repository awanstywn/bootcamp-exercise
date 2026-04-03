//function accept of number
//return array that must consist number from 1 until n but the sort is random
function arrayOfNumber(numb){
    let array = [];
    for(let i = 1; i <= numb; i++){
        array.push(i);
    }
    return array.sort(() => Math.random() - 0.5);
}


console.log(arrayOfNumber(5));


//make 2 object and class that represent a real life object
//first object is headphone with the function or parameter
class headphone{
    constructor(brand, model, color, price){
        this._brand = brand;
        this._model = model;
        this._color = color;
        this._price = price;
        this.isOn = false;
        this.volume = 5;
    }

    //add parameter to turn on and turn off
    turnOn(){
        this.isOn = true;
        console.log(`Headphone is turning on. Power status: ${this.isOn}`);
    }
    turnOff(){
        this.isOn = false;
        console.log(`Headphone is turning off. Power status: ${this.isOn}`);
    }
    //add parameter to up and down the volume
    volumeUp(){
        if(this.isOn) {
            this.volume++;
            console.log(`Volume is increasing. Current volume: ${this.volume}`);
        } else {
            console.log("Cannot increase volume. Headphone is currently off.");
        }
    }
    volumeDown(){
        if(this.isOn && this.volume > 0) {
            this.volume--;
            console.log(`Volume is decreasing. Current volume: ${this.volume}`);
        } else if (!this.isOn) {
            console.log("Cannot decrease volume. Headphone is currently off.");
        } else {
            console.log("Volume is already at minimum (0).");
        }
    }

}

//second object is Air Conditioner  with the function or parameter
class airConditioner{
    constructor(brand, model, color, price){
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.price = price;
        this.isOn = false;
        this.temperature = 22;
    }
    //add function
    turnOn(){
        this.isOn = true;
        console.log(`Air Conditioner is turning on. Power status: ${this.isOn}`);
    }
    turnOff(){
        this.isOn = false;
        console.log(`Air Conditioner is turning off. Power status: ${this.isOn}`);
    }
    //add parameter to up and down the temperature
    temperatureUp(){
        if(this.isOn) {
            this.temperature++;
            console.log(`Temperature is increasing. Current temperature: ${this.temperature}°C`);
        } else {
            console.log("Cannot increase temperature. Air Conditioner is off.");
        }
    }
    temperatureDown(){
        if(this.isOn) {
            this.temperature--;
            console.log(`Temperature is decreasing. Current temperature: ${this.temperature}°C`);
        } else {
            console.log("Cannot decrease temperature. Air Conditioner is off.");
        }
    }
}

//create a class student with name, id, age
class Student {
    constructor(name, id, age) {
        this.name = name;
        this.id = id;
        this.age = age;
    }
}

//create a class classRoom that consist of student, add some function to sort the student based on name, id, and age
class ClassRoom {
    constructor() {
        this.students = [];
    }
    
    addStudent(student) {
        this.students.push(student);
    }
    
    sortByName() {
        // Copy the array to prevent mutating the original, then sort
        return [...this.students].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    sortById() {
        return [...this.students].sort((a, b) => a.id - b.id);
    }
    
    sortByAge() {
        return [...this.students].sort((a, b) => a.age - b.age);
    }
}

//give the example of how to use the class
const myClass = new ClassRoom();
myClass.addStudent(new Student("Budi", 102, 21));
myClass.addStudent(new Student("Cici", 101, 19));
myClass.addStudent(new Student("Andi", 103, 20));

console.log("--- Original student list ---");
console.log(myClass.students);

console.log("\n--- Sorted by Name ---");
console.log(myClass.sortByName());

console.log("\n--- Sorted by ID ---");
console.log(myClass.sortById());

console.log("\n--- Sorted by Age ---");
console.log(myClass.sortByAge());


