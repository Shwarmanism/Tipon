import logo from "../assets/images/logo.png";
import illustration from "../assets/images/illustration.png";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">

            {/* LEFT PANEL */}
            <div className="
                            hidden
                            2xl:flex
                            2xl:w-[55%]
                            bg-[#FFF4EC]
                            rounded-r-[50px]
                            flex-col
                            items-center
                            justify-center
                            px-10
                        ">

                <img
                    src={logo}
                    alt="Tipon Logo"
                    className=" 
                                h-16
                                md:h-20
                                lg:h-24
                                mb-8"
                />

                <img
                    src={illustration}
                    alt="Community Illustration"
                    className="
                            hidden
                            lg:block
                            w-[500px]
                            h-auto
                            object-contain"
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
            <div className="flex 
                            2xl:w-[45%]
                            justify-center 
                            items-center
                            w-full 
                            min-h-screen 
                            ">
                {children}
            </div>

        </div>
    );
}