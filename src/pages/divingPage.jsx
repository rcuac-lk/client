import React from 'react';
import Header from '../layouts/header';

const DivingPage = () => {
    return (
        <div>
        <Header />
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1>Swimming Page</h1>
                <div className="md:flex items-center m-auto justify-center p-5 pt-20">
                    <div className="md:w-1/2 p-5">
                        <img src={require('../images/diving.jpg')} alt="swim" className="w-full rounded-lg shadow-lg" />
                    </div>
                    <div className="md:w-1/2 p-5">
                        <h1 className="text-4xl text-center py-2 font-bold">Diving</h1>
                        <p className="text-lg py-5">
                        Royal College has been a dominant force in the field of School Diving for quite a few years in Sri Lanka. Royal College currently competes at the Public Schools Diving Championship, Sri Lanka Schools’ Age Groups Diving Championship, The Junior Nationals and the Nationals Diving Championship.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DivingPage;