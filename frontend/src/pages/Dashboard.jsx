import { format } from "date-fns";
import { Bell, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    swappableEvents: 0,
    pendingRequests: 0,
    completedSwaps: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsResponse, swapRequestsResponse] = await Promise.all([
        api.get("/events"),
        api.get("/swap-requests"),
      ]);

      const events = eventsResponse.data?.data || [];
      const swapRequests = swapRequestsResponse.data?.data || [];

     
      const totalEvents = events.length;
      const swappableEvents = events.filter(
        (event) => event.status === "SWAPPABLE"
      ).length;
      const pendingRequests = swapRequests.filter(
        (req) => req.status === "PENDING"
      ).length;
      const completedSwaps = swapRequests.filter(
        (req) => req.status === "ACCEPTED"
      ).length;

      setStats({
        totalEvents,
        swappableEvents,
        pendingRequests,
        completedSwaps,
      });

     
      const recentEvents = events
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map((event) => ({
          type: "event",
          title: `Created event: ${event.title}`,
          date: event.createdAt,
          status: event.status,
        }));

      const recentRequests = swapRequests
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
        .map((request) => ({
          type: "swap",
          title: `Swap request ${request.status.toLowerCase()}`,
          date: request.createdAt,
          status: request.status,
        }));

      setRecentActivity(
        [...recentEvents, ...recentRequests]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Swappable Events",
      value: stats.swappableEvents,
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Bell,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed Swaps",
      value: stats.completedSwaps,
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user?.username}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your events today.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => (window.location.href = "/calendar")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>

        {}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`${card.bgColor} overflow-hidden shadow rounded-lg`}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <card.icon
                      className={`h-6 w-6 text-white ${card.color} p-1 rounded`}
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your latest events and swap requests.
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {activity.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              activity.status === "ACCEPTED"
                                ? "bg-green-100 text-green-800"
                                : activity.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : activity.status === "SWAPPABLE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {activity.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="text-sm text-gray-500">
                            {format(new Date(activity.date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Manage Events
                  </div>
                  <div className="text-sm text-gray-500">
                    View and edit your calendar
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => (window.location.href = "/calendar")}
                  className="w-full bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm font-medium hover:bg-blue-100"
                >
                  Go to Calendar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Browse Marketplace
                  </div>
                  <div className="text-sm text-gray-500">
                    Find slots to swap
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => (window.location.href = "/marketplace")}
                  className="w-full bg-green-50 text-green-600 px-3 py-2 rounded text-sm font-medium hover:bg-green-100"
                >
                  Browse Slots
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Check Requests
                  </div>
                  <div className="text-sm text-gray-500">
                    Review swap requests
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => (window.location.href = "/notifications")}
                  className="w-full bg-yellow-50 text-yellow-600 px-3 py-2 rounded text-sm font-medium hover:bg-yellow-100"
                >
                  View Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
