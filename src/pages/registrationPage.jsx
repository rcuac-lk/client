import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const RegistrationPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            await axios.post('/register', { name, email, password, password_confirmation });
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
            navigate('/dashboard')
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white text-center mb-5">Registration</h1>
            <form onSubmit={handleSubmit} class="max-w-sm w-full bg-gray-800 p-8 rounded-lg">
                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Name</label>
                    <input type="name" id="name" value={name} onChange={(e) => setName(e.target.value)} class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="name@example.com" required />
                </div>
                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="name@example.com" required />
                </div>
                <div class="mb-5">
                    <label for="password"  class="block mb-2 text-sm font-medium text-white">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div class="mb-5">
                    <label for="password"  class="block mb-2 text-sm font-medium text-white">Confim Password</label>
                    <input type="password" id="confirm_password" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <button type="submit" class="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Register</button>
            </form>
        </div>
    );
}

export default RegistrationPage;