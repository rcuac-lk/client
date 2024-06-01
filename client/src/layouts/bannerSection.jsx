const BannerSection = () => {
    const overlayStyleBanner = {
        position: 'relative',
        top: '0',
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 1, 0.4)',
        zIndex: 1,
      };

    return (
        <div id="about_section" className="bg-hero-pattern bg-cover">            
            <div style={overlayStyleBanner}>
            <div className="md:flex items-center m-auto justify-center p-10 py-32 z-10">
                <h1 className="md:text-6xl text-4xl text-white text-center py-2 font-bold">If you want to be the best, you have to do things that other people aren't willing to do - <span className="text-yellow-400">Michael Phelps</span></h1>
            </div>
            </div>
        </div>
    )
}

export default BannerSection;