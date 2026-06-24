import logo from "../assets/images/logo.png";


export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF4EC]">

            {/* <img
                src={logo}
                alt="Tipon"
                className="h-24 mb-8"
            /> */}

            <h1 className="text-8xl font-extrabold text-orange-500">
                404
            </h1>

            <h2 className="text-3xl font-bold mt-4 text-gray-700">
                Page Not Found
            </h2>

            <p className="mt-4 text-gray-500 text-center max-w-md">
                The page you are looking for may have been moved,
                deleted, or never existed.
            </p>

            <a
                href="/"
                className="
                    mt-8
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                "
            >
                Return Home
            </a>

        </div>
    );
}