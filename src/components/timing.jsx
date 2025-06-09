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
  const [studentRawTimes, setStudentRawTimes] = useState({});
  /** static data */
  const [ageCategories, setAgeCategories] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventLengths, setEventLengths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [focusedStudentId, setFocusedStudentId] = useState(null);
  const [studentInputTouched, setStudentInputTouched] = useState({});
  const [studentTimeStatus, setStudentTimeStatus] = useState({});

  /** functions */
  const getAgeGroups = async() => {
    const response = await UserService.ageGroups();
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

  const handleTimeChange = (studentId, value) => {
    // Allow only digits, at most one colon (before any dot), and at most one dot (after colon or after digits)
    let cleanedValue = value.replace(/[^0-9:.]/g, '');

    let result = '';
    let colonSeen = false;
    let dotSeen = false;
    for (let i = 0; i < cleanedValue.length; i++) {
      const char = cleanedValue[i];
      if (char === ':') {
        if (!colonSeen && !dotSeen) {
          colonSeen = true;
          result += char;
        }
        // else: skip extra colons or colons after a dot
      } else if (char === '.') {
        if (!dotSeen) {
          dotSeen = true;
          result += char;
        }
        // else: skip extra dots
      } else {
        result += char;
      }
    }

    // Enforce max length of 9 characters
    result = result.slice(0, 9);

    // If there is a colon, check the seconds part
    if (result.includes(':')) {
      const [min, rest] = result.split(':');
      let sec = rest;
      if (rest && rest.includes('.')) {
        sec = rest.split('.')[0];
      }
      // If seconds part is >= 60, remove the last character
      if (sec && sec.length > 0 && parseInt(sec, 10) >= 60) {
        result = result.slice(0, -1);
      }
    }

    setStudentRawTimes(prev => ({
      ...prev,
      [studentId]: result
    }));
    setStudentInputTouched(prev => ({
      ...prev,
      [studentId]: true
    }));
  };

  function formatTimingForDisplay(raw) {
    if (!raw) return "00:00.000";
    let min = "00", sec = "00", ms = "000", hours = "00";
    if (raw.includes(':')) {
      const [left, right] = raw.split(':');
      if (right && right.includes('.')) {
        [sec, ms] = right.split('.');
        min = left;
      } else if (right) {
        min = left;
        sec = right;
      } else {
        min = left;
      }
    } else if (raw.includes('.')) {
      // Handle SS.mmm or S.mmm, and convert to MM:SS.mmm if needed
      [sec, ms] = raw.split('.');
      sec = sec || '0';
      let secNum = parseInt(sec, 10) || 0;
      min = String(Math.floor(secNum / 60)).padStart(2, '0');
      sec = String(secNum % 60).padStart(2, '0');
    } else {
      // Just seconds
      sec = raw;
      let secNum = parseInt(sec, 10) || 0;
      min = String(Math.floor(secNum / 60)).padStart(2, '0');
      sec = String(secNum % 60).padStart(2, '0');
    }
    ms = (ms || '').padEnd(3, '0').slice(0, 3);

    // If minutes >= 60, convert to hours
    let minNum = parseInt(min, 10) || 0;
    if (minNum >= 60) {
      hours = String(Math.floor(minNum / 60)).padStart(2, '0');
      min = String(minNum % 60).padStart(2, '0');
      return `${hours}:${min}:${sec}.${ms}`;
    }
    return `${min}:${sec}.${ms}`;
  }

  // Helper: Convert time string (MM:SS.mmm or HH:MM:SS.mmm) to milliseconds
  function timeStringToMs(str) {
    if (!str) return 0;
    let ms = 0;
    let parts = str.split(":");
    if (parts.length === 3) {
      // HH:MM:SS.mmm
      let [hh, mm, ssMs] = parts;
      let [ss, mmm = "0"] = ssMs.split(".");
      ms += (parseInt(hh, 10) || 0) * 3600000;
      ms += (parseInt(mm, 10) || 0) * 60000;
      ms += (parseInt(ss, 10) || 0) * 1000;
      ms += (parseInt(mmm, 10) || 0);
    } else if (parts.length === 2) {
      // MM:SS.mmm
      let [mm, ssMs] = parts;
      let [ss, mmm = "0"] = ssMs.split(".");
      ms += (parseInt(mm, 10) || 0) * 60000;
      ms += (parseInt(ss, 10) || 0) * 1000;
      ms += (parseInt(mmm, 10) || 0);
    } else if (parts.length === 1) {
      // SS.mmm
      let [ss, mmm = "0"] = parts[0].split(".");
      ms += (parseInt(ss, 10) || 0) * 1000;
      ms += (parseInt(mmm, 10) || 0);
    }
    return ms;
  }

  // Helper: Convert milliseconds to MM:SS.mmm or HH:MM:SS.mmm (if needed)
  function msToTimeString(ms) {
    ms = Math.max(0, ms);
    let totalSeconds = Math.floor(ms / 1000);
    let milliseconds = ms % 1000;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    if (minutes >= 60) {
      let hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }

  // Define max time in ms (99:59.999)
  const MAX_TIME_MS = (99 * 60 + 59) * 1000 + 999;
  const MIN_TIME_MS = 0;

  // Canonical parser: always returns {minutes, seconds, milliseconds} from raw input
  function parseRawTimeInput(raw) {
    let minutes = 0, seconds = 0, milliseconds = 0;
    if (!raw) return { minutes: '00', seconds: '00', milliseconds: '000' };
    if (raw.includes(':')) {
      // MM:SS.mmm or HH:MM:SS.mmm
      const parts = raw.split(':');
      if (parts.length === 3) {
        // HH:MM:SS.mmm
        let [hh, mm, ssMs] = parts;
        let [ss, ms = '0'] = ssMs.split('.');
        minutes = (parseInt(hh, 10) || 0) * 60 + (parseInt(mm, 10) || 0);
        seconds = parseInt(ss, 10) || 0;
        // Right-pad ms to 3 digits
        ms = (ms + '').padEnd(3, '0').slice(0, 3);
        milliseconds = parseInt(ms, 10) || 0;
      } else if (parts.length === 2) {
        // MM:SS.mmm
        let [mm, ssMs] = parts;
        let [ss, ms = '0'] = ssMs.split('.');
        minutes = parseInt(mm, 10) || 0;
        seconds = parseInt(ss, 10) || 0;
        ms = (ms + '').padEnd(3, '0').slice(0, 3);
        milliseconds = parseInt(ms, 10) || 0;
      }
    } else if (raw.includes('.')) {
      // SS.mmm or S.mmm
      let [ss, ms = '0'] = raw.split('.');
      seconds = parseInt(ss, 10) || 0;
      ms = (ms + '').padEnd(3, '0').slice(0, 3);
      milliseconds = parseInt(ms, 10) || 0;
    } else {
      // Just seconds
      seconds = parseInt(raw, 10) || 0;
    }
    // Clamp values
    if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
    }
    if (milliseconds >= 1000) {
      seconds += Math.floor(milliseconds / 1000);
      milliseconds = milliseconds % 1000;
    }
    if (minutes >= 100) {
      minutes = 99;
      seconds = 59;
      milliseconds = 999;
    }
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(3, '0')
    };
  }

  const handleTimeBlur = (studentId) => {
    setFocusedStudentId(null);
    let raw = studentRawTimes[studentId] || '';
    const timeObj = parseRawTimeInput(raw);
    // Clamp to max
    let ms = parseInt(timeObj.minutes, 10) * 60000 + parseInt(timeObj.seconds, 10) * 1000 + parseInt(timeObj.milliseconds, 10);
    ms = Math.max(MIN_TIME_MS, Math.min(ms, MAX_TIME_MS));
    const clamped = msToTimeString(ms);
    const [minSec, msStr = ''] = clamped.split('.');
    const [min = '', sec = ''] = (minSec || '').split(':').slice(-2);
    const finalObj = {
      minutes: min.padStart(2, '0').slice(0, 2),
      seconds: sec.padStart(2, '0').slice(0, 2),
      milliseconds: msStr.padEnd(3, '0').slice(0, 3)
    };
    setStudentTimes(prev => ({
      ...prev,
      [studentId]: finalObj
    }));
    setStudentRawTimes(prev => ({
      ...prev,
      [studentId]: clamped
    }));
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    const { minutes = '00', seconds = '00', milliseconds = '000' } = timeObj;
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${milliseconds.padStart(3, '0')}`;
  };

  const handleKeyPress = (e, student) => {
    if (e.key === 'Enter') {
      let raw = studentRawTimes[student.UserID] || '';
      const timeObj = parseRawTimeInput(raw);
      // Clamp to max
      let ms = parseInt(timeObj.minutes, 10) * 60000 + parseInt(timeObj.seconds, 10) * 1000 + parseInt(timeObj.milliseconds, 10);
      ms = Math.max(MIN_TIME_MS, Math.min(ms, MAX_TIME_MS));
      const clamped = msToTimeString(ms);
      const [minSec, msStr = ''] = clamped.split('.');
      const [min = '', sec = ''] = (minSec || '').split(':').slice(-2);
      const finalObj = {
        minutes: min.padStart(2, '0').slice(0, 2),
        seconds: sec.padStart(2, '0').slice(0, 2),
        milliseconds: msStr.padEnd(3, '0').slice(0, 3)
      };
      setStudentTimes(prev => ({
        ...prev,
        [student.UserID]: finalObj
      }));
      setStudentRawTimes(prev => ({
        ...prev,
        [student.UserID]: clamped
      }));
      recordStudentTime(student, finalObj);
      setFocusedStudentId(null);
    }
  };

  const toBackendTimeFormat = (timeObj) => {
    if (!timeObj) return '';
    let min = parseInt(timeObj.minutes, 10) || 0;
    let sec = parseInt(timeObj.seconds, 10) || 0;
    let ms = parseInt(timeObj.milliseconds, 10) || 0;
    let totalMs = min * 60000 + sec * 1000 + ms;
    totalMs = Math.max(MIN_TIME_MS, Math.min(totalMs, MAX_TIME_MS));
    // Always output as HH:MM:SS.mmm
    let hours = Math.floor(min / 60);
    let minutes = min % 60;
    let HH = String(hours).padStart(2, '0');
    let MM = String(minutes).padStart(2, '0');
    let SS = String(sec).padStart(2, '0');
    let MMM = String(ms).padStart(3, '0');
    return `${HH}:${MM}:${SS}.${MMM}`;
  };

  const recordStudentTime = async (student, timeObj) => { 
    const formattedTime = toBackendTimeFormat(timeObj);
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
    try {
      await UserService.markTiming(data);
      setStudentTimeStatus(prev => ({ ...prev, [student.UserID]: 'success' }));
      await getStudentsData(customDate, sessionFilter, ageFilter);
    } catch (err) {
      setStudentTimeStatus(prev => ({ ...prev, [student.UserID]: 'error' }));
    }
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
              <th scope="col" className="px-6 py-3 text-center">Timing</th>
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
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="text"
                      placeholder="00:00.000"
                      value={
                        focusedStudentId === student.UserID
                          ? (studentRawTimes[student.UserID] !== undefined ? studentRawTimes[student.UserID] : "")
                          : formatTime(studentTimes[student.UserID])
                      }
                      onFocus={() => {
                        setFocusedStudentId(student.UserID);
                        setStudentRawTimes(prev => ({ ...prev, [student.UserID]: "" }));
                        setStudentInputTouched(prev => ({ ...prev, [student.UserID]: false }));
                        setStudentTimeStatus(prev => ({ ...prev, [student.UserID]: undefined }));
                      }}
                      onBlur={() => handleTimeBlur(student.UserID)}
                      onChange={(e) => handleTimeChange(student.UserID, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, student)}
                      style={{
                        width: "100px",
                        textAlign:
                          focusedStudentId === student.UserID &&
                          (studentRawTimes[student.UserID] === undefined || studentRawTimes[student.UserID] === "")
                            ? "left"
                            : "center",
                        backgroundColor:
                          studentTimeStatus[student.UserID] === 'success' ? '#bbf7d0' :
                          studentTimeStatus[student.UserID] === 'error' ? '#fecaca' :
                          undefined
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    <button
                      onClick={() => recordStudentTime(student, studentTimes[student.UserID])}
                      className="bg-blue-600 text-white rounded-lg h-10 px-4 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                      style={{ minWidth: "70px" }}
                      disabled={
                        !studentInputTouched[student.UserID] ||
                        (studentRawTimes[student.UserID] === undefined || studentRawTimes[student.UserID] === "") ||
                        studentTimeStatus[student.UserID] === 'success'
                      }
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
