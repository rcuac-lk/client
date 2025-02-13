import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";

const UserListComponent = () => {
  /** varianbles*/
  const [selectedUser, setSelectedUser] = useState({});
  const [students, setStudents] = useState([]);
  const [isPresent, setIsPresent] = useState(null);
  /** filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [lengthFilter, setLenthFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [customSession, setCustonSession] = useState(sessionFilter.SessionName);
  const [customDate, setCustomDate] = useState(sessionFilter.SessionDate);
  const [studentTime, setStudentTime] = useState(0.00);
  /** modals */
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  /** static data */
  const [ageCategories, setAgeCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLengths, setEventLengths] = useState([]);
  const [sessions, setSessions] = useState([]);

  /** functions */
  const getAgeGroups = () => {
    /** The AgeCategory field is used to filter the students based on their age.
     * This function will get the acceptable age category groups from the backend. */
    const response = {
      /** dummy data. Get this from backend. */
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

  const getSessionData = () => { 
    /**This will get the event data from the back end */
    const dateObject = new Date()
    /** get the current date to a string in YYYY-MM-DD format */
    const today = dateObject.toISOString().split('T')[0];
    const response = {
      /** dummy data. Get this from backend. */    
        "data": [
            {
              "SessionID": 1000,
              "SessionName": "Morning Practice Session",
              "SessionDate": today,
              "SessionTime": "7:00 AM",
              "SessionLocation": "Collage Pool",
              "SessionDescription": "Standard Practice Session",
            }, 
            {
              "SessionID": 1001,
              "SessionName": "Evening Practice Session",
              "SessionDate": today,
              "SessionTime": "05:00 PM",
              "SessionLocation": "Collage Pool",
              "SessionDescription": "Standard Practice Session",
            }, 
            {
              "SessionID": 1002,
              "SessionName": "Natianal Championship",
              "SessionDate": "2025-01-12",
              "SessionTime": "12:00 PM",
              "SessionLocation": "Sugathadasa Stadium",
              "SessionDescription": "Main National Championship",
            }
        ],
        "request": {}
      };
      return response;
  }

  const getEventTypes = () => { 
    /**This will get the event data from the back end */
    const response = {
      /** dummy data. Get this from backend. */    
        "data": [
            {
              "EventTypeID": 1000,
              "EventType": "Free Style",
              "EventTypeDescription": "Free Style Swimming",
            }, 
            {
              "EventTypeID": 1001,
              "EventType": "Back Stroke",
              "EventTypeDescription": "Back Stroke Swimming",
            }, 
            {
              "EventTypeID": 1002,
              "EventType": "Breast Stroke",
              "EventTypeDescription": "Breast Stroke Swimming",
            },
            {
              "EventTypeID": 1003,
              "EventType": "Butterfly",
              "EventTypeDescription": "Butterfly Swimming",
            }
        ],
        "request": {}
      };
      return response;
  }

  const getEventLengths = () => {
    /**This will get the event data from the back end */
    const response = {
      /** dummy data. Get this from backend. */    
        "data": [
            {
              "EventLengthID": 1000,
              "EventLength": "50m",
              "EventLengthDescription": "50 meter event",
            }, 
            {
              "EventLengthID": 1001,
              "EventLength": "100m",
              "EventLengthDescription": "100 meter event",
            }, 
            {
              "EventLengthID": 1002,
              "EventLength": "200m",
              "EventLengthDescription": "200 meter event",
            },
            {
              "EventLengthID": 1003,
              "EventLength": "400m",
              "EventLengthDescription": "400 meter event",
            }
        ],
        "request": {}
    };
    return response;
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
    const ageCategories = getAgeGroups();
    setAgeCategories(ageCategories.data);
    const eventTypes = getEventTypes();
    setEventTypes(eventTypes.data);
    const eventLengths = getEventLengths();
    setEventLengths(eventLengths.data);
    const sessions = getSessionData();
    setSessions(sessions.data);
  }, []);


  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-2 px-2">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />

            {/* Age Filter */}
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block w-30 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
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
              type="text"
              value={sessionFilter.SessionName}
              onChange={(e) => setCustonSession(e.target.value)}
              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Session Name"
            />
            {/* Session Filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="block w-60 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
            >
              {sessions.map((session) => (
                <option key={session.SessionName} value={session.SessionName}>
                  {session.SessionName}
                </option>
              ))}
            </select>
            {/* Session date */}
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="block w-40 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white" />

            {/* event Filter */}
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="block w-40 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
            >
              {eventTypes.map((event) => (
                <option key={event.EventType} value={event.EventType}>
                  {event.EventType}
                </option>
              ))}
            </select>
            {/* Length Filter */}
            <select
              value={lengthFilter}
              onChange={(e) => setLenthFilter(e.target.value)}
              className="block w-30 p-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
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
              <th scope="col" className="py-3">Timing</th>
              <th scope="col" className="px-6 py-3">Record</th>
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
                <td className="px-2 py-2 flex">
                  <div className="flex items-center">
                  <input
                    type="text"
                    value = {studentTime}
                    onChange={(e) => setStudentTime(e.target.value)}
                    className="block pt-2 ps-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-20 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={student.bestTiming}
                  />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                      <button type="button" onClick={() => recordStudentTime(student,studentTime)} className="text-white bg-green-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Record </button>
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
