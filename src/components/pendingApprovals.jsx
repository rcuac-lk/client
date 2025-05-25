import { useEffect, useState } from 'react';
import UserService from '../services/user.service';
import ManagerService from '../services/manager.service';
import CoachService from '../services/coach.service';

const PendingApprovalsComponent = (props) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [approvalFilter, setApprovalFilter] = useState("all");
    const [ageFilter, setAgeFilter] = useState("");
    const [ageCategories, setAgeCategories] = useState([]);
    const [formData, setFormData] = useState({
        admissionNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const userRole = props.role;
    const isAdmin = userRole === "Admin";
    const isManager = userRole === "Manager";
    const isCoach = userRole === "Coach";

    const getAgeGroups = async() => {
        const response = await UserService.ageGroups();
        setAgeCategories(response.data.data);
    }

    const validateForm = () => {
        const errors = {};
        if (!formData.admissionNumber.trim()) {
            errors.admissionNumber = 'Admission Number is required';
        }
        if (!formData.firstName.trim()) {
            errors.firstName = 'First Name is required';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last Name is required';
        }
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = 'Date of Birth is required';
        } else {
            // Calculate age
            const today = new Date();
            const birthDate = new Date(formData.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age >= 19) {
                errors.dateOfBirth = 'Student must be below 19 years old';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const openEditModal = async (id) => {
        try {
            const response = await UserService.getStudentById(id);
            setSelectedUser(response.data);
            setFormData({
                admissionNumber: response.data.AdmissionNumber,
                firstName: response.data.FirstName,
                lastName: response.data.LastName,
                dateOfBirth: new Date(response.data.DOB).toISOString().split('T')[0]
            });
            setIsEditModalOpen(true);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setFormData({
            admissionNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: ''
        });
        setFormErrors({});
    };

    const openConfirmModal = (user) => {
        setSelectedUser(user);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedUser(null);
    };

    const openRejectModal = (user) => {
        setSelectedUser(user);
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setSelectedUser(null);
    };

    const handleApprove = async () => {
        try {
            await UserService.approveStudent(selectedUser.StudentID);
            closeConfirmModal();
            notApprovedUsers();
        } catch (error) {
            console.error("Error approving user:", error);
        }
    };

    const handleReject = async () => {
        try {
            await UserService.rejectStudent(selectedUser.StudentID);
            closeRejectModal();
            notApprovedUsers();
        } catch (error) {
            console.error("Error rejecting user:", error);
        }
    };

    const saveChanges = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const data = {
                admissionNumber: formData.admissionNumber.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                dateOfBirth: formData.dateOfBirth
            };
            await UserService.updateStudent(selectedUser.StudentID, data);
            closeEditModal();
            fetchFilteredUsers();
        } catch (error) {
            console.error("Error updating student:", error);
            const errorMessage = error.response?.data?.message || 
                             error.response?.data?.error || 
                             error.message || 
                             'Failed to update student. Please try again.';
            
            setFormErrors({
                submit: errorMessage
            });

            if (error.response?.data?.errors) {
                const fieldErrors = {};
                Object.keys(error.response.data.errors).forEach(field => {
                    fieldErrors[field] = error.response.data.errors[field];
                });
                setFormErrors(prev => ({
                    ...prev,
                    ...fieldErrors
                }));
            }
        }
    };

    const notApprovedUsers = async () => {
        try {
            const response = await UserService.getAllStudents();
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching not approved users:", error);
        }
    };

    const fetchFilteredUsers = async () => {
        try {
            const response = await UserService.getAllStudents();
            let filteredUsers = response.data;
            console.log(filteredUsers)
            // Apply search filter
            if (searchQuery) {
                filteredUsers = filteredUsers.filter(user => 
                    `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Apply approval filter
            if (approvalFilter === "pending") {
                filteredUsers = filteredUsers.filter(user => !user.Approved);
            } else if (approvalFilter === "approved") {
                filteredUsers = filteredUsers.filter(user => user.Approved);
            }

            // Apply age filter
            if (ageFilter && ageFilter !== "All Ages") {
                filteredUsers = filteredUsers.filter(user => user.AgeCategory === ageFilter);
            }

            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching filtered users:", error);
        }
    };

    useEffect(() => {
        fetchFilteredUsers();
    }, [searchQuery, approvalFilter, ageFilter]);

    useEffect(() => {
        getAgeGroups();
    }, []);

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-16">
                <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-gray-900">
                    <div className="flex space-x-4 px-2 items-center">
                        {/* Search Input */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block h-10 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search by name"
                        />
                        
                        {/* Age Group Filter */}
                        <select
                            value={ageFilter}
                            onChange={(e) => setAgeFilter(e.target.value)}
                            className="block w-52 h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
                        >
                            {ageCategories.map((category) => (
                                <option key={category.value} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Approval Status Filter */}
                        <select
                            value={approvalFilter}
                            onChange={(e) => setApprovalFilter(e.target.value)}
                            className="block w-52 h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
                        >
                            <option value="all">All Users</option>
                            <option value="pending">Pending Approval</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>
                </div>

                <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">NAME</th>
                            <th scope="col" className="px-6 py-3">AGE GROUP</th>
                            <th scope="col" className="px-6 py-3">ROLE</th>
                            <th scope="col" className="px-6 py-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.UserID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                                    <div className="ps-3">
                                        <div className="text-base font-semibold">
                                            {user.FirstName} {user.LastName}
                                        </div>
                                        <div className="font-normal text-gray-500">
                                            {user.Email}
                                        </div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">{user.AgeCategory}</td>
                                <td className="px-6 py-4">Student</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-row gap-x-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(user.StudentID)}
                                            className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                                        >
                                            Edit User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openConfirmModal(user)}
                                            disabled={user.Approved}
                                            className={`font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none min-w-[120px] text-center ${
                                                user.Approved
                                                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                                    : 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
                                            }`}
                                        >
                                            {user.Approved ? 'Approved' : 'Approve'}
                                        </button>
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => openRejectModal(user)}
                                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            >
                                                Remove User
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Confirmation Modal */}
                {isConfirmModalOpen && (
                    <div id="confirm-modal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                        <div className="relative w-full max-w-md max-h-full">
                            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <button type="button" onClick={closeConfirmModal} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="p-4 md:p-5 text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to approve this user?</h3>
                                    <button type="button" onClick={handleApprove} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Yes, approve
                                    </button>
                                    <button type="button" onClick={closeConfirmModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {isRejectModalOpen && (
                    <div id="reject-modal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                        <div className="relative w-full max-w-md max-h-full">
                            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <button type="button" onClick={closeRejectModal} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="p-4 md:p-5 text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to reject this user?</h3>
                                    <button type="button" onClick={handleReject} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Yes, reject
                                    </button>
                                    <button type="button" onClick={closeRejectModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {isEditModalOpen && (
                    <div id="editUserModal" tabIndex="-1" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                        <div className="relative w-full max-w-2xl max-h-full">
                            <form onSubmit={(e) => { e.preventDefault(); saveChanges(); }} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Edit Student Profile
                                    </h3>
                                    <button type="button" onClick={closeEditModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    {formErrors.submit && (
                                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                            <div className="flex items-center">
                                                <svg className="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                                </svg>
                                                <span>{formErrors.submit}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Admission Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="admissionNumber"
                                            value={formData.admissionNumber}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border ${formErrors.admissionNumber ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                                            required
                                        />
                                        {formErrors.admissionNumber && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{formErrors.admissionNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                                            required
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{formErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                                            required
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{formErrors.lastName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Date of Birth <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className={`bg-gray-50 border ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                                            required
                                        />
                                        {formErrors.dateOfBirth && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{formErrors.dateOfBirth}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                    <button
                                        type="submit"
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    >
                                        Update Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingApprovalsComponent;
