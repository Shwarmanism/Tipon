import logo2 from "../assets/images/logo2.png";
import { Mail, Lock, Eye } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
    return (
        <AuthLayout>

            <div className="w-[500px] min-h-[650px] bg-white rounded-3xl p-12 shadow-xl border border-orange-200 flex flex-col justify-center">

                <div className="flex justify-center">
                    <img
                        src={logo2}
                        alt="Logo"
                        className="h-25 w-auto mb-5"
                    />
                </div>

                <h1 className="text-4xl font-bold text-center text-orange-600">
                    Welcome Back
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Sign in to your Tipon account
                </p>

                {/* Login Form */}
                <form
                        method="POST"
                        action="/login"
                        className="mt-8"
                    >
                        <input
                            type="hidden"
                            name="_token"
                            value={
                                document.querySelector(
                                    'meta[name="csrf-token"]'
                                )?.content
                            }
                        />

                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Webmail
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Password
                            </label>


                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />

                                <Eye
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-end mb-2 mt-2">
                                <a
                                    href="/forgot-password"
                                    className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
                                >
                                    Forgot Password?
                                </a>
                            </div>


                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] transition duration-200 text-white py-3 rounded-xl font-semibold shadow-lg"
                        >
                            Sign In
                        </button>

                        <div className="mt-2 text-center">
                                <span className="text-gray-500">
                                    Don't have an account?
                                </span>

                                <a
                                    href="/register"
                                    className="ml-1 font-semibold text-orange-500 hover:text-orange-600 hover:underline"
                                >
                                    Sign Up
                                </a>
                            </div>
                    </form>

            </div>

        </AuthLayout>
    );
}


