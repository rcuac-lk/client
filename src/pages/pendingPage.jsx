import React from 'react';

const PendingPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url(require('../images/hero-bg.jpg'))` }}>
            <div className="absolute inset-0 bg-dark-blue bg-opacity-80"></div>
            <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-xl shadow-2xl bg-white bg-opacity-90 max-w-lg w-full animate-fade-in">
                <svg className="w-20 h-20 text-golden-yellow mb-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                <h1 className="text-4xl font-bold text-dark-blue mb-2 text-center">Pending Approval</h1>
                <h2 className="text-lg text-gray-700 text-center mb-4">Your account is <span className="text-golden-yellow font-semibold">pending approval</span>.<br />You will be notified once it is activated.</h2>
                <p className="text-sm text-gray-500 text-center">Thank you for your patience!</p>
            </div>
        </div>
    );
}

export default PendingPage;