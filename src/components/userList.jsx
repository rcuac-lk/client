import React, { useState } from 'react';
import { useEffect } from 'react';
import UserService from '../services/user.service';

const UserListComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const openModal = async (id) => {
    try {
      const response = await UserService.getUser(id);
      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.updateUser(selectedUser.UserID, selectedUser);
      setIsModalOpen(false);
      allUsers(); // Refresh the user list after update
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const saveChanges = async () => {
    try {
      await UserService.updateUser(selectedUser.UserID, selectedUser);
      console.log(selectedUser);
      setIsModalOpen(false);
      allUsers(); // Refresh the user list after update
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const allUsers = async () => {
    try {
      const response = await UserService.approvedUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching approved users:", error);
    }
  };

  const fetchFilteredUsers = async () => {
    try {
      const response = await UserService.searchUsers(searchQuery, roleFilter);
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching filtered users:', error);
    }
  };

  useEffect(() => {
    allUsers();
  }, []);

  useEffect(() => {
    fetchFilteredUsers();
  }, [searchQuery, roleFilter]);

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        {/* <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input type="text" id="table-search-users" className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users" />
          </div>
        </div> */}
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-4">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-40 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Coach">Coach</option>
              <option value="Manager">Manager</option>
              <option value="Parent">Parent</option>
            </select>
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Role</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.UserID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                  <div className="ps-3">
                    <div className="text-base font-semibold">{user.FirstName} {user.LastName}</div>
                    <div className="font-normal text-gray-500">{user.Email}</div>
                  </div>
                </th>
                <td className="px-6 py-4">{user.Role}</td>
                <td className="px-6 py-4">
                  <a href="#" onClick={() => openModal(user.UserID)} className="font-medium text-blue-500 hover:underline">Edit user</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && (
          <div id="editUserModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative w-full max-w-2xl max-h-full">
              <form onSubmit={handleSubmit} className="relative rounded-lg shadow bg-gray-700">
                <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                  <h3 className="text-xl font-semibold text-white">
                    Edit user
                  </h3>
                  <button type="button" onClick={closeModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-white">First Name</label>
                      <input type="text" name="FirstName" id="first-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.FirstName || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-white">Last Name</label>
                      <input type="text" name="LastName" id="last-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.LastName || ''} onChange={handleInputChange} required />
                    </div>
                    {/* <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">Username</label>
                      <input type="text" name="Username" id="username" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.Username || ''} onChange={handleInputChange} required />
                    </div> */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Email</label>
                      <input type="email" name="Email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.Email || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="role" className="block mb-2 text-sm font-medium text-white">Role</label>
                      <select name="Role" id="role" value={selectedUser.Role || ''} onChange={handleInputChange} className="block w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white">
                        <option value="Admin">Admin</option>
                        <option value="Coach">Coach</option>
                        <option value="Manager">Manager</option>
                        <option value="Parent">Parent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                  <button type="submit" onClick={saveChanges} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save changes</button>
                  <button type="button" onClick={closeModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListComponent;