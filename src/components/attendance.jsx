import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

const UserListComponent = () => {
  /** varianbles*/
  const [selectedUser, setSelectedUser] = useState({}); // To store the selected user's data
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(null);
  const [ageCategories, setAgeCategories] = useState([]);
  const [sessionFilter, setSessionFilter] = useState("");
  const [customSession, setCustomSession] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionSuggestions, setSessionSuggestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [customDate, setCustomDate] = useState("");
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  /** functions */
  const getAgeGroups = async() => {
    const response = await UserService.ageGroups();
    console.log("Age Groups", response.data);
    setAgeCategories(response.data.data);
  }

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCustomDate(today);
  }, []);

  const getSessionData = async() => { 
    const response = await UserService.getSessionData();
    console.log("Session Data", response.data);
    setSessions(response.data.sessions);
  
    if (response.data && response.data.length > 0) {
      setSessionFilter(response.data[0].SessionName);
      setCustomSession(response.data[0].SessionName);
      setCustomDate(response.data[0].SessionDate);
    }
  }

  const getStudentsData = async (date) => {
    const response = await UserService.getAttendancedata(date);
    setStudents(response.data.attendanceData);
    console.log(response.data)
    return response;
  };

  const getStudentsFiltered = (date,session) => {
    /** Filter the student data using the user selection. We will use searchQuery and ageFilter*/
    const response = getStudentsData(date,session);
      const filteredData = response.data.filter(student => {
        const matchesSearchQuery = searchQuery === "" || 
        student.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.LastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoleFilter = ageFilter === "" || student.AgeCategory === ageFilter;
        return matchesSearchQuery && matchesRoleFilter;
      });
      return { ...response, data: filteredData };
  }

  const openChangeModal = (student,isPresent) => {
    /** Check the change request, (which button was pressed) and open the Attandance 
     * Change dialog box if the student is not already marked as present or absent.
     * The LastUpdate variable halds the status if the student was atleast marked once today*/
    if(student.LastUpdate === "") {
      const response = AuthService.getCurrentUser();
      const data = {
        memberId: student.UserID,
        date: customDate,
        present: isPresent,
        markedBy: response.id
      };
      UserService.markAttendance(data);
      getStudentsData();
    }
    else if(student.LastUpdate === isPresent) {
        console.log("[UE7002]Attendance already set to [" + isPresent, "] for [" + student.LastName + "] on [" + customDate + "] for [" + customSession + "]");
        fetchFilteredStudents(); //load all student data.
    }
    else {
        /** Open the dialogbox to get the change */
        setSelectedUser(student);
        setIsPresent(isPresent);
        setIsChangeModalOpen(true);
    }
  };

  const closeChangeModal = () => {
    setIsChangeModalOpen(false);
    setSelectedUser(null);
    setIsPresent(null);
  };

  const handleChange = async () => {
    console.log("[UE7003] handleChange [" + selectedUser.FirstName + " " + selectedUser.LastName, "] set to Present [" + isPresent + "] on [" + customDate + "] for [" + customSession + "]");
    try {
        /**call backend function setAttendance(selectedUser.UserID, isPresent); */
      closeChangeModal();
      fetchFilteredStudents();
    } catch (error) {
      console.error("[UE7004] Error Change Attendande :", error);
    }
  };

  const fetchFilteredStudents = async () => {
    console.log("[AT7005] call fetchFilteredStudents ()");
    try {
      /** const response = await UserService.searchUsers(searchQuery, ageFilter); */
      const response = getStudentsFiltered(customDate,customSession);
      //console.log(response.data);
      setStudents(response.data);
    } catch (error) {
      console.error("[AT7006] Error fetching filtered Students :", error);
    }
  };

  /** load the student data */
  useEffect(() => {
    fetchFilteredStudents();
  }, [searchQuery, ageFilter, customDate, customSession]);

  /** load the age categories */
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        await getAgeGroups();
        await getSessionData();
      } catch (error) {
        console.error("Error loading static data:", error);
      }
    };
  
    fetchStaticData();
  }, []);

  // Update customSession when sessionFilter changes
  useEffect(() => {
    setCustomSession(sessionFilter);
    console.log("[AT7008] Session Filter [" + sessionFilter + '][' + customSession + ']');
  }, [sessionFilter]);

  const createNewSession = (sessionName, date) => {
    console.log("[AT7009] Creating new session:", sessionName, "for date:", date);
    // TODO: Call backend API to create new session
    // After successful creation, refresh the sessions list
    const newSession = {
      SessionID: Date.now(), // Temporary ID for demo
      SessionName: sessionName,
      SessionDate: date,
      SessionTime: "12:00 PM", // Default time
      SessionLocation: "TBD",
      SessionDescription: "New Session"
    };
    setSessions([...sessions, newSession]);
    setCustomSession(sessionName);
    setSessionFilter(sessionName);
    setShowNewSessionDialog(false);
  };

  const handleNewSessionConfirm = () => {
    createNewSession(newSessionName, customDate);
  };

  const handleNewSessionCancel = () => {
    setShowNewSessionDialog(false);
    setCustomSession(sessionFilter); // Reset to previously selected session
  };

  /** Add this new function near the other modal-related functions */
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      handleNewSessionCancel();
    }
  };

  useEffect(() => {
    if (showNewSessionDialog) {
      // Add event listener for escape key
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showNewSessionDialog]);

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
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />
            {/* Role Filter */}
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {ageCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2 px-2 py-4">
            {/* Custom Session */}
            <div className="relative">
              <input
                type="text"
                value={customSession}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setCustomSession(newValue);
                  // Filter sessions based on input
                  const filteredSessions = sessions.filter(session =>
                    session.SessionName.toLowerCase().includes(newValue.toLowerCase())
                  );
                  setSessionSuggestions(filteredSessions);
                  setShowSuggestions(filteredSessions.length > 0 && newValue !== "");
                }}
                onBlur={(e) => {
                  // Immediately hide suggestions
                  setShowSuggestions(false);
                  
                  // Check if entered session exists
                  const sessionExists = sessions.some(
                    session => session.SessionName.toLowerCase() === e.target.value.toLowerCase()
                  );
                  
                  // Only show dialog if there's a value and it doesn't exist
                  if (!sessionExists && e.target.value.trim() !== "") {
                    setNewSessionName(e.target.value);
                    setShowNewSessionDialog(true);
                  }
                }}
                className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={sessionFilter}
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                  {sessionSuggestions.map((session) => (
                    <div
                      key={session.SessionID}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                      onClick={() => {
                        setCustomSession(session.SessionName);
                        setShowSuggestions(false);
                      }}
                    >
                      {session.SessionName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Session Filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {sessions.map((session) => (
                <option key={session.SessionID} value={session.SessionName}>
                  {session.SessionName}
                </option>
              ))}
            </select>
            {/* Session date */}
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
            {students.map((student) => (
              <tr key={student.UserID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                  <div className="ps-3">
                    <div className="text-base font-semibold">
                      {student.FirstName} {student.LastName}
                    </div>
                  </div>
                </th>
                <td className="px-6 py-4">{student.AgeCategory}</td>
                <td className="px-2 py-2 flex">
                  <div className="flex items-center">
                    <button type="button" onClick={() => openChangeModal(student,"Present")} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Present </button>
                  </div>
                  <div className="flex items-center">
                    <button type="button" onClick={() => openChangeModal(student,"Absent")} className="text-white bg-red-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Absent </button>
                  </div>
                </td>
                <td className="px-6 py-4">{student.LastUpdate}</td>
                <td className="px-6 py-4">{student.LastUpdateAt}</td>
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
                    Are you sure you want to change the attendance of <strong> {selectedUser.FirstName}{" "}{selectedUser.LastName}</strong> to <strong>{isPresent}</strong>?
                  </h3>
                  {/* Display current marked data */}
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

        {/* New Session Confirmation Modal */}
        {showNewSessionDialog && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleNewSessionCancel}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4">
              <div 
                className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left shadow-xl transition-all"
                role="alertdialog"
                aria-describedby="modal-description"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={handleNewSessionCancel}
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  aria-label="Close modal"
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
                </button>

                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <h3 
                    id="modal-title"
                    className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
                  >
                    Would you like to create a new session "<strong>{newSessionName}</strong>" for <strong>{customDate}</strong>?
                  </h3>
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={handleNewSessionConfirm}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      autoFocus
                    >
                      Yes, Create Session
                    </button>
                    <button
                      type="button"
                      onClick={handleNewSessionCancel}
                      className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                      No, Cancel
                    </button>
                  </div>
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
