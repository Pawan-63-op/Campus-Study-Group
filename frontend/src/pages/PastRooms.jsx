import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    getOutgoingFriendReqs,
    getRecommendedUsers,
    getUserFriends,
    sendFriendRequest,
    createRoom,
    getUserGroups,
    deleteMyRoom,
    getPastRooms
} from "../lib/api";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";


// import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoGroupsFound";
import RoomCard from "../components/RoomCard";
const PastRooms = () => {
    const queryClient = useQueryClient();

    const { data: rooms = [], isLoading: loadingRooms } = useQuery({
        queryKey: ["MyRooms"],
        queryFn: getPastRooms,
    });






    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Past Rooms</h2>
                    <Link to="/notifications" className="btn btn-outline btn-sm">
                        <UsersIcon className="mr-2 size-4" />
                        Room requests
                    </Link>
                </div>

                {loadingRooms ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : rooms.length === 0 ? (
                    <NoFriendsFound />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rooms.map((room) => (
                            <div key={room._id}>
                                <RoomCard room={room} />
                                <div className="text-sm text-muted">Created by: {room.creator}</div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PastRooms;
