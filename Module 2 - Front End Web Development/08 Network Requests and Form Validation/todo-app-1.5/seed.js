import axios from 'axios';

const APP_ID = '1A8E87C1-A8A8-4C90-9FB3-6DF75CB31A24';
const API_KEY = '6507A199-2C79-4F46-BE21-554FF810AAE1';
const BASE_URL = `https://api.backendless.com/${APP_ID}/${API_KEY}`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const users = [
  {
    name: "Alice Smith",
    email: "alice@example.com",
    password: "password123",
    todos: [
      { text: "Buy groceries", completed: false },
      { text: "Finish React project", completed: true },
      { text: "Read a book", completed: false }
    ]
  },
  {
    name: "Bob Jones",
    email: "bob@example.com",
    password: "password123",
    todos: [
      { text: "Go to the gym", completed: true },
      { text: "Schedule doctor appointment", completed: false },
      { text: "Call mom", completed: false },
      { text: "Clean the house", completed: true }
    ]
  }
];

async function seedData() {
  for (const user of users) {
    try {
      console.log(`\nRegistering user: ${user.email}...`);
      try {
        await api.post('/users/register', {
          name: user.name,
          email: user.email,
          password: user.password
        });
        console.log(`✅ Registered ${user.email}`);
      } catch (e) {
        if (e.response && e.response.data.code === 3033) {
          console.log(`⚠️ User ${user.email} already exists. Proceeding to login.`);
        } else {
          throw e;
        }
      }

      console.log(`Logging in user: ${user.email}...`);
      const loginRes = await api.post('/users/login', {
        login: user.email,
        password: user.password
      });
      const userToken = loginRes.data['user-token'];
      console.log(`✅ Logged in successfully. Got token.`);

      console.log(`Creating todos for ${user.email}...`);
      let manualIndex = 0;
      for (const todo of user.todos) {
        const payload = {
          text: todo.text,
          completed: todo.completed,
          created_at: Date.now(),
          manual_index: manualIndex++
        };
        await api.post('/data/Todos', payload, {
          headers: {
            'user-token': userToken
          }
        });
        console.log(`  + Added todo: "${todo.text}"`);
      }
      
      console.log(`✅ Finished seeding for ${user.email}`);
    } catch (error) {
      console.error(`❌ Error with user ${user.email}:`, error.response?.data || error.message);
    }
  }
  console.log("\n🎉 All seeding completed!");
}

seedData();
