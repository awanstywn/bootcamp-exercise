import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { loginSchema } from '../validations/authSchema';
import useTodoStore from '../store/useTodoStore';
import AppShell from '../components/layout/AppShell';
import darkBg from "../assets/dark-bg.png";
import lightBg from "../assets/light-bg.png";

/**
 * Objective: SignIn wrapper component that sets up the authentication UI.
 * This file allows users to enter their credentials, validates them using Formik and Yup,
 * and passes them to our global useAuthStore to handle the backend request.
 */
const SignIn: React.FC = () => {
    // 1. Hook Initialization
    // useNavigate is a hook from react-router-dom to programmatically redirect users after login
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we were redirected here from a successful signup
    const successMessage = location.state?.successMessage;

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Zustand store destructured to extract what we need for authentication
    const { signIn, isLoading, error, clearError, isLoggedIn } = useAuthStore();

    // Theme state
    const isDarkMode = useTodoStore((s) => s.isDarkMode);
    const toggleTheme = useTodoStore((s) => s.toggleTheme);
    const bannerImage = isDarkMode ? darkBg : lightBg;
    const gradientColors = isDarkMode
        ? "linear-gradient(#3710BD, #A42395)"
        : "linear-gradient(#5596FF, #AC2DEB)";
    const backgroundColor = isDarkMode ? "#171823" : "#FFFFFF";

    // 2. Redirect Effect
    // useEffect runs side effects. Here, it checks if the user is already logged in.
    // If they are, redirect them to the home page ('/') automatically.
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
        // Cleanup function: Clear any backend errors when leaving or unmounting the component
        return () => { console.log("cleanup called"); clearError(); };
    }, [isLoggedIn, navigate, clearError]);

    // 3. Formik Configuration
    // useFormik hook simplifies form state, validation, and submission handling
    const formik = useFormik({
        // initialValues sets the starting state for our form inputs
        initialValues: {
            email: '',
            password: '',
        },
        // validationSchema connects Yup to Formik, enforcing our login rules (required email/password)
        validationSchema: loginSchema,
        // onSubmit is triggered when the form is submitted and passes the Yup validation
        onSubmit: async (values) => {
            // Calls the signIn action from useAuthStore with the form values
            await signIn(values.email, values.password);
            // We do not navigate here manually because the useEffect above will redirect 
            // automatically when isLoggedIn becomes true!
        },
    });

    // 4. Component Rendering (TSX)
    return (
        <AppShell>
            {/* Mobile Banner: 300px height with TODO text, visible only on small screens < lg */}
            <div className="block lg:hidden absolute top-0 left-0 right-0 w-full" style={{ height: "300px", overflow: "hidden", zIndex: 0 }}>
                <div style={{ position: "absolute", width: "100%", height: "960px", top: "-310px", left: "0", right: "0", opacity: "1", backgroundImage: `url(${bannerImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                <div className="absolute inset-0" style={{ background: gradientColors, opacity: "0.85" }} />
                <div className="absolute z-10 text-white flex justify-between items-center px-6 w-full" style={{ top: "48px" }}>
                    <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "8px" }}>TODO</h2>
                    {/* Theme Toggle Button for Mobile inside Banner */}
                    <button type="button" onClick={toggleTheme} className="flex lg:hidden items-center justify-center cursor-pointer transition-all w-8 h-8 rounded-full bg-transparent p-0 text-white focus:outline-none" aria-label="Toggle theme">
                        {isDarkMode ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex h-screen lg:h-auto lg:min-h-screen overflow-hidden lg:overflow-auto w-full transition-colors duration-300 relative z-10" style={{ backgroundColor: 'transparent' }}>
                <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ backgroundColor }} />

                {/* Left Pane - Display image and gradient */}
                <div className="hidden lg:block w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="absolute inset-0" style={{ background: gradientColors, opacity: "0.85" }} />
                    
                    <div className="absolute z-10 text-white" style={{ top: "48px", left: "48px" }}>
                        <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "8px" }}>TODO</h2>
                    </div>

                    <div className="absolute z-10 text-white" style={{ bottom: "80px", left: "48px" }}>
                        <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1]" style={{ fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "-1px" }}>
                            Fast, Secure,<br/>Organized
                        </h1>
                    </div>
                </div>
                
                {/* Right Pane - Form area */}
                <div className="flex flex-col w-full lg:w-1/2 justify-center items-center py-8 lg:py-12 relative" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    {/* Theme Toggle Button for Desktop placed at top-right of the specific pane */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex absolute top-8 right-8 items-center justify-center cursor-pointer transition-all hover:scale-110 w-10 h-10 rounded-full bg-gray-100 dark:bg-[#25273D] text-gray-500 dark:text-gray-400 focus:outline-none z-20"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        )}
                    </button>
                    {/* The Transparent Container for Mobile, Floating element for Desktop */}
                    <div className="w-full max-w-[480px] bg-transparent shadow-none rounded-xl lg:rounded-none p-6 sm:p-8 lg:p-0 transition-colors duration-300 px-8 sm:px-10 lg:px-0">
                        <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
                            Sign in
                        </h1>
                        <p className="text-base text-gray-500 dark:text-[#5B5E7E]" style={{ fontFamily: "'Josefin Sans', sans-serif", marginBottom: '40px' }}>
                            Access to your Todo account
                        </p>

                {/* Display success message if redirected from sign up */}
                {successMessage && !error && (
                    <div className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-100/80 dark:bg-green-500/10 p-3 rounded-md text-center border border-green-500/20 font-medium tracking-wide">
                        {successMessage}
                    </div>
                )}

                {/* Display any backend authentication error (e.g., "Invalid password") using the error state */}
                {error && (
                    <div className="mb-4 text-sm text-red-500 bg-red-100/10 p-3 rounded-md text-center border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* The HTML form element tied to Formik's submit handler */}
                <form onSubmit={formik.handleSubmit} className="flex flex-col w-full" style={{ gap: '28px' }}>
                    
                    {/* Email Input Group */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">Email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            // formik.handleChange automatically updates Formik's state when typing
                            onChange={formik.handleChange}
                            // formik.handleBlur keeps track of inputs the user has visited
                            onBlur={formik.handleBlur}
                            // formik.values.email is the current controlled value of the input
                            value={formik.values.email}
                            className={`w-full bg-transparent text-[#494C6B] dark:text-[#C8CBE7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300 ${
                                formik.touched.email && formik.errors.email
                                    ? 'border-red-500' // Red outline if invalid
                                    : 'border-gray-300 dark:border-[#393A5A]' // Normal outline
                            }`}
                            style={{ padding: '16px 24px' }}
                            placeholder="Enter your email"
                        />
                        {/* Display Yup validation error only if the user has touched the input and it contains an error */}
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-xs text-red-500 mt-1">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    {/* Password Input Group */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className={`w-full bg-transparent text-[#494C6B] dark:text-[#C8CBE7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300 ${
                                    formik.touched.password && formik.errors.password
                                        ? 'border-red-500'
                                        : 'border-gray-300 dark:border-[#393A5A]'
                                }`}
                                style={{ padding: '16px 60px 16px 24px' }}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                style={{ paddingRight: '20px' }}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-xs text-red-500 mt-1">{formik.errors.password}</div>
                        ) : null}
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: '16px' }}>
                        <button
                            type="submit"
                            // Disable the button while the network request is loading to prevent double-clicks
                            disabled={isLoading}
                            className="w-full text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#25273D] transition-colors duration-300 disabled:opacity-50 flex justify-center items-center font-bold text-lg"
                            style={{ padding: '16px' }}
                        >
                            {isLoading ? (
                                <span>Logging in...</span>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Navigation Link to Sign Up */}
                <p className="text-center text-sm text-gray-500 dark:text-[#5B5E7E]" style={{ marginTop: '32px' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer">
                        Sign up here
                    </Link>
                </p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default SignIn;
