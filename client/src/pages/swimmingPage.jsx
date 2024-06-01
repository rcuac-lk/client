import React from 'react';
import Header from '../layouts/header';

const SwimmingPage = () => {
    return (
        <div>
        <Header />
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1>Swimming Page</h1>
                <div className="md:flex items-center m-auto justify-center p-5 pt-20">
                    <div className="md:w-1/2 p-5">
                        <img src={require('../images/swimming.jpg')} alt="swim" className="w-full rounded-lg shadow-lg" />
                    </div>
                    <div className="md:w-1/2 p-5">
                        <h1 className="text-4xl text-center py-2 font-bold">Swimming</h1>
                        <p className="text-lg py-5">
                        Swimming was introduced to the College in 1934. At first, all practices and training was conducted at the S.Thomas’ College Pool at Mt. Lavinia. Later the St. Joseph’s College pool and the Sinhalese Sports Club pool were used. Although a pool for the school was suggested in 1935, the school built its swimming pool only in 1968. Currently Royal College conducts swimming workshops every single day of the week. The main squad practicing from 05:10 am IST until 07:00 am IST, whilst development squads practice ever Monday, Wednesday, and Friday evenings.
                        <br />
                        Royal College Swimming comes under the purview of the Royal College Union’s Aquatic Committee, which has also launched the Royal College Swimming Academy with the objective of teaching people of all ages how to swim.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SwimmingPage;