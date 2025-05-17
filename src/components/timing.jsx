import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

const UserListComponent = () => {
  /** varianbles*/
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  /** filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [lengthFilter, setLengthFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [customSession, setCustomSession] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [studentTimes, setStudentTimes] = useState({});
  /** static data */
  const [ageCategories, setAgeCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLengths, setEventLengths] = useState([]);
  const [sessions, setSessions] = useState([]);

  /** functions */
  const getAgeGroups = async() => {
    const response = await UserService.ageGroups();
    setAgeCategories(response.data.data);
  }

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCustomDate(today);
  }, []);
  
  const getSessionData = async() => { 
    const response = await UserService.getSessionData();
    setSessions(response.data.sessions);
  
    if (response.data && response.data.sessions.length > 0) {
      setSessionFilter(response.data.sessions[0].SessionID);
      setCustomSession(response.data.sessions[0].SessionName);
    }
  }

  const getEventTypes = async() => { 
    const response = await UserService.getEventTypes();
    setEventTypes(response.data.eventTypes);
    if (response.data && response.data.eventTypes.length > 0) {
      setEventFilter(response.data.eventTypes[0].EventTypeID);
    }
  }

  const getEventLengths = async() => {
    const response = await UserService.getEventLengths();
    setEventLengths(response.data.eventLengths);
    if (response.data && response.data.eventLengths.length > 0) {
      setLengthFilter(response.data.eventLengths[0].EventLengthID);
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

  const filterStudentsByName = (searchText) => {
    if (!searchText.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => {
      const fullName = `${student.FirstName} ${student.LastName}`.toLowerCase();
      const searchLower = searchText.toLowerCase();
      return fullName.includes(searchLower);
    });
    setFilteredStudents(filtered);
  };

  const handleAgeFilterChange = async (e) => {
    const newAgeFilter = e.target.value;
    setAgeFilter(newAgeFilter);
    await getStudentsData(customDate, sessionFilter, newAgeFilter);
  };

  const handleSessionChange = async (e) => {
    const newSession = e.target.value;
    setSessionFilter(newSession);
    const selected = sessions.find(s => String(s.SessionID) === String(newSession));
    setCustomSession(selected ? selected.SessionName : "");
    await getStudentsData(customDate, newSession, ageFilter);
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setCustomDate(newDate);
    await getStudentsData(newDate, sessionFilter, ageFilter);
  };

  const handleTimeChange = (studentId, field, value) => {
    // Validate input based on field
    let validatedValue = value;
    if (field === 'minutes') {
      validatedValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'seconds') {
      validatedValue = value.replace(/[^0-9]/g, '').slice(0, 2);
      if (validatedValue && parseInt(validatedValue) > 59) {
        validatedValue = '59';
      }
    } else if (field === 'milliseconds') {
      validatedValue = value.replace(/[^0-9]/g, '').slice(0, 2);
    }

    setStudentTimes(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: validatedValue
      }
    }));
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    const { minutes = '', seconds = '', milliseconds = '' } = timeObj;
    // Add hours (00) and format as HH:MM:SS.MS
    return `00:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${milliseconds.padStart(2, '0')}`;
  };

  const recordStudentTime = async (student, timeObj) => { 
    const formattedTime = formatTime(timeObj);
    console.log("Record Time of", student.FirstName, student.LastName, "to", formattedTime);
    const response = await AuthService.getCurrentUser();
    const data = {
      studentId: student.UserID,
      eventId: eventFilter,
      performanceDate: customDate,
      distanceId: lengthFilter,
      sessionId: sessionFilter,
      time: formattedTime,
      recordedBy: response.id
    }
    UserService.markTiming(data);
    await getStudentsData(customDate, sessionFilter, ageFilter);
  };

  const handleLengthFilterChange = async (e) => {
    const newLengthFilter = e.target.value;
    setLengthFilter(newLengthFilter);
    await getStudentsData(customDate, sessionFilter, ageFilter);
  };

  const handleEventFilterChange = async (e) => {
    const newEventFilter = e.target.value;
    setEventFilter(newEventFilter);
    await getStudentsData(customDate, sessionFilter, ageFilter);
  };

  useEffect(() => {
    const loadData = async () => {
      await getStudentsData(customDate, sessionFilter, ageFilter);
    };
    loadData();
  }, []);

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
              onChange={(e) => {
                const newSearchText = e.target.value;
                setSearchQuery(newSearchText);
                filterStudentsByName(newSearchText);
              }}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by name"
            />

            {/* Age Filter */}
            <select
              id="age-filter"
              value={ageFilter}
              onChange={handleAgeFilterChange}
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
            {/* Session Filter */}
            <select
              id="session-filter"
              value={sessionFilter}
              onChange={handleSessionChange}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-60 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {sessions.map((session) => (
                <option key={session.SessionID} value={session.SessionID}>
                  {session.SessionName}
                </option>
              ))}
            </select>
            {/* Session date */}
            <input 
              id="session-date"
              type="date" 
              value={customDate}
              onChange={handleDateChange}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

            {/* Event Filter */}
            <select
              id="event-filter"
              value={eventFilter}
              onChange={handleEventFilterChange}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {eventTypes.map((event) => (
                <option key={event.EventTypeID} value={event.EventTypeID}>
                  {event.EventType}
                </option>
              ))}
            </select>
            {/* Length Filter */}
            <select
              id="length-filter"
              value={lengthFilter}
              onChange={handleLengthFilterChange}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-30 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {eventLengths.map((length) => (
                <option key={length.EventLengthID} value={length.EventLengthID}>
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
            {filteredStudents.map((student) => (
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
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={studentTimes[student.UserID]?.minutes || ''}
                        onChange={(e) => handleTimeChange(student.UserID, 'minutes', e.target.value)}
                        className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-12 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="M"
                        maxLength={2}
                      />
                      <span className="text-white">:</span>
                      <input
                        type="text"
                        value={studentTimes[student.UserID]?.seconds || ''}
                        onChange={(e) => handleTimeChange(student.UserID, 'seconds', e.target.value)}
                        className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-12 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="SS"
                        maxLength={2}
                      />
                      <span className="text-white">.</span>
                      <input
                        type="text"
                        value={studentTimes[student.UserID]?.milliseconds || ''}
                        onChange={(e) => handleTimeChange(student.UserID, 'milliseconds', e.target.value)}
                        className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-12 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="MS"
                        maxLength={2}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => recordStudentTime(student, studentTimes[student.UserID])} 
                      className="text-white bg-green-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 h-10"
                    > 
                      Record 
                    </button>
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
