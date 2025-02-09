import React, { useState } from "react";
import { useEffect } from "react";
import UserService from "../services/user.service";

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
    const ageGroups = ["Under 11", "Under 13", "Under 15", "Under 17", "Under 19"];

    // Function to fetch student data (to be implemented later)
    const fetchStudentData = () => {
        return [
            { id: 1, name: "John Doe", ageGroup: "Under 11" },
            { id: 2, name: "Jane Smith", ageGroup: "Under 13" },
            { id: 3, name: "Alice Brown", ageGroup: "Under 15" },
            { id: 4, name: "Bob Johnson", ageGroup: "Under 11" },
        ];
    };

  useEffect(() => {
    fetchFilteredUsers();
  }, [searchQuery, ageFilter]);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Attendance for {new Date().toLocaleDateString()}</h1>
            
            <div className="mb-4 flex gap-4">
                <select 
                    className="border p-2 rounded" 
                    value={selectedAgeGroup} 
                    onChange={(e) => setSelectedAgeGroup(e.target.value)}
                >
                    <option value="">All Age Groups</option>
                    {ageGroups.map((group, index) => (
                        <option key={index} value={group}>{group}</option>
                    ))}
                </select>
                
                <input 
                    type="text" 
                    placeholder="Search student..." 
                    className="border p-2 rounded w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListComponent;
