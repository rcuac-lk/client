const HeroSection = () => {
    
    const overlayStyle = {
        position: 'absolute',
        top: '0',
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 1, 0.7)',
        zIndex: 1,
      };
    
    return (
        <div id="hero_section" className="overflow-hidden bg-banner-pattern bg-cover">
            <div className="min-h-screen flex flex-col items-center m-auto justify-center p-5">
            {/* <h1 className="text-4xl text-center py-2 text-white font-bold leading-tight z-10">SWIMMING</h1> */}
            <h1 className="lg:text-8xl md:text-6xl text-4xl text-center text-golden-yellow font-bold leading-tight z-10 p-2 md:p-5">Welcome To Royal College</h1>
            <h1 className="lg:text-8xl md:text-6xl text-4xl text-center text-golden-yellow font-bold leading-tight z-10 p-2 md:p-5">Union Aquatic Club</h1>
                {/* <div className="mt-10 flex items-center justify-center z-10">
                    <a href="#" className="bg-transparent text-white px-5 py-3.5 md:text-xl text-md font-bold shadow-sm hover:bg-white border-4 border-white hover:border-blue-700 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Register Now</a>
                </div> */}
            </div>
            <div style={overlayStyle}></div>
        </div>
    );
}

export default HeroSection;