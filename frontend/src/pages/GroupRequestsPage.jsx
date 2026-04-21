import { use, useEffect, useState } from "react";
import axios from "axios";
import useAuthUser from "../hooks/useAuthUser";
import { useParams } from "react-router";
import { axiosInstance } from "../lib/axios";
const GroupRequestsPage = () => {
    const { id: groupId } = useParams();
  const { authUser } = useAuthUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH REQUESTS
  useEffect(() => {
    if (!groupId || !authUser) return;

    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.post("/group/requests", { groupId });

        setRequests(res.data.result || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [groupId, authUser]);

  // 🔥 ACCEPT REQUEST
  const handleAccept = async (requesterId) => {
    try {
      await axiosInstance.post("/group/accept-request", {
        groupId,
        requesterId,
      });

      // remove from UI instantly
      setRequests((prev) =>
        prev.filter((r) => r.requester_id !== requesterId)
      );
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading requests...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Join Requests</h2>
        <p className="text-sm text-gray-500">
          Pending requests for this group
        </p>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No pending requests
        </div>
      )}

      {/* REQUEST CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {requests.map((req) => (
          <div
            key={req.requester_id}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center font-semibold">
                {req.username?.[0] || "U"}
              </div>

              <div>
                <h3 className="font-medium text-gray-800">
                  {req.username}
                </h3>
                <p className="text-xs text-gray-500">
                  {req.email}
                </p>
              </div>
            </div>

            {/* ACTION */}
            <button
              onClick={() => handleAccept(req.requester_id)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Accept Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupRequestsPage;