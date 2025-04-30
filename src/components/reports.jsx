import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";

const Reports = () => {
    // State variables
    const [selectedReport, setSelectedReport] = useState("");
    const [reportData, setReportData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [userRole, setUserRole] = useState("Admin"); // Set default role for testing

    // Available reports based on user role
    const availableReports = {
        Admin: ["Attendance", "Timing", "Student Data", "Activity Log"],
        Manager: ["Attendance", "Student Data"],
        Coach: ["Attendance", "Timing"],
        Parent: ["Attendance", "Student Data"]
    };

    // Dummy data for reports
    const dummyData = {
        Attendance: [
            { id: 1, studentName: "John Doe", date: "2024-04-30", status: "Present", session: "Morning Practice", recordedBy: "Coach Smith" },
            { id: 2, studentName: "Jane Smith", date: "2024-04-30", status: "Absent", session: "Morning Practice", recordedBy: "Coach Smith" },
            { id: 3, studentName: "Mike Johnson", date: "2024-04-30", status: "Present", session: "Evening Practice", recordedBy: "Coach Brown" }
        ],
        Timing: [
            { id: 1, studentName: "John Doe", event: "50m Freestyle", time: "00:25.45", date: "2024-04-30", session: "Morning Practice", recordedBy: "Coach Smith" },
            { id: 2, studentName: "Jane Smith", event: "100m Backstroke", time: "01:15.30", date: "2024-04-30", session: "Evening Practice", recordedBy: "Coach Brown" }
        ],
        "Student Data": [
            { id: 1, name: "John Doe", ageGroup: "Under 15", parentName: "Robert Doe", contact: "0771234567", joinDate: "2024-01-01" },
            { id: 2, name: "Jane Smith", ageGroup: "Under 13", parentName: "Mary Smith", contact: "0777654321", joinDate: "2024-02-15" }
        ],
        "Activity Log": [
            { id: 1, action: "Login", user: "Admin", timestamp: "2024-04-30 09:00:00", details: "User logged in" },
            { id: 2, action: "Attendance Update", user: "Coach Smith", timestamp: "2024-04-30 10:15:00", details: "Marked attendance for 5 students" }
        ]
    };

    // Column configurations for each report
    const reportColumns = {
        Attendance: [
            { key: "studentName", label: "Student Name", type: "text" },
            { key: "date", label: "Date", type: "date" },
            { key: "status", label: "Status", type: "text" },
            { key: "session", label: "Session", type: "text" },
            { key: "recordedBy", label: "Recorded By", type: "text" }
        ],
        Timing: [
            { key: "studentName", label: "Student Name", type: "text" },
            { key: "event", label: "Event", type: "text" },
            { key: "time", label: "Time", type: "text" },
            { key: "date", label: "Date", type: "date" },
            { key: "session", label: "Session", type: "text" },
            { key: "recordedBy", label: "Recorded By", type: "text" }
        ],
        "Student Data": [
            { key: "name", label: "Name", type: "text" },
            { key: "ageGroup", label: "Age Group", type: "text" },
            { key: "parentName", label: "Parent Name", type: "text" },
            { key: "contact", label: "Contact", type: "text" },
            { key: "joinDate", label: "Join Date", type: "date" }
        ],
        "Activity Log": [
            { key: "action", label: "Action", type: "text" },
            { key: "user", label: "User", type: "text" },
            { key: "timestamp", label: "Timestamp", type: "datetime" },
            { key: "details", label: "Details", type: "text" }
        ]
    };

    // Get user role on component mount
    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.role) {
            setUserRole(currentUser.role);
        }
        // If no user is found, we'll keep the default "Admin" role for testing
    }, []);

    // Filter data based on search query and date range
    const filterData = (data) => {
        return data.filter(item => {
            // Text search filter
            const matchesSearch = Object.entries(item).some(([key, value]) => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return false;
            });

            // Date range filter
            const hasDate = item.date || item.timestamp || item.joinDate;
            if (hasDate) {
                const itemDate = new Date(hasDate);
                const startDate = dateRange.start ? new Date(dateRange.start) : null;
                const endDate = dateRange.end ? new Date(dateRange.end) : null;

                const matchesDate = (!startDate || itemDate >= startDate) && 
                                  (!endDate || itemDate <= endDate);
                return matchesSearch && matchesDate;
            }

            return matchesSearch;
        });
    };

    // Handle report selection
    const handleReportChange = (report) => {
        setSelectedReport(report);
        setReportData(dummyData[report]);
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
                            {availableReports[userRole]?.map((report) => (
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
                        />

                        {/* Date Range Filter */}
                        {selectedReport && reportColumns[selectedReport]?.some(col => col.type === 'date' || col.type === 'datetime') && (
                            <div className="flex space-x-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="block h-10 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="End Date"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Report Table */}
                {selectedReport && (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                        <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                            <tr>
                                {reportColumns[selectedReport]?.map((column) => (
                                    <th key={column.key} scope="col" className="px-6 py-3">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filterData(reportData).map((row) => (
                                <tr key={row.id} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                                    {reportColumns[selectedReport]?.map((column) => (
                                        <td key={column.key} className="px-6 py-4">
                                            {row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Reports;