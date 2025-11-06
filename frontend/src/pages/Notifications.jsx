import { format } from "date-fns";
import {
  ArrowRightLeft,
  Bell,
  Check,
  Clock,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Navbar from "../components/Navbar";

const Notifications = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/swap-requests");
      const all = response.data?.data || [];
     
      const token = localStorage.getItem("token");
      const currentUserId = token
        ? JSON.parse(atob(token.split(".")[1])).id
        : null;

      const incoming = all.filter(
        (r) =>
          (r.receiverId?._id || r.receiverId) === currentUserId &&
          r.status === "PENDING"
      );
      const outgoing = all.filter(
        (r) => (r.requesterId?._id || r.requesterId) === currentUserId
      );

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, status) => {
    setProcessingRequest(requestId);
    try {
      await api.post(`/swap-response/${requestId}`, {
        accept: status === "ACCEPTED",
      });
      await fetchRequests();
      alert(`Swap request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error responding to swap request:", error);
      alert(
        "Error responding to swap request: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const renderUserName = (user) => {
    if (!user) return "Unknown User";
    const fullName =
      user.fullName?.firstName && user.fullName?.lastName
        ? `${user.fullName.firstName} ${user.fullName.lastName}`
        : null;
    return fullName || user.username || "Unknown User";
  };

  const renderEventTimeRange = (event) => {
    if (!event) return null;
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return (
      <>
        <Clock className="inline h-3 w-3 mr-1" />
        {format(start, "MMM dd, yyyy HH:mm")} - {format(end, "HH:mm")}
      </>
    );
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
            Swap Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage incoming and outgoing swap requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Incoming Requests
                </h3>
                {incomingRequests.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {incomingRequests.length}
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Swap requests from other users waiting for your response.
              </p>
            </div>

            {incomingRequests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {incomingRequests.map((request) => (
                  <li key={request._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-900">
                            {renderUserName(request.requesterId)}
                          </p>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {request.status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-2">
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-900">
                              They want:
                            </p>
                            <p className="text-sm text-blue-600">
                              {request.receiverSlotId?.title || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              {renderEventTimeRange(request.receiverSlotId)}
                            </p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-900">
                              They offer:
                            </p>
                            <p className="text-sm text-green-600">
                              {request.requesterSlotId?.title || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              {renderEventTimeRange(request.requesterSlotId)}
                            </p>
                          </div>

                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message:
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {request.message}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() =>
                              handleResponse(request._id, "ACCEPTED")
                            }
                            disabled={processingRequest === request._id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleResponse(request._id, "REJECTED")
                            }
                            disabled={processingRequest === request._id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No incoming requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any pending swap requests.
                </p>
              </div>
            )}
          </div>

          {}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <ArrowRightLeft className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Outgoing Requests
                </h3>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Swap requests you've sent to other users.
              </p>
            </div>

            {outgoingRequests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {outgoingRequests.map((request) => (
                  <li key={request._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-gray-900">
                            To: {renderUserName(request.receiverId)}
                          </p>
                          <span
                            className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "ACCEPTED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-2">
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-900">
                              You requested:
                            </p>
                            <p className="text-sm text-blue-600">
                              {request.receiverSlotId?.title || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              {renderEventTimeRange(request.receiverSlotId)}
                            </p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-900">
                              You offered:
                            </p>
                            <p className="text-sm text-green-600">
                              {request.requesterSlotId?.title || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              {renderEventTimeRange(request.requesterSlotId)}
                            </p>
                          </div>

                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Your message:
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {request.message}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Sent on{" "}
                          {format(
                            new Date(request.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No outgoing requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't sent any swap requests yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
