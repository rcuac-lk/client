import { useState, useEffect } from "react";

const Timing = () => {
    const [students, setStudents] = useState([]);
    const [events, setEvents] = useState([]);
    const [timingData, setTimingData] = useState({});

    // Function to fetch student data (to be implemented later)
    const fetchStudentData = () => {
        return [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
            { id: 3, name: "Alice Brown" },
            { id: 4, name: "Bob Johnson" },
        ];
    };

    // Function to fetch events data (to be implemented later)
    const fetchEventData = () => {
        return ["100m Freestyle", "200m Freestyle", "400m Freestyle", "100m Backstroke"];
    };

    useEffect(() => {
        setStudents(fetchStudentData());
        setEvents(fetchEventData());
    }, []);

    const handleTimingChange = (id, field, value) => {
        setTimingData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSubmit = () => {
        console.log("Submitting timing data:", timingData);
        // Replace with actual backend API call
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Enter Swim Timing</h1>
            
            <ul className="space-y-2">
                {students.map(student => (
                    <li key={student.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{student.name}</span>
                        <select 
                            className="border p-2 rounded" 
                            onChange={(e) => handleTimingChange(student.id, 'event', e.target.value)}
                        >
                            <option value="">Select Event</option>
                            {events.map((event, index) => (
                                <option key={index} value={event}>{event}</option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="Time (min.sec)" 
                            className="border p-2 rounded w-24"
                            onChange={(e) => handleTimingChange(student.id, 'time', e.target.value)}
                        />
                    </li>
                ))}
            </ul>
            
            <button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" 
                onClick={handleSubmit}
            >
                Submit
            </button>
        </div>
    );
};

export default Timing;
