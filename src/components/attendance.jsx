import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";

const UserListComponent = () => {
  const [selectedUser, setSelectedUser] = useState({});
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(null);
  const [ageCategories, setAgeCategories] = useState([]);

  const getAgeGroups = () => {
    /**
     * The AgeCategory field is used to filter the students based on their age.
     * This function will get the acceptable age category groups from the backend.
     */
    const response = {
        "data": [
          {name : "All Ages", value: ""},
          {name : "Under 11", value: "Under 11"},
          {name : "Under 13", value: "Under 13"},
          {name : "Under 15", value: "Under 15"},
          {name : "Under 17", value: "Under 17"},
          {name : "Under 19", value: "Under 19"},
        ],
        "request": {}
      };

      return response;
  }

  useEffect(() => {
    const response = getAgeGroups();
    setAgeCategories(response.data);
    console.log(response.data);
  }, []);

  const getStudentsData = () => { 
    /** the responce data should be fetched from the backend
     * The LastUpdate field is used to determine if the student attendance is already set or not for the current date.
     * if LastUpdate === "", then the student attendance is not set for the current date.
     * The AgeCategory field is used to filter the students based on their age.
     */
    const response = {
        "data": [
            {
              "UserID": 1000,
              "AdmisionNumber": "2364/5743",
              "LastUpdate": "",
              "LastUpdateBy": "",
              "LastUpdateAt": "",
              "AgeCategory": "Under 13",
              "FirstName": "Ann",
              "LastName": "Romanowski",
            }, 
            {
              "UserID": 1001,
              "AdmisionNumber": "2365/5744",
              "LastUpdate": "Present",
              "LastUpdateBy": "Doltan Palanda",
              "LastUpdateAt": "10:10 AM",
              "AgeCategory": "Under 13",
              "FirstName": "Nancy",
              "LastName": "Sicari",
            }, 
            {
              "UserID": 1002,
              "AdmisionNumber": "2365/5744",
              "LastUpdate": "Absent",
              "LastUpdateBy": "Doltan Palanda",
              "LastUpdateAt": "09:55 AM",
              "AgeCategory": "Under 17",
              "FirstName": "Jim",
              "LastName": "Pappa",
            },
            {
              "UserID": 1003,
              "AdmisionNumber": "2365/5744",
              "LastUpdateBy": "Doltan Palanda",
              "LastUpdateAt": "10:09 AM",
              "LastUpdate": "Present",
              "AgeCategory": "Under 11",
              "FirstName": "Vital",
              "LastName": "Statistix",
             }
        ],
        "request": {}
      };
      return response;
    }

  const getStudentsFiltered = () => {

    const response = getStudentsData();
      const filteredData = response.data.filter(user => {
        const matchesSearchQuery = searchQuery === "" || 
        user.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.LastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoleFilter = ageFilter === "" || user.AgeCategory === ageFilter;
        return matchesSearchQuery && matchesRoleFilter;
      });

      return { ...response, data: filteredData };
  }

  const openChangeModal = (user,isPresent) => {
    //console.log("openChangeModal INPUT student (", user.FirstName, user.LastName, ") => ", isPresent);
    /** Check if the last update is "", which means this is the first update for today */
    if(user.LastUpdate === "") {
        console.log("Set Attendance of", user.LastName,"to", isPresent);
        //call backend function setAttendance(user.UserID, isPresent);
        fetchFilteredUsers(); //load all user data.
    }
    else if(user.LastUpdate === isPresent) {
        console.log("Attendance already set to",isPresent, " for", user.LastName);
        fetchFilteredUsers(); //load all user data.
    }
    else {
        setSelectedUser(user);
        setIsPresent(isPresent);
        setIsChangeModalOpen(true);
    }
  };

  const closeChangeModal = () => {
    console.log("closeChangeModal");
    setIsChangeModalOpen(false);
    setSelectedUser(null);
    setIsPresent(null);
  };

  const handleChange = async () => {
    console.log("handleChange", selectedUser.FirstName, selectedUser.LastName, "set to Present = ", isPresent);
    try {
        //call backend function setAttendance(selectedUser.UserID, isPresent);
      closeChangeModal();
      fetchFilteredUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const fetchFilteredUsers = async () => {
    console.log("fetchFilteredUsers");
    try {
      //const response = await UserService.searchUsers(searchQuery, ageFilter);
      const response = getStudentsFiltered();
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    }
  };

  useEffect(() => {
    fetchFilteredUsers();
  }, [searchQuery, ageFilter]);

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
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
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block w-40 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
            >
              {ageCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Age Group</th>
              <th scope="col" className="py-3">Attendance</th>
              <th scope="col" className="px-6 py-3">Record</th>
              <th scope="col" className="px-6 py-3">Recorded at</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                  <div className="ps-3">
                    <div className="text-base font-semibold">
                      {user.FirstName} {user.LastName}
                    </div>
                    <div className="font-normal text-gray-500">
                      {user.Email}
                    </div>
                  </div>
                </th>
                <td className="px-6 py-4">{user.AgeCategory}</td>
                <td className="px-2 py-2 flex">
                  <div className="flex items-center">
                    <button type="button" onClick={() => openChangeModal(user,"Present")} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Present </button>
                  </div>
                  <div className="flex items-center">
                    <button type="button" onClick={() => openChangeModal(user,"Absent")} className="text-white bg-red-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Absent </button>
                  </div>
                </td>
                <td className="px-6 py-4">{user.LastUpdate}</td>
                <td className="px-6 py-4">{user.LastUpdateAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Change Modal */}
        {isChangeModalOpen && (
          <div
            id="Change-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button
                  type="button"
                  onClick={closeChangeModal}
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
                    Are you sure you want to mark attendance as <strong>{isPresent}</strong> for <strong> {selectedUser.FirstName}{" "}{selectedUser.LastName}</strong>?
                  </h3>
                  {/* Display User Name and Email */}
                  <div className="mb-4 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Marked as <strong> {selectedUser.LastUpdate} </strong> by <strong>{selectedUser.LastUpdateBy}</strong> at {selectedUser.LastUpdateAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleChange}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Yes, Change
                  </button>
                  <button
                    type="button"
                    onClick={closeChangeModal}
                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    No, cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListComponent;
