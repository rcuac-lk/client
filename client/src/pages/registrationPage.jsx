const RegistrationPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center m-auto justify-center p-5">
            <h1 className="text-3xl font-bold text-center mb-5">Registration</h1>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-10">
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Parents</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Students</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Swimming</h5>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;