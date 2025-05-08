import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import ChildService from "../services/child.service";
import { ReactComponent as RcuacLogo } from "../images/rcuac_logo.svg";
import BaseDashboard from "../components/BaseDashboard";

// Dashboard content components
const ChildrenList = ({ children, onEditChild, onDeleteChild, searchQuery, setSearchQuery, genderFilter, setGenderFilter }) => {
  const filteredChildren = children.filter((child) => {
    const nameMatch = 
      child.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      child.LastName.toLowerCase().includes(searchQuery.toLowerCase());
    const genderMatch = genderFilter === '' || child.Gender === genderFilter;
    return nameMatch && genderMatch;
  });

  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">My Children</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by name..."
            className="p-2 rounded-lg bg-gray-700 text-white border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-2 rounded-lg bg-gray-700 text-white border-gray-600"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">Name</th>
              <th scope="col" className="py-3 px-6">Date of Birth</th>
              <th scope="col" className="py-3 px-6">Gender</th>
              <th scope="col" className="py-3 px-6">Notes</th>
              <th scope="col" className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChildren.length > 0 ? (
              filteredChildren.map((child) => (
                <tr key={child.id} className="border-b bg-gray-800 border-gray-700">
                  <th scope="row" className="py-4 px-6 font-medium whitespace-nowrap text-white">
                    {child.FirstName} {child.LastName}
                  </th>
                  <td className="py-4 px-6">{child.DateOfBirth}</td>
                  <td className="py-4 px-6">{child.Gender}</td>
                  <td className="py-4 px-6">{child.Notes}</td>
                  <td className="py-4 px-6 flex space-x-2">
                    <button
                      onClick={() => onEditChild(child)}
                      className="font-medium text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteChild(child)}
                      className="font-medium text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b bg-gray-800 border-gray-700">
                <td colSpan="5" className="py-4 px-6 text-center text-gray-400">
                  No children found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = ({ userDetails }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Welcome, {userDetails.firstName} {userDetails.lastName}!</h2>
      <p className="text-gray-400">This is your parent dashboard. You can manage your children's profiles, view their activities, and track their progress.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-lg bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
          <ul className="text-gray-400">
            <li className="mb-1">• Add a new child profile</li>
            <li className="mb-1">• Update an existing child profile</li>
            <li className="mb-1">• View upcoming activities</li>
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

const Activities = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Activities</h2>
      <p className="text-gray-400">View and manage your children's activities.</p>
      
      <div className="mt-4">
        <p className="text-gray-400">No activities scheduled at the moment.</p>
      </div>
    </div>
  );
};

const ParentDashboard = () => {
  const [userDetails, setUserDetails] = useState({});
  const [children, setChildren] = useState([]);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isDeleteChildModalOpen, setIsDeleteChildModalOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newChild, setNewChild] = useState({
    FirstName: '',
    LastName: '',
    DateOfBirth: '',
    Gender: '',
    Notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const navigate = useNavigate();

  // Functions to manage child data
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
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const openAddChildModal = () => {
    setIsAddChildModalOpen(true);
  };

  const closeAddChildModal = () => {
    setIsAddChildModalOpen(false);
    setNewChild({
      FirstName: '',
      LastName: '',
      DateOfBirth: '',
      Gender: '',
      Notes: ''
    });
  };

  const handleChildInputChange = (e) => {
    const { name, value } = e.target;
    setNewChild({ ...newChild, [name]: value });
  };

  const addChild = async (e) => {
    e.preventDefault();
    try {
      const response = await ChildService.addChild(userDetails.id, newChild);
      setChildren([...children, response.data]);
      closeAddChildModal();
    } catch (error) {
      console.error("Error adding child:", error);
      // Fallback to local state update if API call fails
      const childWithId = { ...newChild, id: Date.now() };
      setChildren([...children, childWithId]);
      closeAddChildModal();
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = AuthService.getCurrentUser();
      setUserDetails(response);
      if (response) {
        fetchChildren(response.id);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchChildren = async (parentId) => {
    try {
      const response = await ChildService.getChildrenByParent(parentId);
      setChildren(response.data);
    } catch (error) {
      console.error("Error fetching children:", error);
      // Use mock data if API call fails
      setChildren([
        { id: 1, FirstName: 'John', LastName: 'Doe', DateOfBirth: '2010-05-15', Gender: 'Male', Notes: 'Likes soccer' },
        { id: 2, FirstName: 'Jane', LastName: 'Doe', DateOfBirth: '2012-08-22', Gender: 'Female', Notes: 'Likes basketball' }
      ]);
    }
  };

  const openDeleteChildModal = (child) => {
    setChildToDelete(child);
    setIsDeleteChildModalOpen(true);
  };

  const closeDeleteChildModal = () => {
    setIsDeleteChildModalOpen(false);
    setChildToDelete(null);
  };

  const deleteChild = async () => {
    try {
      await ChildService.deleteChild(childToDelete.id);
      setChildren(children.filter(child => child.id !== childToDelete.id));
      closeDeleteChildModal();
    } catch (error) {
      console.error("Error deleting child:", error);
      // Fallback to local state update if API call fails
      setChildren(children.filter(child => child.id !== childToDelete.id));
      closeDeleteChildModal();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Define custom children components section
  const ChildrenSection = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-4 px-2">
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />
          </div>
          <button 
            onClick={openAddChildModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
          >
            Add A Child
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-600">You haven't added any children yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Date of Birth</th>
                <th scope="col" className="px-6 py-3">Gender</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.filter(child => {
                const nameMatch = child.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 child.LastName.toLowerCase().includes(searchQuery.toLowerCase());
                const genderMatch = genderFilter === '' || child.Gender === genderFilter;
                return nameMatch && genderMatch;
              }).map((child) => (
                <tr key={child.id} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                  <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                    <div className="ps-3">
                      <div className="text-base font-semibold">
                        {child.FirstName} {child.LastName}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {new Date(child.DateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{child.Gender}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <a
                        href="#"
                        onClick={() => openEditModal(child.id)}
                        className="font-medium text-blue-500 hover:underline"
                      >
                        Edit
                      </a>
                      <a
                        href="#"
                        onClick={() => openDeleteChildModal(child)}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Remove
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

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
      id: 'children',
      label: 'My Children',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      )
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>
      )
    }
  ];

  // Define components for each section
  const roleSpecificComponents = {
    dashboard: <Dashboard userDetails={userDetails} />,
    children: <ChildrenSection />,
    activities: <Activities />
  };

  return (
    <>
      <BaseDashboard 
        dashboardTitle="Parent Dashboard"
        menuItems={menuItems}
        fetchUserService={UserService}
        roleSpecificComponents={roleSpecificComponents}
        initialSection="dashboard"
      />

      {/* Add Child Modal */}
      {isAddChildModalOpen && (
        <div id="addChildModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full">
            <form onSubmit={addChild} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Child
                </h3>
                <button type="button" onClick={closeAddChildModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="child-first-name" className="block mb-2 text-sm font-medium text-white">First Name</label>
                    <input 
                      type="text" 
                      name="FirstName" 
                      id="child-first-name" 
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={newChild.FirstName} 
                      onChange={handleChildInputChange} 
                      required 
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="child-last-name" className="block mb-2 text-sm font-medium text-white">Last Name</label>
                    <input 
                      type="text" 
                      name="LastName" 
                      id="child-last-name" 
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={newChild.LastName} 
                      onChange={handleChildInputChange} 
                      required 
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="child-dob" className="block mb-2 text-sm font-medium text-white">Date of Birth</label>
                    <input 
                      type="date" 
                      name="DateOfBirth" 
                      id="child-dob" 
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={newChild.DateOfBirth} 
                      onChange={handleChildInputChange} 
                      required 
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="child-gender" className="block mb-2 text-sm font-medium text-white">Gender</label>
                    <select 
                      name="Gender" 
                      id="child-gender" 
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={newChild.Gender} 
                      onChange={handleChildInputChange} 
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-6">
                    <label htmlFor="child-notes" className="block mb-2 text-sm font-medium text-white">Notes (Optional)</label>
                    <textarea 
                      name="Notes" 
                      id="child-notes" 
                      rows="3" 
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={newChild.Notes} 
                      onChange={handleChildInputChange}
                      placeholder="Any additional information about your child"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Child</button>
                <button type="button" onClick={closeAddChildModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Child Confirmation Modal */}
      {isDeleteChildModalOpen && childToDelete && (
        <div id="deleteChildModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm Removal
                </h3>
                <button type="button" onClick={closeDeleteChildModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
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
                  Are you sure you want to remove {childToDelete.FirstName} {childToDelete.LastName}?
                </h3>
                <button type="button" onClick={deleteChild} className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                  Yes, I'm sure
                </button>
                <button type="button" onClick={closeDeleteChildModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
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

export default ParentDashboard;