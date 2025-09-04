import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import * as XLSX from 'xlsx';

// Report Definitions
const reportDefinitions = {
  Attendance: {
    id: "attendance",
    title: "Attendance Report",
    description: "View student attendance records",
    columns: [
      { key: "studentName", label: "Student Name", type: "text" },
      { key: "ageGroup", label: "Age Group", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "status", label: "Status", type: "text" },
      { key: "session", label: "Session", type: "text" },
      { key: "recordedBy", label: "Recorded By", type: "text" }
    ],
    requiresDateRange: true,
    accessRoles: ["Admin", "Manager", "Coach", "Parent"]
  },
  Timing: {
    id: "timing",
    title: "Timing Report",
    description: "View student timing records",
    columns: [
      { key: "studentName", label: "Student Name", type: "text" },
      { key: "ageGroup", label: "Age Group", type: "text" },
      { key: "event", label: "Event", type: "text" },
      { key: "distance", label: "Distance", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "session", label: "Session", type: "text" },
      { key: "recordedBy", label: "Recorded By", type: "text" }
    ],
    requiresDateRange: true,
    accessRoles: ["Admin", "Coach"]
  },
  "Student Data": {
    id: "student-data",
    title: "Student Data Report",
    description: "View student information",
    columns: [
      { key: "name", label: "Name", type: "text" },
      { key: "ageGroup", label: "Age Group", type: "text" },
      { key: "parentName", label: "Parent Name", type: "text" },
      { key: "contact", label: "Contact", type: "text" },
      { key: "joinDate", label: "Join Date", type: "date" }
    ],
    requiresDateRange: false,
    accessRoles: ["Admin", "Manager", "Parent"]
  },
  "Activity Log": {
    id: "activity-log",
    title: "Activity Log Report",
    description: "View system activity logs",
    columns: [
      { key: "action", label: "Action", type: "text" },
      { key: "user", label: "User", type: "text" },
      { key: "timestamp", label: "Timestamp", type: "datetime" },
      { key: "details", label: "Details", type: "text" }
    ],
    requiresDateRange: true,
    accessRoles: ["Admin"]
  },
  Leaderboard: {
    id: "leaderboard",
    title: "Student Leaderboard",
    description: "View student rankings and best timings",
    columns: [
      { key: "rank", label: "Rank", type: "number" },
      { key: "admissionNumber", label: "Admission Number", type: "text" },
      { key: "studentName", label: "Student Name", type: "text" },
      { key: "ageGroup", label: "Age Group", type: "text" },
      { key: "event", label: "Event", type: "text" },
      { key: "distance", label: "Distance", type: "text" },
      { key: "bestTime", label: "Best Time", type: "text" },
      { key: "session", label: "Session", type: "text" },
      { key: "date", label: "Date", type: "date" }
    ],
    requiresDateRange: true,
    accessRoles: ["Admin", "Manager", "Coach", "Parent"]
  }
};

// Report Handlers
const reportHandlers = {
  // Attendance Report Handler
  Attendance: {
    fetchData: async (dateRange) => {
      try {
        const startDate = dateRange.start || new Date().toISOString().split('T')[0];
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        
        const user = await AuthService.getCurrentUser();
        const response = await UserService.getAttendancedataForReport(startDate, endDate, user.id);
        
        if (response.data && response.data.attendanceData) {
          // Transform the data to match our report format
          const attendanceData = response.data.attendanceData.flatMap(student => 
            student.attendanceRecords.map(record => ({
              id: student.UserID,
              studentName: `${student.FirstName} ${student.LastName}`,
              date: new Date(record.date).toISOString().split('T')[0],
              status: record.status,
              session: record.sessionName,
              recordedBy: record.markedBy,
              ageGroup: student.AgeCategory
            }))
          );
          
          return attendanceData;
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching attendance report data:", error);
        return [];
      }
    },
    filterData: (data, filters) => {
      const { searchQuery, dateRange } = filters;
      // Initialize with a copy of the original data
      let filteredData = [...data];

      // Text search filter - search in studentName
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter(item => 
          item.studentName.toLowerCase().includes(searchTerm)
        );
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          return (!startDate || itemDate >= startDate) && 
                 (!endDate || itemDate <= endDate);
        });
      }

      return filteredData;
    },
    getExportData: (data) => {
      return data.map(item => ({
        "Student Name": item.studentName || "",
        "Age Group": item.ageGroup || "",
        "Date": item.date || "",
        "Status": item.status || "",
        "Session": item.session || "",
        "Recorded By": item.recordedBy || ""
      }));
    }
  },
  
  // Timing Report Handler
  Timing: {
    fetchData: async (dateRange) => {
      try {
        const startDate = dateRange.start || new Date().toISOString().split('T')[0];
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        
        const user = await AuthService.getCurrentUser();
        const response = await UserService.getTimingDataForReport(startDate, endDate, user.id);
        
        if (response.data && response.data.performanceData) {
          // Transform the data to match our report format
          const timingData = response.data.performanceData.flatMap(student => 
            student.performanceRecords.map(record => ({
              id: student.UserID,
              studentName: `${student.FirstName} ${student.LastName}`,
              date: new Date(record.date).toISOString().split('T')[0],
              event: record.event,
              time: record.time,
              distance: record.distance,
              session: record.sessionName,
              recordedBy: record.recordedBy,
              ageGroup: student.AgeCategory
            }))
          );
          
          return timingData;
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching timing report data:", error);
        return [];
      }
    },
    filterData: (data, filters) => {
      const { searchQuery, dateRange } = filters;
      let filteredData = data;

      // Text search filter - only search in studentName
      if (searchQuery) {
        filteredData = filteredData.filter(item => 
          item.studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          return (!startDate || itemDate >= startDate) && 
                 (!endDate || itemDate <= endDate);
        });
      }

      return filteredData;
    },
    getExportData: (data) => {
      return data.map(item => ({
        "Student Name": item.studentName || "",
        "Age Group": item.ageGroup || "",
        "Event": item.event || "",
        "Distance": item.distance || "",
        "Time": item.time || "",
        "Date": item.date || "",
        "Session": item.session || "",
        "Recorded By": item.recordedBy || ""
      }));
    }
  },
  
  // Student Data Report Handler
  "Student Data": {
    fetchData: async () => {
      // Placeholder for future implementation
      return [];
    },
    filterData: (data, filters) => {
      // Placeholder for future implementation
      return data;
    },
    getExportData: (data) => {
      return data.map(item => ({
        "Name": item.name || "",
        "Age Group": item.ageGroup || "",
        "Parent Name": item.parentName || "",
        "Contact": item.contact || "",
        "Join Date": item.joinDate || ""
      }));
    }
  },
  
  // Activity Log Report Handler
  "Activity Log": {
    fetchData: async (dateRange) => {
      // Placeholder for future implementation
      return [];
    },
    filterData: (data, filters) => {
      // Placeholder for future implementation
      return data;
    },
    getExportData: (data) => {
      return data.map(item => ({
        "Action": item.action || "",
        "User": item.user || "",
        "Timestamp": item.timestamp || "",
        "Details": item.details || ""
      }));
    }
  },
  
  Leaderboard: {
    fetchData: async (dateRange, filters, filterOptions) => {
      try {
        const startDate = dateRange.start || new Date().toISOString().split('T')[0];
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        
        const user = await AuthService.getCurrentUser();

        // Find the IDs for the selected filters
        const selectedEvent = filterOptions.events.find(e => e.EventType === filters.event);
        const selectedDistance = filterOptions.distances.find(d => d.EventLength === filters.distance);
        const selectedSession = filterOptions.sessions.find(s => s.SessionName === filters.session);
        const selectedAgeGroup = filterOptions.ageGroups.find(a => a.name === filters.ageGroup);

        let newAgeGroup = filters.ageGroup;
        let newSession = filters.session;
        let newDistance = filters.distance;
        let newEvent = filters.event;

        let data = {
          startDate,
          endDate,
          userID: user.id,
          eventID: selectedEvent?.EventTypeID || '',
          distanceID: selectedDistance?.EventLengthID || '',
          ageCategory: newAgeGroup || '',
          sessionID: selectedSession?.SessionID || ''
        }

        console.log('Sending data to API:', data);
        const response = await UserService.getLeaderboardDataForReport(data);
        console.log('API Response:', response.data.performanceData);
        
        if (response.data && response.data.performanceData) {
          return response.data.performanceData.map(student => ({
            id: student.UserID,
            admissionNumber: student.AdmissionNumber,
            studentName: `${student.FirstName} ${student.LastName}`,
            ageGroup: student.AgeCategory,
            event: student.event,
            distance: student.distance,
            bestTime: student.bestTime,
            session: student.session,
            date: new Date(student.bestTimeDate).toISOString().split('T')[0],
            rank: student.rank
          }));
        }
        
        return [];
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return [];
      }
    },
    filterData: (data, filters) => {
      const { searchQuery } = filters;
      let filteredData = data;

      // Text search filter
      if (searchQuery) {
        filteredData = filteredData.filter(item => 
          item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // No need to sort or add ranks as they come from the API
      return filteredData;
    },
    getExportData: (data) => {
      return data.map(item => ({
        "Rank": item.rank || "",
        "Admission Number": item.admissionNumber || "",
        "Student Name": item.studentName || "",
        "Age Group": item.ageGroup || "",
        "Event": item.event || "",
        "Distance": item.distance || "",
        "Best Time": item.bestTime || "",
        "Session": item.session || "",
        "Date": item.date || ""
      }));
    }
  }
};

const Reports = () => {
  // State variables
  const [selectedReport, setSelectedReport] = useState("");
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [userRole, setUserRole] = useState("Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter options state
  const [ageGroups, setAgeGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [distances, setDistances] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Selected filters state
  const [ageGroup, setAgeGroup] = useState("");
  const [session, setSession] = useState("");
  const [distance, setDistance] = useState("");
  const [event, setEvent] = useState("");

  // Fetch filter options when component mounts
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch age groups
        const ageGroupsResponse = await UserService.ageGroups();
        if (ageGroupsResponse.data) {
          // Filter out "All Ages" option
          const filteredAgeGroups = ageGroupsResponse.data.data.filter(group => group.name !== "All Ages");
          console.log(filteredAgeGroups);
          setAgeGroups(filteredAgeGroups);
        }

        // Fetch sessions
        const sessionsResponse = await UserService.getSessionData();
        if (sessionsResponse.data) {
          console.log(sessionsResponse.data.sessions);
          setSessions(sessionsResponse.data.sessions);
        }

        // Fetch distances
        const distancesResponse = await UserService.getEventLengths();
        if (distancesResponse.data) {
          console.log(distancesResponse.data.eventLengths);
          setDistances(distancesResponse.data.eventLengths);
        }

        // Fetch events
        const eventsResponse = await UserService.getEventTypes();
        if (eventsResponse.data) {
          console.log(eventsResponse.data.eventTypes);
          setEvents(eventsResponse.data.eventTypes);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setError("Failed to load filter options. Please refresh the page.");
      }
    };

    fetchFilterOptions();
  }, []);

  // Get user role and age categories on component mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.role) {
      setUserRole(currentUser.role);
    }
  }, []);

  // Get available reports based on user role
  const getAvailableReports = () => {
    return Object.keys(reportDefinitions).filter(reportName => {
      const report = reportDefinitions[reportName];
      return report.accessRoles.includes(userRole);
    });
  };

  // Handle report selection
  const handleReportChange = async (reportName) => {
    setSelectedReport(reportName);
    setReportData([]);
    setFilteredData([]);
    setError(null);
    setSearchQuery("");
    
    // Autofill date range with today for Attendance report
    if (reportName === 'Attendance') {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDateRange({ start: `${year}-${month}-${day}`, end: `${year}-${month}-${day}` });
    }
    
    if (!reportName) return;
    
    // Reset filters when changing reports
    if (reportName === "Leaderboard") {
      setAgeGroup("");
      setSession("");
      setDistance("");
      setEvent("");
    }
    
    setIsLoading(true);
    try {
      const handler = reportHandlers[reportName];
      if (handler) {
        const data = await handler.fetchData(
          dateRange, 
          { ageGroup, session, distance, event },
          { ageGroups, sessions, distances, events }
        );
        setReportData(data);
        
        // Apply initial filtering
        const filtered = handler.filterData(data, { 
          searchQuery, 
          dateRange,
          ageGroup,
          session,
          distance,
          event
        });
        setFilteredData(filtered);
      }
    } catch (err) {
      console.error(`Error loading ${reportName} report:`, err);
      setError(`Failed to load ${reportName} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes for Leaderboard
  const handleFilterChange = async (filterType, value) => {
    // Prepare new filter values
    let newAgeGroup = ageGroup;
    let newSession = session;
    let newDistance = distance;
    let newEvent = event;

    switch (filterType) {
      case 'ageGroup':
        newAgeGroup = value;
        setAgeGroup(value);
        break;
      case 'session':
        newSession = value;
        setSession(value);
        break;
      case 'distance':
        newDistance = value;
        setDistance(value);
        break;
      case 'event':
        newEvent = value;
        setEvent(value);
        break;
      default:
        break;
    }

    // For Leaderboard, check if all required filters are set
    if (selectedReport === "Leaderboard") {
      const allFiltersSet = newAgeGroup && newSession && newDistance && newEvent;
      const hasDateRange = dateRange.start || dateRange.end;

      // Only make API call if all required filters are set and at least one date is provided
      if (allFiltersSet && hasDateRange) {
        setIsLoading(true);
        try {
          const handler = reportHandlers[selectedReport];
          if (handler) {
            const data = await handler.fetchData(
              dateRange,
              { ageGroup: newAgeGroup, session: newSession, distance: newDistance, event: newEvent },
              { ageGroups, sessions, distances, events }
            );
            setReportData(data);
            setFilteredData(data);
          }
        } catch (err) {
          console.error("Error updating leaderboard data:", err);
          setError("Failed to update leaderboard data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Handle search for Attendance report
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!selectedReport || !reportData.length) {
      setFilteredData([]);
      return;
    }
    
    if (selectedReport === 'Attendance') {
      // Always start with the original data
      const originalData = [...reportData];
      
      // If search is empty, show all data
      if (!query.trim()) {
        setFilteredData(originalData);
        return;
      }

      // Filter the original data based on search term
      const searchTerm = query.toLowerCase().trim();
      const filtered = originalData.filter(item => 
        item.studentName.toLowerCase().includes(searchTerm)
      );
      
      // Set the filtered data directly
      setFilteredData(filtered);
    }
  };

  // Handle date range changes
  const handleDateRangeChange = async (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    if (selectedReport === "Leaderboard") {
      const allFiltersSet = ageGroup && session && distance && event;
      const hasDateRange = newDateRange.start || newDateRange.end;

      // Only make API call if all required filters are set and at least one date is provided
      if (allFiltersSet && hasDateRange) {
        setIsLoading(true);
        setError(null);
        try {
          const handler = reportHandlers[selectedReport];
          if (handler) {
            const data = await handler.fetchData(
              newDateRange,
              { ageGroup, session, distance, event },
              { ageGroups, sessions, distances, events }
            );
            setReportData(data);
            setFilteredData(data);
          }
        } catch (err) {
          console.error(`Error refreshing ${selectedReport} report:`, err);
          setError(`Failed to refresh ${selectedReport} report. Please try again.`);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (selectedReport && reportDefinitions[selectedReport].requiresDateRange) {
      // Handle date range changes for other reports
      if (newDateRange.start && newDateRange.end) {
        const startDate = new Date(newDateRange.start);
        const endDate = new Date(newDateRange.end);
        const daysDifference = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (daysDifference > 31) {
          setError(`Please select a date range of 31 days or less. Current selection: ${daysDifference} days.`);
          return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
          const handler = reportHandlers[selectedReport];
          if (handler) {
            // Get fresh data from API for new date range
            const data = await handler.fetchData(
              newDateRange,
              { ageGroup, session, distance, event },
              { ageGroups, sessions, distances, events }
            );
            setReportData(data);
            // Apply search filter if there's an active search
            if (searchQuery.trim()) {
              const searchTerm = searchQuery.toLowerCase().trim();
              const filtered = data.filter(item => 
                item.studentName.toLowerCase().includes(searchTerm)
              );
              setFilteredData(filtered);
            } else {
              setFilteredData(data);
            }
          }
        } catch (err) {
          console.error(`Error refreshing ${selectedReport} report:`, err);
          setError(`Failed to refresh ${selectedReport} report. Please try again.`);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Export report data
  const handleExport = () => {
    if (selectedReport && filteredData.length > 0) {
      const handler = reportHandlers[selectedReport];
      if (handler) {
        const exportData = handler.getExportData(filteredData);
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedReport);
        
        // Generate Excel file
        const fileName = `${selectedReport}_${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}.xlsx`;
        XLSX.writeFile(wb, fileName);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="relative shadow-md sm:rounded-lg mt-16">
        {/* Fixed Filters Section */}
        <div className="sticky top-0 z-10 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4">
            <div className="flex flex-wrap gap-4 px-2">
              {/* Report Selection Dropdown */}
              <select
                value={selectedReport}
                onChange={(e) => handleReportChange(e.target.value)}
                className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-72 min-w-[18rem]"
              >
                <option value="">Select Report</option>
                {getAvailableReports().map((report) => (
                  <option key={report} value={report}>{report}</option>
                ))}
              </select>

              {/* Search Input - visible only for Attendance report */}
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search by student name"
                disabled={!selectedReport}
                style={{ display: selectedReport === 'Attendance' ? 'block' : 'none' }}
              />

              {/* Date Range Filter */}
              {selectedReport && reportDefinitions[selectedReport]?.requiresDateRange && (
                <div className="flex space-x-2 items-center">
                  <span className="text-gray-200 text-sm">From</span>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-200 text-sm">To</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="End Date"
                  />
                </div>
              )}

              {/* Additional filters for Leaderboard */}
              {selectedReport === "Leaderboard" && (
                <>
                  <select
                    value={ageGroup}
                    onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((group) => (
                      <option key={group.value} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={session}
                    onChange={(e) => handleFilterChange('session', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Session</option>
                    {sessions.map((session) => (
                      <option key={session.SessionID} value={session.SessionName}>
                        {session.SessionName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={distance}
                    onChange={(e) => handleFilterChange('distance', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Distance</option>
                    {distances.map((distance) => (
                      <option key={distance.EventLengthID} value={distance.EventLength}>
                        {distance.EventLength}
                      </option>
                    ))}
                  </select>

                  <select
                    value={event}
                    onChange={(e) => handleFilterChange('event', e.target.value)}
                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event.EventTypeID} value={event.EventType}>
                        {event.EventType}
                      </option>
                    ))}
                  </select>
                </>
              )}
              
              {/* Export Button */}
              {selectedReport && filteredData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="h-10 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Export
                </button>
              )}
            </div>
          </div>

          {/* Report Header */}
          {selectedReport && !isLoading && (
            <div className="p-4 bg-gray-800">
              <h2 className="text-xl font-bold text-white">{reportDefinitions[selectedReport].title}</h2>
              <p className="text-gray-400">{reportDefinitions[selectedReport].description}</p>
              {dateRange.start && dateRange.end && (
                <p className="text-gray-400 mt-2">
                  Period: {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                </p>
              )}
              {selectedReport === "Leaderboard" && ageGroup && session && distance && event && (
                <p className="text-gray-400 mt-2">
                  Category: {ageGroup} | {event} | {distance} | {session}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Loading...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            {error}
          </div>
        )}

        {/* Table Section: Header and Body in One Table for Proper Alignment */}
        {selectedReport && !isLoading && filteredData.length > 0 && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-400">
              <thead className="text-xs uppercase text-gray-400 bg-gray-700">
                <tr>
                  {reportDefinitions[selectedReport].columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 sticky top-0 z-20 bg-gray-700"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={`${row.id}-${index}`} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                    {reportDefinitions[selectedReport].columns.map((column) => (
                      <td key={column.key} className="px-6 py-4">
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;