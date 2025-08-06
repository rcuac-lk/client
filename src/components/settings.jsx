import React, { useState, useEffect } from "react";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("sessions");
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ EventName: "" });

  const [lengths, setLengths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isAddLengthModalOpen, setIsAddLengthModalOpen] = useState(false);
  const [isEditLengthModalOpen, setIsEditLengthModalOpen] = useState(false);
  const [isDeleteLengthModalOpen, setIsDeleteLengthModalOpen] = useState(false);
  const [selectedLength, setSelectedLength] = useState(null);
  const [lengthForm, setLengthForm] = useState({ length: "" });

  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({ sessionName: "", description: "", date: "", eventTypes: [], distances: [] });
  const [isSessionDetailsModalOpen, setIsSessionDetailsModalOpen] = useState(false);
  const [detailsSession, setDetailsSession] = useState(null);
  const [addSessionHasDate, setAddSessionHasDate] = useState(false);
  const [editSessionHasDate, setEditSessionHasDate] = useState(false);
  const [addSessionDateError, setAddSessionDateError] = useState("");
  const [editSessionDateError, setEditSessionDateError] = useState("");

  // Add error states
  const [addEventError, setAddEventError] = useState("");
  const [editEventError, setEditEventError] = useState("");
  const [addLengthError, setAddLengthError] = useState("");
  const [editLengthError, setEditLengthError] = useState("");
  const [addSessionError, setAddSessionError] = useState("");
  const [editSessionError, setEditSessionError] = useState("");

  // Fetch events, lengths, and sessions from API
  useEffect(() => {
    fetchEvents();
    fetchLengths();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await UserService.getSession();
      console.log("sessions ", res.data);
      setSessions(res.data.sessions || []);
    } catch (err) {
      setSessions([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await UserService.getEventTypes();
      console.log("events ", res.data);
      setEvents(res.data.eventTypes);
    } catch (err) {
      setEvents([]);
    }
  };

  const fetchLengths = async () => {
    try {
      const res = await UserService.getEventLengths();
      console.log("lengths ", res.data);
      setLengths(res.data.eventLengths);
    } catch (err) {
      setLengths([]);
    }
  };

  // Handlers for Add/Edit
  const openAddModal = () => {
    setForm({ EventName: "" });
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setForm({ EventName: event.EventType });
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);
  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Form change
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add event
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddEventError("");
    try {
      await UserService.addEvent(form);
      fetchEvents();
      closeAddModal();
    } catch (err) {
      setAddEventError(err?.response?.data?.message || "Failed to add event.");
    }
  };

  // Edit event
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditEventError("");
    try {
      await UserService.updateEvent(selectedEvent.EventTypeID, form);
      fetchEvents();
      closeEditModal();
    } catch (err) {
      setEditEventError(err?.response?.data?.message || "Failed to update event.");
    }
  };

  // Delete event
  const handleDelete = async () => {
    try {
      await UserService.deactivateEvent(selectedEvent.EventTypeID);
      fetchEvents();
      closeDeleteModal();
    } catch (err) {
      // handle error
    }
  };

  // Length handlers
  const openAddLengthModal = () => { setLengthForm({ length: "" }); setIsAddLengthModalOpen(true); };
  const closeAddLengthModal = () => setIsAddLengthModalOpen(false);
  const openEditLengthModal = (length) => { setSelectedLength(length); setLengthForm({ length: length.EventLength.replace('m', '') }); setIsEditLengthModalOpen(true); };
  const closeEditLengthModal = () => setIsEditLengthModalOpen(false);
  const openDeleteLengthModal = (length) => { setSelectedLength(length); setIsDeleteLengthModalOpen(true); };
  const closeDeleteLengthModal = () => setIsDeleteLengthModalOpen(false);
  const handleLengthFormChange = (e) => setLengthForm({ ...lengthForm, [e.target.name]: e.target.value });
  const handleAddLength = async (e) => {
    e.preventDefault();
    setAddLengthError("");
    try {
      await UserService.addDistance(lengthForm);
      fetchLengths();
      closeAddLengthModal();
    } catch (err) {
      setAddLengthError(err?.response?.data?.message || "Failed to add length.");
    }
  };
  const handleEditLength = async (e) => {
    e.preventDefault();
    setEditLengthError("");
    try {
      await UserService.updateDistance(selectedLength.EventLengthID, lengthForm);
      fetchLengths();
      closeEditLengthModal();
    } catch (err) {
      setEditLengthError(err?.response?.data?.message || "Failed to update length.");
    }
  };
  const handleDeleteLength = async () => {
    try {
      await UserService.deactivateDistance(selectedLength.EventLengthID);
      fetchLengths();
      closeDeleteLengthModal();
    } catch (err) {
      // handle error
    }
  };

  // Session handlers
  const openAddSessionModal = () => {
    setSessionForm({ sessionName: "", description: "", date: "", eventTypes: [], distances: [] });
    setIsAddSessionModalOpen(true);
    setAddSessionHasDate(false);
    setAddSessionDateError("");
  };
  const closeAddSessionModal = () => setIsAddSessionModalOpen(false);
  const openEditSessionModal = (session) => {
    setSelectedSession(session);
    setSessionForm({
      sessionName: session.sessionName || "",
      description: session.description || "",
      date: (session.properties.dates && session.properties.dates[0]) || "",
      eventTypes: session.properties.eventTypes || [],
      distances: session.properties.distances || []
    });
    setIsEditSessionModalOpen(true);
    setEditSessionHasDate(!!((session.properties.dates && session.properties.dates[0])));
    setEditSessionDateError("");
  };
  const closeEditSessionModal = () => setIsEditSessionModalOpen(false);
  const openDeleteSessionModal = (session) => { setSelectedSession(session); setIsDeleteSessionModalOpen(true); };
  const closeDeleteSessionModal = () => setIsDeleteSessionModalOpen(false);
  const handleSessionFormChange = (e) => setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
  // For eventTypes and distances, handle as arrays of names/values
  const handleSessionEventChange = (eventName) => {
    setSessionForm((prev) => {
      const exists = prev.eventTypes.includes(eventName);
      return {
        ...prev,
        eventTypes: exists ? prev.eventTypes.filter(n => n !== eventName) : [...prev.eventTypes, eventName],
      };
    });
  };
  const handleSessionLengthChange = (distanceValue) => {
    setSessionForm((prev) => {
      const exists = prev.distances.includes(distanceValue);
      return {
        ...prev,
        distances: exists ? prev.distances.filter(n => n !== distanceValue) : [...prev.distances, distanceValue],
      };
    });
  };
  const handleAddSession = async (e) => {
    e.preventDefault();
    setAddSessionDateError("");
    setAddSessionError("");
    if (addSessionHasDate && !sessionForm.date) {
      setAddSessionDateError("Please select a date for the session.");
      return;
    }
    // Map event names and distance values to IDs
    const eventTypeIds = events
      .filter(ev => sessionForm.eventTypes.includes(ev.EventType))
      .map(ev => ev.EventTypeID);
    const distanceIds = lengths
      .filter(len => sessionForm.distances.includes(len.EventLength))
      .map(len => len.EventLengthID);
    const userId = await AuthService.getCurrentUser();
    const sessionToAdd = {
      sessionName: sessionForm.sessionName,
      description: sessionForm.description,
      eventTypes: eventTypeIds,
      distances: distanceIds,
      date: addSessionHasDate ? sessionForm.date : "",
      createdByUser: userId.id
    };
    try {
      await UserService.addSession(sessionToAdd);
      await fetchSessions();
      closeAddSessionModal();
    } catch (err) {
      setAddSessionError(err?.response?.data?.message || "Failed to add session.");
    }
  };
  const handleEditSession = async (e) => {
    e.preventDefault();
    setEditSessionDateError("");
    setEditSessionError("");
    if (editSessionHasDate && !sessionForm.date) {
      setEditSessionDateError("Please select a date for the session.");
      return;
    }
    // Map event names and distance values to IDs
    const eventTypeIds = events
      .filter(ev => sessionForm.eventTypes.includes(ev.EventType))
      .map(ev => ev.EventTypeID);
    const distanceIds = lengths
      .filter(len => sessionForm.distances.includes(len.EventLength))
      .map(len => len.EventLengthID);
    const sessionToEdit = {
      sessionId: selectedSession.id,
      sessionName: sessionForm.sessionName,
      description: sessionForm.description,
      eventTypes: eventTypeIds,
      distances: distanceIds,
      date: editSessionHasDate ? sessionForm.date : ""
    };
    try {
      await UserService.modifySession(sessionToEdit);
      await fetchSessions();
      closeEditSessionModal();
    } catch (err) {
      setEditSessionError(err?.response?.data?.message || "Failed to update session.");
    }
  };
  const handleDeleteSession = async () => {
    try {
      await UserService.deleteSession(selectedSession.id);
      await fetchSessions();
      closeDeleteSessionModal();
    } catch (err) {
      // handle error
    }
  };

  const openSessionDetailsModal = (session) => {
    setDetailsSession(session);
    setIsSessionDetailsModalOpen(true);
  };
  const closeSessionDetailsModal = () => {
    setIsSessionDetailsModalOpen(false);
    setDetailsSession(null);
  };

  return (
    <div className="container mx-auto">
      <div className="mt-16">
        {/* Tabs */}
        <div className="flex mb-4 bg-gray-900 rounded-lg overflow-hidden shadow border border-gray-700">
          <button
            className={`px-6 py-3 text-sm font-medium focus:outline-none transition-colors duration-200
              ${activeTab === "sessions"
                ? "text-white bg-gray-800 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800"}
            `}
            onClick={() => setActiveTab("sessions")}
            style={{ minWidth: 120 }}
          >
            Sessions
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium focus:outline-none transition-colors duration-200
              ${activeTab === "events"
                ? "text-white bg-gray-800 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800"}
            `}
            onClick={() => setActiveTab("events")}
            style={{ minWidth: 120 }}
          >
            Events
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium focus:outline-none transition-colors duration-200
              ${activeTab === "length"
                ? "text-white bg-gray-800 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800"}
            `}
            onClick={() => setActiveTab("length")}
            style={{ minWidth: 120 }}
          >
            Length
          </button>
        </div>
        {/* Events Table */}
        {activeTab === "events" && (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gray-900">
            <div className="flex justify-between items-center py-4 px-4">
              <h1 className="text-xl font-semibold text-white">Events</h1>
              <button
                onClick={openAddModal}
                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Add Event
              </button>
            </div>
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Event Name</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={event.EventTypeID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                    <td className="px-6 py-4 text-white">{idx + 1}</td>
                    <td className="px-6 py-4 text-white">{event.EventType}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row gap-x-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(event)}
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Length Table */}
        {activeTab === "length" && (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gray-900">
            <div className="flex justify-between items-center py-4 px-4">
              <h1 className="text-xl font-semibold text-white">Length</h1>
              <button
                onClick={openAddLengthModal}
                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Add Length
              </button>
            </div>
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Length</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {lengths.map((length, idx) => (
                  <tr key={length.EventLengthID} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                    <td className="px-6 py-4 text-white">{idx + 1}</td>
                    <td className="px-6 py-4 text-white">{length.EventLength}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row gap-x-2">
                        <button
                          onClick={() => openEditLengthModal(length)}
                          className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteLengthModal(length)}
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lengths.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                      No lengths found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Sessions Table */}
        {activeTab === "sessions" && (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-gray-900">
            <div className="flex justify-between items-center py-4 px-4">
              <h1 className="text-xl font-semibold text-white">Sessions</h1>
              <button
                onClick={openAddSessionModal}
                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                Add Session
              </button>
            </div>
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Session Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, idx) => (
                  <tr key={session.id} className="bg-gray-800 border-gray-700 hover:bg-gray-600">
                    <td className="px-6 py-4 text-white">{idx + 1}</td>
                    <td className="px-6 py-4 text-white">{session.sessionName}</td>
                    <td className="px-6 py-4">{session.description}</td>
                    <td className="px-6 py-4">{(session.properties.dates && session.properties.dates[0]) || <span className="italic text-gray-400">N/A</span>}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openSessionDetailsModal(session)}
                        className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                      >
                        View More Details
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row gap-x-2">
                        <button
                          onClick={() => openEditSessionModal(session)}
                          className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteSessionModal(session)}
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                      No sessions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form
              onSubmit={handleAdd}
              className="relative bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Event
                </h3>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Event Name</label>
                  <input
                    type="text"
                    name="EventName"
                    value={form.EventName}
                    onChange={handleFormChange}
                    required
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                {addEventError && <div className="text-red-500 text-sm mb-2">{addEventError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button
                  type="submit"
                  className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form
              onSubmit={handleEdit}
              className="relative bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Event
                </h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Event Name</label>
                  <input
                    type="text"
                    name="EventName"
                    value={form.EventName}
                    onChange={handleFormChange}
                    required
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
                {editEventError && <div className="text-red-500 text-sm mb-2">{editEventError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button
                  type="submit"
                  className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this event?
                </h3>
                <div className="mb-4 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Name:</strong> {selectedEvent?.EventType || selectedEvent?.EventName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit/Delete Modals for Length */}
      {isAddLengthModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form
              onSubmit={handleAddLength}
              className="relative bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Length</h3>
                <button type="button" onClick={closeAddLengthModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                  <input type="text" name="length" value={lengthForm.length} onChange={handleLengthFormChange} required className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                {addLengthError && <div className="text-red-500 text-sm mb-2">{addLengthError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add</button>
                <button type="button" onClick={closeAddLengthModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditLengthModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form onSubmit={handleEditLength} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Length</h3>
                <button type="button" onClick={closeEditLengthModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                  <input type="text" name="length" value={lengthForm.length} onChange={handleLengthFormChange} required className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                {editLengthError && <div className="text-red-500 text-sm mb-2">{editLengthError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button type="submit" className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Save Changes</button>
                <button type="button" onClick={closeEditLengthModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteLengthModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button type="button" onClick={closeDeleteLengthModal} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this length?</h3>
                <div className="mb-4 text-center">
                  <p className="text-gray-600 dark:text-gray-300"><strong>Length:</strong> {selectedLength?.EventLength || selectedLength?.length}</p>
                </div>
                <button type="button" onClick={handleDeleteLength} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Yes, delete</button>
                <button type="button" onClick={closeDeleteLengthModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit/Delete Modals for Sessions */}
      {isAddSessionModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form onSubmit={handleAddSession} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Session</h3>
                <button type="button" onClick={closeAddSessionModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Session Name</label>
                  <input type="text" name="sessionName" value={sessionForm.sessionName} onChange={handleSessionFormChange} required className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                  <input type="text" name="description" value={sessionForm.description} onChange={handleSessionFormChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="addSessionHasDate"
                    checked={addSessionHasDate}
                    onChange={e => setAddSessionHasDate(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600 mr-2"
                  />
                  <label htmlFor="addSessionHasDate" className="text-gray-900 dark:text-white text-sm">Set Date for Session</label>
                </div>
                {addSessionHasDate && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                  <input type="date" name="date" value={sessionForm.date} onChange={handleSessionFormChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                )}
                {addSessionHasDate && addSessionDateError && (
                  <div className="text-red-500 text-sm mb-2">{addSessionDateError}</div>
                )}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Event Types</label>
                  <div className="flex flex-wrap gap-2">
                    {events.map(ev => (
                      <label key={ev.EventTypeID} className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={sessionForm.eventTypes.includes(ev.EventType)}
                          onChange={() => handleSessionEventChange(ev.EventType)}
                          className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-900 dark:text-white text-sm">{ev.EventType}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                  <div className="flex flex-wrap gap-2">
                    {lengths.map(len => (
                      <label key={len.EventLengthID} className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={sessionForm.distances.includes(len.EventLength)}
                          onChange={() => handleSessionLengthChange(len.EventLength)}
                          className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-900 dark:text-white text-sm">{len.EventLength}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {addSessionError && <div className="text-red-500 text-sm mb-2">{addSessionError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add</button>
                <button type="button" onClick={closeAddSessionModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditSessionModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <form onSubmit={handleEditSession} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 rounded-t border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Session</h3>
                <button type="button" onClick={closeEditSessionModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Session Name</label>
                  <input type="text" name="sessionName" value={sessionForm.sessionName} onChange={handleSessionFormChange} required className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                  <input type="text" name="description" value={sessionForm.description} onChange={handleSessionFormChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="editSessionHasDate"
                    checked={editSessionHasDate}
                    onChange={e => setEditSessionHasDate(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600 mr-2"
                  />
                  <label htmlFor="editSessionHasDate" className="text-gray-900 dark:text-white text-sm">Set Date for Session</label>
                </div>
                {editSessionHasDate && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                  <input type="date" name="date" value={sessionForm.date} onChange={handleSessionFormChange} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                )}
                {editSessionHasDate && editSessionDateError && (
                  <div className="text-red-500 text-sm mb-2">{editSessionDateError}</div>
                )}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Event Types</label>
                  <div className="flex flex-wrap gap-2">
                    {events.map(ev => (
                      <label key={ev.EventTypeID} className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={sessionForm.eventTypes.includes(ev.EventType)}
                          onChange={() => handleSessionEventChange(ev.EventType)}
                          className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-900 dark:text-white text-sm">{ev.EventType}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Length</label>
                  <div className="flex flex-wrap gap-2">
                    {lengths.map(len => (
                      <label key={len.EventLengthID} className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={sessionForm.distances.includes(len.EventLength)}
                          onChange={() => handleSessionLengthChange(len.EventLength)}
                          className="form-checkbox h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-gray-900 dark:text-white text-sm">{len.EventLength}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {editSessionError && <div className="text-red-500 text-sm mb-2">{editSessionError}</div>}
              </div>
              <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                <button type="submit" className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">Save Changes</button>
                <button type="button" onClick={closeEditSessionModal} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteSessionModalOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button type="button" onClick={closeDeleteSessionModal} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this session?</h3>
                <div className="mb-4 text-center">
                  <p className="text-gray-600 dark:text-gray-300"><strong>Name:</strong> {selectedSession?.sessionName}</p>
                  <p className="text-gray-600 dark:text-gray-300"><strong>Description:</strong> {selectedSession?.description}</p>
                  {selectedSession?.properties?.dates && selectedSession.properties.dates[0] && (
                    <p className="text-gray-600 dark:text-gray-300"><strong>Date:</strong> {selectedSession.properties.dates[0]}</p>
                  )}
                </div>
                <button type="button" onClick={handleDeleteSession} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Yes, delete</button>
                <button type="button" onClick={closeDeleteSessionModal} className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Session Details Modal */}
      {isSessionDetailsModalOpen && detailsSession && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={closeSessionDetailsModal}
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Details</h3>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Event Types:</span>
                  <ul className="list-disc list-inside mt-1">
                    {detailsSession.properties.eventTypes && detailsSession.properties.eventTypes.length > 0 ? (
                      detailsSession.properties.eventTypes.map((et, i) => (
                        <li key={i} className="text-gray-900 dark:text-white">{et}</li>
                      ))
                    ) : (
                      <li className="text-gray-400">None</li>
                    )}
                  </ul>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Lengths:</span>
                  <ul className="list-disc list-inside mt-1">
                    {detailsSession.properties.distances && detailsSession.properties.distances.length > 0 ? (
                      detailsSession.properties.distances.map((d, i) => (
                        <li key={i} className="text-gray-900 dark:text-white">{d}</li>
                      ))
                    ) : (
                      <li className="text-gray-400">None</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={closeSessionDetailsModal}
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;