import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import BaseDashboard from "../components/BaseDashboard";
import UserListComponent from "../components/userList";
import PendingApprovalsComponent from "../components/pendingApprovals";
import Attendance from "../components/attendance";
import Timing from "../components/timing";
import { ReactComponent as RcuacLogo } from "../images/rcuac_logo.svg";

// Dashboard content components
const Dashboard = ({ userDetails }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Welcome, Manager {userDetails.firstName} {userDetails.lastName}!</h2>
      <p className="text-gray-400">This is your manager dashboard. You can manage users, approve registrations, and oversee club activities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-lg bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
          <ul className="text-gray-400">
            <li className="mb-1">• View pending approvals</li>
            <li className="mb-1">• Manage users</li>
            <li className="mb-1">• View attendance reports</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Activities</h3>
          <p className="text-gray-400">No recent activities to display.</p>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
      <UserListComponent role="Manager" />
    </div>
  );
};

const Approvals = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Pending Approvals</h2>
      <PendingApprovalsComponent role="Manager" />
    </div>
  );
};

const AttendanceReports = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Attendance Reports</h2>
      <Attendance />
    </div>
  );
};

const TimingReports = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Timing Reports</h2>
      <Timing />
    </div>
  );
};

const ManagerDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState(null);

  const openEditModal = async (id) => {
    try {
        const response = await UserService.getUser(id);
        setSelectedUser(response.data);
        setIsEditModalOpen(true);
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
};

const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
};
  
const saveChanges = async () => {
  try {
    await UserService.updateUser(selectedUser.UserID, selectedUser);
    setIsEditModalOpen(false);
    // notApprovedUsers(); // Refresh the user list after update
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setSelectedUser({ ...selectedUser, [name]: value });
};

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (section) => {
    setSelectedSection(section);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!isUserMenuOpen);
  };

  const logoutHandler = async (event) => {
    event.preventDefault();
    try{
        AuthService.logout();
        navigate('/');
    } catch (error) {
        console.log(error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = AuthService.getCurrentUser();
      setUserDetails(response);
      setRole(response.roles);
      console.log('User Details:', response);
      if (!response) { 
        setIsUnauthorized(true);
        navigate('/login');
      }
      setLoading(false);
    } catch (error) {
      if (error.response) {
        setIsUnauthorized(true);
        navigate('/login');
      } else {
        console.error("Error fetching user details:", error);
      }
      setLoading(false);
    }
  };

  // const notApprovedUsers = async () => {
  //   try {
  //     const response = await UserService.notApprovedUsers();
  //     console.log('Not Approved Users:', response.data[0]);
  //   } catch (error) {
  //     console.error("Error fetching not approved users:", error);
  //   }
  // };

  useEffect(() => {

    fetchUserDetails();
    // notApprovedUsers();

    const handleOutsideClick = (event) => {
      if (
        isUserMenuOpen &&
        !document.getElementById("dropdown-user").contains(event.target) &&
        !document
          .querySelector('[data-dropdown-toggle="dropdown-user"]')
          .contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isUserMenuOpen]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isUnauthorized) {
    navigate('/login');
    return null;
  }

  // Define menu items for the sidebar
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
        </svg>
      )
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      )
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      )
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>
      )
    },
    {
      id: 'timing',
      label: 'Timing',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
        </svg>
      )
    }
  ];

  // Define components for each section
  const roleSpecificComponents = {
    dashboard: <Dashboard userDetails={userDetails} />,
    users: <Users />,
    approvals: <Approvals />,
    attendance: <AttendanceReports />,
    timing: <TimingReports />
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b bg-dark-blue border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                onClick={toggleSidebar}
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm rounded-lg sm:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
              <RcuacLogo className="w-[45px] h-[50px]" />
            </div>
            <div className="relative flex items-center ms-3">
              <div>
                <button
                  type="button"
                  onClick={toggleUserMenu}
                  className="flex text-sm bg-dark-blue rounded-full focus:ring-4 focus:ring-gray-600"
                  aria-expanded={isUserMenuOpen}
                  data-dropdown-toggle="dropdown-user"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                    alt="user photo"
                  />
                </button>
              </div>
              {isUserMenuOpen && (
                <div
                  className="absolute z-50 w-48 py-2 mt-2 origin-top-right divide-y rounded shadow-lg bg-gray-700 divide-gray-600"
                  id="dropdown-user"
                  style={{ top: "100%", right: "0" }}
                >
                  <div className="px-4 py-3" role="none">
                  <p
                      className="text-sm font-medium truncate text-gray-300"
                      role="none"
                    >
                      {userDetails.roles}
                    </p>
                    <p
                      className="text-sm text-white"
                      role="none"
                    >
                      {userDetails.firstName} {userDetails.lastName}
                    </p>
                    <p
                      className="text-sm font-medium truncate text-gray-300"
                      role="none"
                    >
                      {userDetails.email}
                    </p>
                  </div>
                  <ul className="py-1" role="none">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                        role="menuitem"
                        onClick={() => openEditModal(userDetails.id)}
                      >
                        Profile
                      </a>
                    </li>
                    <li>
                      <a onClick={logoutHandler}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                        role="menuitem"
                      >
                        Sign out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform border-r bg-dark-blue border-gray-700 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-dark-blue">
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="#"
                onClick={() => handleMenuClick('dashboard')}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleMenuClick('userList')}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">User List</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleMenuClick('pendingApprovals')}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Pending Approvals</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleMenuClick('attendance')}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Attendance</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleMenuClick('timing')}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Timing</span>
              </a>
            </li>
            {/* Other items here */}

          </ul>
          <div className="mt-auto">
            <ul className="space-y-2 font-medium">
              <li className="fixed bottom-0 left-0 w-full">
                <a onClick={logoutHandler}
                  href="#"
                  className="flex items-center p-4 border-t text-white bg-dark-blue border-gray-700 hover:bg-gray-700 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 transition duration-75 text-gray-400 group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                    />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Log Out</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="p-4 sm:ml-64">
        <div className="overflow-hidden min-h-screen flex flex-col">
          {selectedSection === 'dashboard' && (
            <>
              <div className="flex flex-col items-center mx-auto justify-center m-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <div className="mt-4">
                <p className="text-gray-900">Welcome to RCUAC Manager Dashboard</p>
              </div>
              </div>
            </>
          )}
          {selectedSection === 'userList' && (
            <UserListComponent role={role} /> // Replace with actual User List component or content
          )}
          {selectedSection === 'pendingApprovals' && (
            <PendingApprovalsComponent role={role} /> // Replace with actual Pending Approvals component or content
          )}
          {selectedSection === 'attendance' && (
            <Attendance />
          )}
          {selectedSection === 'timing' && (
            <Timing />
          )}
        </div>
      </div>

      {isEditModalOpen && (
                    <div id="editUserModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                        <div className="relative w-full max-w-2xl max-h-full">
                            <form className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Edit Profile
                                    </h3>
                                    <button type="button" onClick={closeEditModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
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
                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Email</label>
                                            <input type="email" name="Email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedUser.Email || ''} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="role" className="block mb-2 text-sm font-medium text-white">Role</label>
                                            <select name="Role" id="role" value={selectedUser.Role || ''} disabled onChange={handleInputChange} className="block w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white">
                                                <option value="Admin">Admin</option>
                                                <option value="Coach">Coach</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Parent">Parent</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                    <button type="submit" onClick={saveChanges} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save changes</button>
                                    <button type="button" onClick={closeEditModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
    </>
  );
};

export default ManagerDashboard;