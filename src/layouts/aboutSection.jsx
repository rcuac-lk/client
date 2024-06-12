const AboutSection = () => {
    return (
        <div id="about_section" className="p-5">
            <div className="md:flex items-center m-auto justify-center p-5 py-20">
                <div className="md:w-1/2 flex justify-center items-center p-5">
                    <img src={require('../images/about.jpg')} alt="swim" className="md:w-2/3 rounded-lg shadow-lg" />
                </div>
                <div className="md:w-1/2 p-5">
                    <h4 className="text-2xl text-center font-bold">About Us</h4>
                    <h1 className="text-4xl text-center py-2 font-bold">Welcome to the <br />Royal College Union Aquatic Club</h1>
                    <p className="text-lg text-center py-5">
                        The Royal College Union Aquatic Club, an esteemed division of the Royal College Colombo, fosters excellence in aquatic sports. We provide top-tier training and facilities, nurturing the talents of our swimmers, divers, and water polo players. Committed to both competitive success and personal development, our club embodies the spirit of teamwork, discipline, and sportsmanship. Join us in our pursuit of aquatic excellence.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AboutSection;