import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";
import ManagerService from "../services/manager.service";
import CoachService from "../services/coach.service";

const UserListComponent = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const userRole = props.role || ""; // Provide a default value
  const isAdmin = userRole === "Admin";
  const isManager = userRole === "Manager";
  const isCoach = userRole === "Coach";

  const openModal = async (id) => {
    try {
      let response = "";
      if (isAdmin) {
        response = await UserService.getUser(id);
        setSelectedUser(response.data);
        setIsModalOpen(true);
      } else if (isManager) {
        response = await ManagerService.getUser(id);
        setSelectedUser(response.data);
        setIsModalOpen(true);
      } else if (isCoach) {
        response = await CoachService.getUser(id);
        setSelectedUser(response.data);
        setIsModalOpen(true);
      } else {
        // Default to UserService if no role is specified
        response = await UserService.getUser(id);
        setSelectedUser(response.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser({});
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedUser(null);
  };

  const handleReject = async () => {
    try {
      if (isAdmin) {
        await UserService.rejectUser(selectedUser.UserID);
      } else if (isManager) {
        await ManagerService.rejectUser(selectedUser.UserID);
      } else if (isCoach) {
        await CoachService.rejectUser(selectedUser.UserID);
      }
      closeRejectModal();
      allUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setError("Failed to reject user");
    }
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
      allUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user");
    }
  };

  const saveChanges = async () => {
    try {
      await UserService.updateUser(selectedUser.UserID, selectedUser);
      console.log(selectedUser);
      setIsModalOpen(false);
      allUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to save changes");
    }
  };

  const allUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let response = "";
      if (isAdmin) {
        response = await UserService.approvedUsers();
        setUsers(response.data || []);
      } else if (isManager) {
        response = await ManagerService.approvedUsers();
        setUsers(response.data || []);
      } else if (isCoach) {
        response = await CoachService.approvedUsers();
        setUsers(response.data || []);
      } else {
        // Default to UserService if no role is specified
        response = await UserService.approvedUsers();
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching approved users:", error);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredUsers = async () => {
    if (!searchQuery && !roleFilter) {
      return allUsers();
    }
    
    setLoading(true);
    setError(null);
    try {
      let response = "";
      if (isAdmin) {
        response = await UserService.searchUsers(searchQuery, roleFilter);
      } else if (isManager) {
        response = await ManagerService.searchUsers(searchQuery, roleFilter);
      } else if (isCoach) {
        response = await CoachService.searchUsers(searchQuery, roleFilter);
      } else {
        // Default to UserService if no role is specified
        response = await UserService.searchUsers(searchQuery, roleFilter);
      }
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
      setError("Failed to filter users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allUsers();
  }, [isAdmin, isManager, isCoach]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, roleFilter]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={allUsers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-4 px-2">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />

            {/* Role Filter */}
            {isAdmin && (
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
            )}
            {isManager && (
              <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-40 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="Coach">Coach</option>
              <option value="Manager">Manager</option>
              <option value="Parent">Parent</option>
            </select>
            )}
          </div>
        </div>
        
        {users && users.length > 0 ? (
          <table className="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
                {isAdmin && <th scope="col" className="px-6 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.UserID}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 whitespace-nowrap text-white"
                  >
                    <div className="ps-3">
                      <div className="text-base font-semibold">
                        {user.FirstName} {user.LastName}
                      </div>
                      <div className="font-normal text-gray-500">
                        {user.Email}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">{user.Role}</td>
                  <td className="px-6 py-4">
                    <a
                      href="#"
                      onClick={() => openModal(user.UserID)}
                      className="font-medium text-blue-500 hover:underline"
                    >
                      Edit user
                    </a>
                  </td>
                  {isAdmin && (
                    <td className="py-4">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => openRejectModal(user)}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      >
                        Remove User
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400 bg-gray-800">
            <p>No users found. {searchQuery || roleFilter ? "Try adjusting your filters." : ""}</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isModalOpen && selectedUser && (
        <div id="editUserModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full">
              <form className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
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
                              <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                              <input type="text" name="FirstName" id="first-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.FirstName || ''} onChange={handleInputChange} required />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                              <input type="text" name="LastName" id="last-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.LastName || ''} onChange={handleInputChange} required />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                              <input type="email" name="Email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.Email || ''} onChange={handleInputChange} required />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                              <select name="Role" id="role" value={selectedUser.Role || ''} onChange={handleInputChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                  <option value="Admin">Admin</option>
                                  <option value="Coach">Coach</option>
                                  <option value="Manager">Manager</option>
                                  <option value="Parent">Parent</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                      <button type="button" onClick={saveChanges} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save all</button>
                      <button type="button" onClick={closeModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
                  </div>
              </form>
          </div>
        </div>
      )}

      {/* Reject User Modal */}
      {isRejectModalOpen && selectedUser && (
        <div id="rejectUserModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm Rejection
                </h3>
                <button type="button" onClick={closeRejectModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to reject and delete {selectedUser.FirstName} {selectedUser.LastName}?
                </h3>
                <button type="button" onClick={handleReject} className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                  Yes, I'm sure
                </button>
                <button type="button" onClick={closeRejectModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListComponent;
