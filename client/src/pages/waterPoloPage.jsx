import React from 'react';
import Header from '../layouts/header';

const WaterPoloPage = () => {
    return (
        <div>
        <Header />
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1>Swimming Page</h1>
                <div className="md:flex items-center m-auto justify-center p-5 pt-20">
                    <div className="md:w-1/2 p-5">
                        <img src={require('../images/water-polo.jpg')} alt="swim" className="w-full rounded-lg shadow-lg" />
                    </div>
                    <div className="md:w-1/2 p-5">
                        <h1 className="text-4xl text-center py-2 font-bold">Water Polo</h1>
                        <p className="text-lg py-5">
                        Water polo was first introduced to Royal college in 1958. Senan Nagarathnam was the first water polo captain. The first Royal–Thomian encounter for the Dr. R. L. Hayman trophy was played in 1992 and the Royal team was led by Nethru Nanayakkara. Sachithra Thilakarathne was the captain who led the College team to their very first Royal-Thomian victory in 2005 with a scoreline that read 13 goals to 9. Since 2005 the College team won the Royal-Thomian encounter for 6 consecutive years. The inaugural Royal-Nalanda Water polo encounter was initiated in 2017.
                        <br />
                        The success of the Royal College Water polo team has not been limited to the school arena with the team emerging as champions at the National Water Polo Championship and Ellawala League several times within the past few years.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WaterPoloPage;