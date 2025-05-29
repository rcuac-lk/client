import React, { useState, useEffect } from 'react';
import ParentService from '../services/parent.service';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

const StudentManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await ParentService.getStudents(AuthService.getCurrentUser().id);
      if (response.status === 200) {
        setStudents(response.data);
      }
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const openEditModal = async (id) => {
    try {
      // First set the modal to open and initialize with existing data
      setIsEditModalOpen(true);
      
      // If we already have the student data, use it
      if (selectedStudent) {
        setFormData({
          admissionNumber: selectedStudent.AdmissionNumber || '',
          firstName: selectedStudent.FirstName || '',
          lastName: selectedStudent.LastName || '',
          dateOfBirth: selectedStudent.DOB ? new Date(selectedStudent.DOB).toISOString().split('T')[0] : ''
        });
        return;
      }

      // If we don't have the data, fetch it
      const response = await UserService.getStudentById(id);
      if (response && response.data) {
        setSelectedStudent(response.data);
        setFormData({
          admissionNumber: response.data.AdmissionNumber || '',
          firstName: response.data.FirstName || '',
          lastName: response.data.LastName || '',
          dateOfBirth: response.data.DOB ? new Date(response.data.DOB).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Close the modal if there's an error
      setIsEditModalOpen(false);
      // Show error message to user
      setFormErrors({
        submit: 'Failed to load student details. Please try again.'
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    // Check if values exist and are not empty strings
    if (!formData.admissionNumber || String(formData.admissionNumber).trim() === '') {
      errors.admissionNumber = 'Admission Number is required';
    }
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'First Name is required';
    }
    if (!formData.lastName || formData.lastName.trim() === '') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const parentId = AuthService.getCurrentUser();
      const data = {
        admissionNumber: String(formData.admissionNumber).trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        parentId: parentId.id
      };
      const response = await ParentService.addStudent(data);
      
      if (response.status === 200) {
        setIsModalOpen(false);
        setFormData({
          admissionNumber: '',
          firstName: '',
          lastName: '',
          dateOfBirth: ''
        });
        setFormErrors({});
        fetchStudents();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Failed to add student. Please try again.';
      
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

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    
    const hasChanges = 
      formData.admissionNumber.trim() !== selectedStudent.AdmissionNumber.toString().trim() ||
      formData.firstName.trim() !== selectedStudent.FirstName.trim() ||
      formData.lastName.trim() !== selectedStudent.LastName.trim() ||
      formData.dateOfBirth !== new Date(selectedStudent.DOB).toISOString().split('T')[0];

    if (!hasChanges) {
      setFormErrors({
        submit: 'No changes were made to update'
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const changes = [];
    if (formData.admissionNumber.trim() !== selectedStudent.AdmissionNumber.toString().trim()) {
      changes.push(`Admission Number: ${selectedStudent.AdmissionNumber} → ${formData.admissionNumber.trim()}`);
    }
    if (formData.firstName.trim() !== selectedStudent.FirstName.trim()) {
      changes.push(`First Name: ${selectedStudent.FirstName} → ${formData.firstName.trim()}`);
    }
    if (formData.lastName.trim() !== selectedStudent.LastName.trim()) {
      changes.push(`Last Name: ${selectedStudent.LastName} → ${formData.lastName.trim()}`);
    }
    if (formData.dateOfBirth !== new Date(selectedStudent.DOB).toISOString().split('T')[0]) {
      changes.push(`Date of Birth: ${new Date(selectedStudent.DOB).toLocaleDateString()} → ${new Date(formData.dateOfBirth).toLocaleDateString()}`);
    }

    const changesSummary = changes.join('\n');
    console.log('Changes made:', changesSummary);

    try {
      const data = {
        admissionNumber: String(formData.admissionNumber).trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        comment: changesSummary
      };

      const response = await ParentService.updateStudent(selectedStudent.StudentID, data);
      
      if (response.status === 200) {
        // Update the selected student with new data
        setSelectedStudent(prev => ({
          ...prev,
          AdmissionNumber: data.admissionNumber,
          FirstName: data.firstName,
          LastName: data.lastName,
          DOB: data.dateOfBirth
        }));
        
        setIsEditModalOpen(false);
        setFormData({
          admissionNumber: '',
          firstName: '',
          lastName: '',
          dateOfBirth: ''
        });
        setFormErrors({});
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating student:', error);
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

  const handleEditClick = () => {
    if (selectedStudent && selectedStudent.StudentID) {
      openEditModal(selectedStudent.StudentID);
    } else {
      setFormErrors({
        submit: 'No student selected'
      });
    }
  };

  return (
    <div className="relative overflow-x-auto mt-16 flex">
      {/* Main Content Area - 80% width */}
      <div className="w-4/5 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Student Management</h2>
          <button
            onClick={() => {
              setFormData({
                admissionNumber: '',
                firstName: '',
                lastName: '',
                dateOfBirth: ''
              });
              setFormErrors({});
              setIsModalOpen(true);
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add Student
          </button>
        </div>

        {/* Student Details Area */}
        <div className="bg-white rounded-lg shadow p-6 h-[calc(100vh-200px)]">
          {selectedStudent ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Student Details</h3>
                <button
                  onClick={handleEditClick}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Edit Profile
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Admission Number</h4>
                    <p className="mt-1 text-lg">{selectedStudent.AdmissionNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                    <p className="mt-1 text-lg">{new Date(selectedStudent.DOB).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">First Name</h4>
                    <p className="mt-1 text-lg">{selectedStudent.FirstName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Name</h4>
                    <p className="mt-1 text-lg">{selectedStudent.LastName}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a student to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Student List Panel - 20% width */}
      <div className="w-1/5 bg-white border-l p-4">
        <h3 className="text-xl font-semibold mb-4">Students</h3>
        {students.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-2">No students added yet</p>
            <p className="text-sm text-gray-400">Click "Add Student" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                className={`border rounded-lg p-3 cursor-pointer transition-colors relative ${
                  selectedStudent?._id === student._id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                {selectedStudent?._id === student._id && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
                    <div className="absolute right-3 top-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {student.FirstName} {student.LastName}
                    </h4>
                    {!student.Approved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Admission: {student.AdmissionNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      DOB: {new Date(student.DOB).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Student
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormErrors({});
                  }}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
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
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormErrors({});
                  }}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-2xl max-h-full">
            <form onSubmit={handleUpdateStudent} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Student Profile
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormErrors({});
                  }}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
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
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormErrors({});
                  }}
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
  );
};

export default StudentManagement; 