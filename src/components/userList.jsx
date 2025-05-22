import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";
import ManagerService from "../services/manager.service";
import CoachService from "../services/coach.service";

const UserListComponent = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const userRole = props.role;
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
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
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

  const openConfirmModal = (user) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
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
    }
  };

  const handleApprove = async () => {
    try {
      if (isAdmin) {
        await UserService.approveUser(selectedUser.UserID);
      } else if (isManager) {
        await ManagerService.approveUser(selectedUser.UserID);
      } else if (isCoach) {
        await CoachService.approveUser(selectedUser.UserID);
      }
      closeConfirmModal();
      allUsers();
    } catch (error) {
      console.error("Error approving user:", error);
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
      await allUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const saveChanges = async (e) => {
    if (e) e.preventDefault();
    try {
      await UserService.updateUser(selectedUser.UserID, selectedUser);
      setIsModalOpen(false);
      allUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const allUsers = async () => {
    try {
      let approvedResponse = "";
      let unapprovedResponse = "";
      if (isAdmin) {
        approvedResponse = await UserService.approvedUsers();
        unapprovedResponse = await UserService.notApprovedUsers();
      } else if (isManager) {
        approvedResponse = await ManagerService.approvedUsers();
        unapprovedResponse = await ManagerService.notApprovedUsers();
      } else if (isCoach) {
        approvedResponse = await CoachService.approvedUsers();
        unapprovedResponse = await CoachService.notApprovedUsers();
      }
      
      // Combine approved and unapproved users
      const approvedUsers = approvedResponse.data.map(user => ({ ...user, IsApproved: true }));
      const unapprovedUsers = unapprovedResponse.data.map(user => ({ ...user, IsApproved: false }));
      setUsers([...approvedUsers, ...unapprovedUsers]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchFilteredUsers = async () => {
    try {
      let response = "";
      if (isAdmin) {
        response = await UserService.searchUsers(searchQuery, roleFilter);
      } else if (isManager) {
        response = await ManagerService.searchUsers(searchQuery, roleFilter);
      } else if (isCoach) {
        response = await CoachService.searchUsers(searchQuery, roleFilter);
      }
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    }
  };

  useEffect(() => {
    allUsers();
  }, [isAdmin, isManager, isCoach]);

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
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">NAME</th>
              <th scope="col" className="px-6 py-3">ROLE</th>
              <th scope="col" className="px-6 py-3">ACTION</th>
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
                  <div className="flex flex-row gap-x-2">
                    <button
                      type="button"
                      onClick={() => openModal(user.UserID)}
                      className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                    >
                      Edit User
                    </button>
                    <button
                      type="button"
                      onClick={() => openConfirmModal(user)}
                      disabled={user.IsApproved}
                      className={`font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none ${
                        user.IsApproved
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
                      }`}
                    >
                      {user.IsApproved ? 'Approved' : 'Approve'}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openRejectModal(user)}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Remove User
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reject Modal */}
        {isAdmin && isRejectModalOpen && (
          <div
            id="reject-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to remove this user?
                  </h3>
                  {/* Display User Name and Email */}
                  <div className="mb-4 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Name:</strong> {selectedUser.FirstName}{" "}
                      {selectedUser.LastName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Email:</strong> {selectedUser.Email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div
            id="confirm-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to approve this user?
                  </h3>
                  <div className="mb-4 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Name:</strong> {selectedUser.FirstName}{" "}
                      {selectedUser.LastName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Email:</strong> {selectedUser.Email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  >
                    Yes, approve
                  </button>
                  <button
                    type="button"
                    onClick={closeConfirmModal}
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div
            id="editUserModal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div className="relative w-full max-w-2xl max-h-full">
              <form
                onSubmit={saveChanges}
                className="relative rounded-lg shadow bg-gray-700"
              >
                <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                  <h3 className="text-xl font-semibold text-white">
                    Edit user
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="first-name"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="FirstName"
                        id="first-name"
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedUser.FirstName || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="last-name"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="LastName"
                        id="last-name"
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedUser.LastName || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">Username</label>
                      <input type="text" name="Username" id="username" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.Username || ''} onChange={handleInputChange} required />
                    </div> */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="Email"
                        id="email"
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedUser.Email || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="role"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Role
                      </label>
                      {isAdmin && (
                        <select
                        name="Role"
                        id="role"
                        value={selectedUser.Role || ""}
                        onChange={handleInputChange}
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Coach">Coach</option>
                        <option value="Manager">Manager</option>
                        <option value="Parent">Parent</option>
                      </select>
                      )}
                      {!isAdmin && (
                        <select
                        name="Role"
                        id="role"
                        disabled
                        value={selectedUser.Role || ""}
                        onChange={handleInputChange}
                        className="block w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Coach">Coach</option>
                        <option value="Manager">Manager</option>
                        <option value="Parent">Parent</option>
                      </select>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Cancel
                  </button>
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
