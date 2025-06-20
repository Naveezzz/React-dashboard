import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

// Correct logo import: whiteLogo for light theme
import whiteLogo from "@/assets/logo-dark-og.webp";

const LoginPage = ({ onLogin = () => true }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Theme is always 'light'
    const theme = "light";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const success = onLogin(username, password);

        if (!success) {
            setError("Invalid username or password");
        }

        setIsLoading(false);
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 transition-colors`}>
            {/* Logo at the very top left corner, smaller size */}
            <div className="fixed top-4 left-4 z-20">
                <img
                    src={whiteLogo}
                    alt="BayesVision Logo"
                    className="h-12 w-auto drop-shadow-xl"
                />
            </div>

            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className={`bg-white border-slate-200 rounded-2xl shadow-xl border p-8 transition-colors`}>
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            {/* Clean circular user icon without box border */}
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                <User size={32} className="text-slate-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-600">
                            Sign in to your admin dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} className="text-slate-400 hover:text-slate-600" />
                                    ) : (
                                        <Eye size={18} className="text-slate-400 hover:text-slate-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-red-200 border rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-600">
                        Copyright © 2025 BayesVision - All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;