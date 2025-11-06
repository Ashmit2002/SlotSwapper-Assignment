import { format, parseISO } from "date-fns";
import { ArrowRightLeft, Clock, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Navbar from "../components/Navbar";

const Marketplace = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mySwappableEvents, setMySwappableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, eventsResponse] = await Promise.all([
        api.get("/swappable-slots"),
        api.get("/events"),
      ]);
      setAvailableSlots(slotsResponse.data?.data || []);
      const myEvents = eventsResponse.data?.data || [];
      setMySwappableEvents(myEvents.filter((e) => e.status === "SWAPPABLE"));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!selectedOffer) {
      alert("Please select an event to offer in exchange");
      return;
    }

    try {
      await api.post("/swap-request", {
        mySlotId: selectedOffer,
        theirSlotId: selectedSlot._id || selectedSlot.id,
        message: requestMessage,
      });

      alert("Swap request sent successfully!");
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error sending swap request:", error);
      alert(
        "Error sending swap request: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setSelectedSlot(null);
    setSelectedOffer("");
    setRequestMessage("");
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
        {}
        <div className="mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Marketplace
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Discover available time slots from other users and request swaps.
          </p>
        </div>

        {}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Available Slots
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Time slots that other users are willing to swap.
            </p>
          </div>

          {availableSlots.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {availableSlots.map((slot) => (
                <li key={slot._id || slot.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {slot.title}
                            </p>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Available
                            </span>
                          </div>
                          {slot.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {slot.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span className="mr-4">
                              By {slot.userId?.username || "Unknown User"}
                            </span>
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {format(
                              parseISO(slot.startTime),
                              "MMM dd, yyyy HH:mm"
                            )}{" "}
                            -{format(parseISO(slot.endTime), "HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleRequestSwap(slot)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          Request Swap
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No available slots
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new swappable time slots.
              </p>
            </div>
          )}
        </div>

        {}
        {showRequestModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Swap
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-900">
                  Requesting:
                </h4>
                <p className="text-sm text-gray-600">{selectedSlot?.title}</p>
                <p className="text-xs text-gray-500">
                  {selectedSlot &&
                    format(
                      parseISO(selectedSlot.startTime),
                      "MMM dd, yyyy HH:mm"
                    )}{" "}
                  -
                  {selectedSlot &&
                    format(parseISO(selectedSlot.endTime), "HH:mm")}
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select your event to offer in exchange:
                  </label>
                  {mySwappableEvents.length > 0 ? (
                    <select
                      value={selectedOffer}
                      onChange={(e) => setSelectedOffer(e.target.value)}
                      required
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose an event...</option>
                      {mySwappableEvents.map((event) => (
                        <option
                          key={event._id || event.id}
                          value={event._id || event.id}
                        >
                          {event.title} -{" "}
                          {format(parseISO(event.startTime), "MMM dd, HH:mm")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-md">
                      You don't have any swappable events. Please make some of
                      your events swappable first.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional):
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows="3"
                    placeholder="Add a message to your swap request..."
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
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
                    disabled={mySwappableEvents.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
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

export default Marketplace;
