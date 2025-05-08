import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import { ReactComponent as RcuacLogo } from "../images/rcuac_logo.svg";

const BaseDashboard = ({ 
  children, 
  dashboardTitle = "Dashboard",
  menuItems = [],
  fetchUserService,
  roleSpecificComponents = {},
  initialSection = 'dashboard'
}) => {
  // Common state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Common functions
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
    try {
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
  
  // Common modal handlers
  const openEditModal = async (id) => {
    try {
      if (fetchUserService) {
        const response = await fetchUserService.getUser(id);
        setSelectedUser(response.data);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  useEffect(() => {
    fetchUserDetails();

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

  // Render the main dashboard content based on selected section
  const renderContent = () => {
    if (roleSpecificComponents[selectedSection]) {
      return roleSpecificComponents[selectedSection];
    }
    
    // Default dashboard content if no specific component is provided
    return (
      <div className="p-4 rounded-lg bg-gray-800 mt-4">
        <div className="text-2xl text-white mb-4">{dashboardTitle} Overview</div>
        <div className="text-gray-400">
          Select an option from the sidebar to get started.
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Navigation bar */}
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

      {/* Sidebar */}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform border-r bg-dark-blue border-gray-700 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-dark-blue">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                    selectedSection === item.id
                      ? "bg-gray-700 text-white"
                      : "text-gray-300"
                  }`}
                >
                  {item.icon}
                  <span className="ms-3">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div className="p-4 sm:ml-64 pt-20">
        {renderContent()}
        {children}
      </div>
      
      {/* Any additional elements passed by the child components */}
    </>
  );
};

export default BaseDashboard; 