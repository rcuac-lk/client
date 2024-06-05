const SwimmingDetailsSection = () => {
    return (
        <div id="swim_section" className="p-5">
            <div className="h-2/4 flex flex-col items-center m-auto justify-center p-5">
            <h1 className="text-4xl text-center py-4 font-bold leading-tight z-10">What We Do</h1>

            <div className="grid md:grid-cols-3 grid-cols-1 gap-10 py-10">
                <div className="max-w-sm border rounded-lg shadow bg-dark-blue border-gray-700">
                    <img className="rounded-t-lg" src={require('../images/swimming.jpg')} alt="" />
                    <div className="p-5">
                        <a href="/swimming">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Swimming</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-dark-blue border-gray-700">
                    <img className="rounded-t-lg" src={require('../images/diving.jpg')} alt="" />
                    <div className="p-5">
                        <a href="/diving">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Diving</h5>
                        </a>
                    </div>
                </div>
                <div className="max-w-sm border rounded-lg shadow bg-dark-blue border-gray-700">
                    <img className="rounded-t-lg" src={require('../images/water-polo.jpg')} alt="" />
                    <div className="p-5">
                        <a href="/water-polo">
                            <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-white">Water Polo</h5>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default SwimmingDetailsSection;