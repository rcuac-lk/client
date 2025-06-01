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
  }
};

const Reports = () => {
  // State variables
  const [selectedReport, setSelectedReport] = useState("");
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [userRole, setUserRole] = useState("Admin"); // Set default role for testing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    
    if (!reportName) return;
    
    setIsLoading(true);
    try {
      const handler = reportHandlers[reportName];
      if (handler) {
        const data = await handler.fetchData(dateRange);
        setReportData(data);
        
        // Apply initial filtering
        const filtered = handler.filterData(data, { searchQuery, dateRange });
        setFilteredData(filtered);
      }
    } catch (err) {
      console.error(`Error loading ${reportName} report:`, err);
      setError(`Failed to load ${reportName} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search and filter changes
  useEffect(() => {
    if (selectedReport && reportData.length > 0) {
      const handler = reportHandlers[selectedReport];
      if (handler) {
        const filtered = handler.filterData(reportData, { searchQuery, dateRange });
        setFilteredData(filtered);
      }
    }
  }, [searchQuery, dateRange.start, dateRange.end, selectedReport, reportData]);

  // Handle date range changes
  const handleDateRangeChange = async (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    // If both dates are set and the date range is not too large, refresh the data
    if (selectedReport && reportDefinitions[selectedReport].requiresDateRange && 
        newDateRange.start && newDateRange.end) {
      // Check if date range is reasonable (e.g., not more than 31 days)
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
          const data = await handler.fetchData(newDateRange);
          setReportData(data);
          
          // Apply filtering
          const filtered = handler.filterData(data, { searchQuery, dateRange: newDateRange });
          setFilteredData(filtered);
        }
      } catch (err) {
        console.error(`Error refreshing ${selectedReport} report:`, err);
        setError(`Failed to refresh ${selectedReport} report. Please try again.`);
      } finally {
        setIsLoading(false);
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
        const fileName = `${selectedReport}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
        <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
          <div className="flex space-x-4 px-2">
            {/* Report Selection Dropdown */}
            <select
              value={selectedReport}
              onChange={(e) => handleReportChange(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Report</option>
              {getAvailableReports().map((report) => (
                <option key={report} value={report}>{report}</option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search..."
              disabled={!selectedReport}
            />

            {/* Date Range Filter */}
            {selectedReport && reportDefinitions[selectedReport]?.requiresDateRange && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="End Date"
                />
              </div>
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
          </div>
        )}

        {/* Report Table */}
        {selectedReport && !isLoading && filteredData.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right text-gray-400">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
              <tr>
                {reportDefinitions[selectedReport].columns.map((column) => (
                  <th key={column.key} scope="col" className="px-6 py-3">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                  {reportDefinitions[selectedReport].columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* No Data Message */}
        {selectedReport && !isLoading && filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <p>No data available for the selected criteria.</p>
            <p className="mt-2 text-sm">Try adjusting your filters or date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;