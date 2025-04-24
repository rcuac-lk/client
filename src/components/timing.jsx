import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";

const UserListComponent = () => {
  /** varianbles*/
  const [students, setStudents] = useState([]);
  /** filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [lengthFilter, setLenthFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [customSession, setCustomSession] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [studentTime, setStudentTime] = useState(0.00);
  /** static data */
  const [ageCategories, setAgeCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLengths, setEventLengths] = useState([]);
  const [sessions, setSessions] = useState([]);

  /** functions */
  const getAgeGroups = async() => {
    const response = await UserService.ageGroups();
    setAgeCategories(response.data);
  }

  const getSessionData = async() => { 
    const response = await UserService.getSessionData();
    setSessions(response.data.sessions);
  
    if (response.data && response.data.length > 0) {
      setSessionFilter(response.data[0].SessionName);
      setCustomSession(response.data[0].SessionName);
      setCustomDate(response.data[0].SessionDate);
    }
  }

  const getEventTypes = async() => { 
    const response = await UserService.getEventTypes();
    setEventTypes(response.data.eventTypes);
  }

  const getEventLengths = async() => {
    const response = await UserService.getEventLengths();
    console.log(response.data.eventLengths);
    setEventLengths(response.data.eventLengths);
  }


  const getStudentsData = () => { 
    /** the responce data should be fetched from the backend
     * The LastUpdate field is used to determine if the student attendance is already set or not for the current date.
     * if LastUpdate === "", then the student attendance is not set for the current date.
     * The AgeCategory field is used to filter the students based on their age. */
    const response = {
      /** dummy data. Get this from backend. */
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
              "bestTiming": "0:23.76",
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
              "bestTiming": "0:25.13",
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
              "bestTiming": "0:25.98",
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
              "bestTiming": "0:22.37",
             }
        ],
        "request": {}
      };
      return response;
    }

  const getStudentsFiltered = () => {
    /** Filter the student data using the user selection. We will use searchQuery and ageFilter*/
    const response = getStudentsData();
      const filteredData = response.data.filter(student => {
        const matchesSearchQuery = searchQuery === "" || 
        student.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.LastName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoleFilter = ageFilter === "" || student.AgeCategory === ageFilter;
        return matchesSearchQuery && matchesRoleFilter;
      });
      return { ...response, data: filteredData };
  }

  const recordStudentTime = (student, time) => { 
    console.log("Record Time of", student.FirstName, student.LastName, "to", time);
    /** call backend function recordStudentTime(student.UserID, time); */
    fetchFilteredStudents(); //load all student data.
  }

  const fetchFilteredStudents = async () => {
    console.log("fetchFilteredStudents");
    try {
      /** const response = await UserService.searchUsers(searchQuery, ageFilter); */
      const response = getStudentsFiltered();
      console.log(response.data);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching filtered Students:", error);
    }
  };

  /** load the student data */
  useEffect(() => {
    fetchFilteredStudents();
  }, [searchQuery, ageFilter]);

  /** load the static data */
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        await getAgeGroups();
        await getEventTypes();
        await getEventLengths();
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
  }, [sessionFilter]);

  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-2 px-2">
            {/* Search Input */}
            <input
              id="student-name-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />

            {/* Age Filter */}
            <select
              id="age-filter"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-30 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <input
              id="custom-session"
              type="text"
              value={customSession}
              onChange={(e) => setCustomSession(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Session Name"
            />
            {/* Session Filter */}
            <select
              id="session-filter"
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-60 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {sessions.map((session) => (
                <option key={session.SessionName} value={session.SessionName}>
                  {session.SessionName}
                </option>
              ))}
            </select>
            {/* Session date */}
            <input 
              id="session-date"
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

            {/* Event Filter */}
            <select
              id="event-filter"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {eventTypes.map((event) => (
                <option key={event.EventType} value={event.EventType}>
                  {event.EventType}
                </option>
              ))}
            </select>
            {/* Length Filter */}
            <select
              id="length-filter"
              value={lengthFilter}
              onChange={(e) => setLenthFilter(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-30 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {eventLengths.map((length) => (
                <option key={length.EventLength} value={length.EventLength}>
                  {length.EventLength}
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
              <th scope="col" className="px-6 py-3">Timing</th>
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
                    <div className="font-normal text-gray-500">
                      {student.bestTiming}
                    </div>
                  </div>
                </th>
                <td className="px-6 py-4">{student.AgeCategory}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id={`student-time-${student.UserID}`}
                      type="text"
                      value={studentTime}
                      onChange={(e) => setStudentTime(e.target.value)}
                      className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-28 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder={student.bestTiming}
                    />
                    <button type="button" id={`record-time-${student.UserID}`} onClick={() => recordStudentTime(student, studentTime)} className="text-white bg-green-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 h-10"> Record </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListComponent;
