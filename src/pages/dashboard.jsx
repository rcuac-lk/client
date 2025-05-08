import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import UserListComponent from "../components/userList";
import PendingApprovalsComponent from "../components/pendingApprovals";
import Attendance from "../components/attendance";
import Timing from "../components/timing";
import { ReactComponent as RcuacLogo } from "../images/rcuac_logo.svg";
import BaseDashboard from "../components/BaseDashboard";

// Dashboard content components
const DashboardHome = ({ userDetails }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Welcome, {userDetails.firstName} {userDetails.lastName}!</h2>
      <p className="text-gray-400">This is the RCUAC dashboard. Your role is: {userDetails.roles}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-lg bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
          <ul className="text-gray-400">
            <li className="mb-1">• View user information</li>
            <li className="mb-1">• Check activities</li>
            <li className="mb-1">• Update your profile</li>
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
      <UserListComponent />
    </div>
  );
};

const Approvals = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Pending Approvals</h2>
      <PendingApprovalsComponent />
    </div>
  );
};

const AttendanceTracker = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Attendance</h2>
      <Attendance />
    </div>
  );
};

const TimingTracker = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Timing</h2>
      <Timing />
    </div>
  );
};

const Dashboard = () => {
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
    dashboard: <DashboardHome userDetails={userDetails} />,
    users: <Users />,
    approvals: <Approvals />,
    attendance: <AttendanceTracker />,
    timing: <TimingTracker />
  };

  return (
    <BaseDashboard 
      dashboardTitle="RCUAC Dashboard"
      menuItems={menuItems}
      fetchUserService={UserService}
      roleSpecificComponents={roleSpecificComponents}
      initialSection="dashboard"
    />
  );
};

export default Dashboard;
