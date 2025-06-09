import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

const UserListComponent = () => {
  const [selectedUser, setSelectedUser] = useState({});
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
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

  const getAgeGroups = async() => {
    const response = await UserService.ageGroups();
    console.log("Age Groups", response.data);
    setAgeCategories(response.data.data);
  }

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setCustomDate(`${year}-${month}-${day}`);
  }, []);

  const getSessionData = async() => { 
    const response = await UserService.getSessionData();
    setSessions(response.data.sessions);
    if (response.data && response.data.sessions.length > 0) {
      setSessionFilter(response.data.sessions[0].SessionID);
      setCustomSession(response.data.sessions[0].SessionName);
    }
  }

  const getStudentsData = async (date, sessionId, ageFilter) => {
    const response = await UserService.getAttendancedata(date, sessionId, ageFilter);
    const studentData = response.data.attendanceData;
    setStudents(studentData);
    setFilteredStudents(studentData);
    if (searchQuery.trim()) {
      filterStudentsByName(searchQuery);
    }
    return response;
  };

  const getStudentsFiltered = async (date, sessionId) => {
    try {
      const response = await getStudentsData(date, sessionId, ageFilter);
      const filteredData = response.data.attendanceData.filter(student => {
        const matchesSearchQuery = searchQuery === "" || 
          student.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          student.LastName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearchQuery;
      });
      return { ...response, data: filteredData };
    } catch (error) {
      console.error("Error in getStudentsFiltered:", error);
      return { data: [] };
    }
  };

  const openChangeModal = (student, isPresent) => {
    if(student.LastUpdate === "") {
      const response = AuthService.getCurrentUser();
      const data = {
        memberId: student.UserID,
        date: customDate,
        present: isPresent,
        markedBy: response.id,
        session: sessionFilter
      };
      UserService.markAttendance(data).then(() => {
        fetchFilteredStudents();
      });
    }
    else if(student.LastUpdate === isPresent) {
        console.log("[UE7002]Attendance already set to [" + isPresent, "] for [" + student.LastName + "] on [" + customDate + "] for [" + customSession + "]");
        fetchFilteredStudents();
    }
    else {
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
    try {
      const response = AuthService.getCurrentUser();
      const data = {
        memberId: selectedUser.UserID,
        date: customDate,
        present: isPresent,
        markedBy: response.id,
        session: sessionFilter
      };
      await UserService.markAttendance(data);
      closeChangeModal();
      fetchFilteredStudents();
    } catch (error) {
      console.error("Error Change Attendance :", error);
    }
  };

  const fetchFilteredStudents = async () => {
    try {
      const response = await getStudentsFiltered(customDate, sessionFilter);
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error("Error fetching filtered Students :", error);
    }
  };

  useEffect(() => {
    fetchFilteredStudents();
  }, [searchQuery, ageFilter, customDate, sessionFilter]);

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

  useEffect(() => {
    const selected = sessions.find(s => String(s.SessionID) === String(sessionFilter));
    setCustomSession(selected ? selected.SessionName : "");
    console.log("Session Filter [" + sessionFilter + '][' + (selected ? selected.SessionName : "") + ']');
  }, [sessionFilter, sessions]);

  const createNewSession = (sessionName, date) => {
    console.log("Creating new session:", sessionName, "for date:", date);
    // TODO: Call backend API to create new session
    // After successful creation, refresh the sessions list
    const newSession = {
      SessionID: Date.now(),
      SessionName: sessionName,
      SessionDate: date,
      SessionTime: "12:00 PM",
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
    setCustomSession(sessionFilter);
  };

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      handleNewSessionCancel();
    }
  };

  useEffect(() => {
    if (showNewSessionDialog) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showNewSessionDialog]);

  const filterStudentsByName = (searchText) => {
    console.log("Filtering with text:", searchText);
    if (!searchText.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => {
      const fullName = `${student.FirstName} ${student.LastName}`.toLowerCase();
      const searchLower = searchText.toLowerCase();
      const matches = fullName.includes(searchLower);
      console.log(`Checking ${fullName} against ${searchLower}: ${matches}`);
      return matches;
    });
    console.log("Filtered results:", filtered.length);
    setFilteredStudents(filtered);
  };

  const handleAgeFilterChange = async (e) => {
    const newAgeFilter = e.target.value;
    setAgeFilter(newAgeFilter);
    setSearchQuery("");
    await getStudentsData(customDate, sessionFilter, newAgeFilter);
  };

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-4 px-2">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const newSearchText = e.target.value;
                setSearchQuery(newSearchText);
                filterStudentsByName(newSearchText);
              }}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />
            {/* Role Filter */}
            <select
              value={ageFilter}
              onChange={handleAgeFilterChange}
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
            {/* Custom Session Search Box */}
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
                  setShowSuggestions(false);
                  // Check if entered session exists
                  const sessionExists = sessions.some(
                    session => session.SessionName.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (!sessionExists && e.target.value.trim() !== "") {
                    setNewSessionName(e.target.value);
                    setShowNewSessionDialog(true);
                  }
                }}
                className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search or type to create session"
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                  {sessionSuggestions.map((session) => (
                    <div
                      key={session.SessionID}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
                      onMouseDown={() => {
                        setCustomSession(session.SessionName);
                        setSessionFilter(session.SessionID);
                        setShowSuggestions(false);
                      }}
                    >
                      {session.SessionName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Session Filter Dropdown */}
            <select
              value={sessionFilter}
              onChange={(e) => {
                setSessionFilter(e.target.value);
                const selected = sessions.find(s => String(s.SessionID) === String(e.target.value));
                setCustomSession(selected ? selected.SessionName : "");
              }}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {sessions.map((session) => (
                <option key={session.SessionID} value={session.SessionID}>
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
            {filteredStudents.map((student) => (
              <tr key={student.UserID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                  <div className="ps-3">
                    <div className="text-base font-semibold">
                      {student.FirstName} {student.LastName}
                    </div>
                    {student.bestTiming && (
                      <div className="text-sm text-gray-300">
                        Best Time: {student.bestTiming}
                      </div>
                    )}
                  </div>
                </th>
                <td className="px-6 py-4">{student.AgeCategory}</td>
                <td className="px-2 py-2 flex space-x-2">
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={student.LastUpdate === "Present"}
                      onClick={() => openChangeModal(student, "Present")}
                      className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 mb-2 focus:outline-none
                        ${student.LastUpdate === "Present" 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        }`}
                    >
                      Present
                    </button>
                  </div>

                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={student.LastUpdate === "Absent"}
                      onClick={() => openChangeModal(student, "Absent")}
                      className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 mb-2 focus:outline-none
                        ${student.LastUpdate === "Absent" 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                        }`}
                    >
                      Absent
                    </button>
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
            role="dialog"
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
