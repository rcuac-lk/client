const InstructorSection = () => {
    return (
        <div id="swim_section" className="p-5">
            <div className="h-96 flex flex-col items-center m-auto justify-center p-5">
            <h1 className="text-4xl text-center py-4 font-bold leading-tight z-10">Our Instructors</h1>

            <div className="grid md:grid-cols-3 grid-cols-1 gap-10">
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <a href="#">
                        <img className="rounded-t-lg" src="/images/hero-bg.jpg" alt="" />
                    </a>
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Swimming</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <a href="#">
                        <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
                    </a>
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Diving</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-gray-800 border-gray-700">
                    <a href="#">
                        <img className="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
                    </a>
                    <div className="p-5">
                        <a href="#">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">High Diving</h5>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default InstructorSection;