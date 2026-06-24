import logo from "../assets/images/logo.png";
import illustration from "../assets/images/illustration.png";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-white">

            {/* LEFT PANEL */}
            <div className="w-[55%] bg-[#FFF4EC] rounded-r-[50px] flex flex-col items-center justify-center px-10">

                <img
                    src={logo}
                    alt="Tipon Logo"
                    className="h-24 w-auto mb-8"
                />

                <img
                    src={illustration}
                    alt="Community Illustration"
                    className="w-[600px] h-auto object-contain"
                />

                <div className="mt-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Building Stronger Communities
                    </h2>

                    <p className="text-lg text-gray-500">
                        Through Better Events
                    </p>
                </div>

            </div>

            {/* RIGHT PANEL */}
            <div className="w-[45%] flex items-center justify-center">
                {children}
            </div>

        </div>
    );
}