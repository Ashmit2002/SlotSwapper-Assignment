import { format, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  Edit3,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Navbar from "../components/Navbar";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "BUSY",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      // backend returns { success, data: events }
      setEvents(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(
          `/events/${editingEvent._id || editingEvent.id}`,
          formData
        );
      } else {
        await api.post("/events", formData);
      }
      fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(
        "Error saving event: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      status: "BUSY",
    });
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
    });
    setShowCreateModal(true);
  };

  const handleToggleSwappable = async (eventId, currentStatus) => {
    try {
      const newStatus = currentStatus === "BUSY" ? "SWAPPABLE" : "BUSY";
      await api.put(`/events/${eventId}`, { status: newStatus });
      fetchEvents();
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Error updating event status");
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Events
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your calendar events and make them available for swapping.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {events.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event._id || event.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {event.title}
                            </p>
                            <span
                              className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                event.status === "SWAPPABLE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleSwappable(
                              event._id || event.id,
                              event.status
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title={
                            event.status === "BUSY"
                              ? "Make Swappable"
                              : "Make Busy"
                          }
                        >
                          {event.status === "BUSY" ? (
                            <ToggleLeft className="h-5 w-5" />
                          ) : (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit Event"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id || event.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex items-center">
                        <p className="flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {format(
                            parseISO(event.startTime),
                            "MMM dd, yyyy HH:mm"
                          )}{" "}
                          -{format(parseISO(event.endTime), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No events
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first event.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="BUSY">Busy</option>
                      <option value="SWAPPABLE">Swappable</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      {editingEvent ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
