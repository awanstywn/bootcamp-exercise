import { createStore } from "zustand/vanilla";

interface RegularUser {
    type: "user";
    name: string;
    email: string;
}

interface GuestUser {
    type: "guest";
}

type User = RegularUser | GuestUser;

interface MyState {
    user: User | null;
}

// Create a vanilla store
const userAuth = createStore<MyState>((set) => ({
    user: null,
}));


const userActions = {
    login: (name: string, email: string) =>
        userAuth.setState({ user: { type: "user", name, email } }),
    loginAsGuest: () =>
        userAuth.setState({ user: { type: "guest" } }),
    logout: () =>
        userAuth.setState({ user: null }),
}
