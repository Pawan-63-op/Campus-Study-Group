import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios.js";
import { useParams } from "react-router-dom";

import SessionCard from "../components/SessionCard.jsx";
import NoGroupsFound from "../components/NoGroupsFound.jsx";
import ChatLoader from "../components/ChatLoader.jsx"
const SessionGrid = ({ sessions }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
            ))}
        </div>
    );
};
const ViewSessionsPage = () => {
    const { groupId } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sessions", groupId],
        queryFn: async () => {
            const [ongoing, completed, upcoming] = await Promise.all([
                axiosInstance.get("/sessions/get-ongoing-sessions", {
                    params: { groupChatId: groupId }
                }),
                axiosInstance.get("/sessions/completed-sessions", {
                    params: { groupChatId: groupId }
                }),
                axiosInstance.get("/sessions/upcoming-sessions", {
                    params: { groupChatId: groupId }
                })
            ]);

            return {
                ongoingSessions: ongoing.data.result,
                completedSessions: completed.data.result,
                upcomingSessions: upcoming.data.result
            };
        },
        enabled: !!groupId // prevents undefined calls
    });

    const ongoingSessions = data?.ongoingSessions || [];
    const upcomingSessions = data?.upcomingSessions || [];
    const completedSessions = data?.completedSessions || [];

    return (
        <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto space-y-10">

                {/* ERROR */}
                {error && (
                    <div className="alert alert-error">
                        <span>Failed to load sessions</span>
                    </div>
                )}

                {/* ================= ONGOING ================= */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Ongoing Sessions
                </h2>

                {isLoading ? (
                    <ChatLoader />
                ) : ongoingSessions.length === 0 ? (
                    <NoGroupsFound />
                ) : (
                    <SessionGrid sessions={ongoingSessions} />
                )}

                {/* ================= UPCOMING ================= */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Upcoming Sessions
                </h2>

                {isLoading ? (
                    <ChatLoader />
                ) : upcomingSessions.length === 0 ? (
                    <NoGroupsFound />
                ) : (
                    <SessionGrid sessions={upcomingSessions} />
                )}

                {/* ================= COMPLETED ================= */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Completed Sessions
                </h2>

                {isLoading ? (
                    <ChatLoader />
                ) : completedSessions.length === 0 ? (
                    <NoGroupsFound />
                ) : (
                    <SessionGrid sessions={completedSessions} />
                )}

            </div>
        </div>
    );
};

export default ViewSessionsPage;