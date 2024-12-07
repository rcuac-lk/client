import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            AuthService.login(email, password).then(
                () => {
                    let response = AuthService.getCurrentUser();
                    if(response.approved === true) {
                        if(response.roles === 'Parent') navigate('/parent');
                        if(response.roles === 'Child') navigate('/child');
                        if(response.roles === 'Coach') navigate('/coach');
                        if(response.roles === 'Manager') navigate('/manager');
                        if(response.roles === 'Admin') navigate('/dashboard');
                    } else {
                        navigate('/pending');
                    }
                },
                (error) => {
                    if (error.response && error.response.data && error.response.data.message) {
                        setErrorMessage(error.response.data.message);
                    } else {
                        setErrorMessage('An unexpected error occurred. Please try again.');
                    }
                    console.log(error);
                }
            );
        } catch (error) {
            setErrorMessage('An unexpected error occurred. Please try again later.');
            console.log(error);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white text-center mb-5">Login</h1>
            <form onSubmit={handleSubmit} class="max-w-sm w-full bg-gray-800 p-8 rounded-lg">
                {errorMessage && (
                    <div className="text-red-500 text-sm mb-5">{errorMessage}</div>
                )}
                {/* <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Your email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="name@example.com" required />
                </div> */}
                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="email" class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div class="mb-5">
                    <label for="password"  class="block mb-2 text-sm font-medium text-white">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="password" class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                {/* <div class="flex items-start mb-5">
                    <div class="flex items-center h-5">
                        <input id="remember" type="checkbox" value="" class="w-4 h-4 border rounded bg-gray-50 focus:ring-3 dark:bg-gray-700 border-gray-600 focus:ring-blue-600 ring-offset-gray-800 focus:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" class="ms-2 text-sm font-medium text-gray-300">Remember me</label>
                </div> */}
                <button type="submit" class="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Submit</button>
            </form>
        </div>
    );
}

export default LoginPage;