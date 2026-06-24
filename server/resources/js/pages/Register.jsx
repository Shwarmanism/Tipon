import AuthLayout from "../components/AuthLayout";
import logo2 from "../assets/images/logo2.png";
import { User, Mail, Lock, Eye } from "lucide-react";

export default function Register() {
    return (
        <AuthLayout>

            <div className="
                w-full 
                max-w-[620px]
                bg-white
                rounded-3xl
                p-6 md:p-8 lg:p-10
                shadow-xl
                border
                border-orange-200
            ">

                <h1 className="text-3xl md:text-4xl font-bold text-orange-600 text-center">
                    Create your account
                </h1>

                <p className="text-center text-gray-500 text-sm mt-2 mb-3">
                    Only PUP students with an official university email may register.
                </p>

                {/* Form Here */}
                 <form
                    method="POST"
                    action="/register"
                    className="space-y-5"
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

                    {/* Full Name */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">

                        {/* Email */}
                        <div className="col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                University Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="juan@iskolarngbayan.pup.edu.ph"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Use your official PUP Iskolar ng Bayan email.
                            </p>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Role
                            </label>

                            <select
                                name="role"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select
                                </option>

                                <option value="student">
                                    Student
                                </option>

                                <option value="admin">
                                    Admin
                                </option>
                            </select>
                        </div>

                </div>

                    {/* Password */}
                    <div>
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
                                placeholder="Create a password"
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <Eye
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="password"
                                name="password_confirmation"
                                placeholder="Confirm your password"
                                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <Eye
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] transition duration-200 text-white py-3 rounded-xl font-semibold shadow-lg"
                    >
                        Create Account
                    </button>

                    <div className="text-center mt-2">
                        <span className="text-gray-500">
                            Already have an account?
                        </span>

                        <a
                            href="/login"
                            className="ml-1 font-semibold text-orange-500 hover:text-orange-600 hover:underline"
                        >
                            Sign In
                        </a>
                    </div>

                </form>

            </div>

        </AuthLayout>
    );
}