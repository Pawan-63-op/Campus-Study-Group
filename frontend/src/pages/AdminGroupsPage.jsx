import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import {
    getOutgoingFriendReqs,
    getRecommendedUsers,
    getUserFriends,
    sendFriendRequest,
    createRoom,
    getUserGroups,
    deleteMyRoom,
    getMyAdminGroups
} from "../lib/api.js";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";


import GroupCard from "../components/GroupCardAdmin.jsx";
import NoGroupsFound from "../components/NoGroupsFound.jsx";
import RoomCard from "../components/RoomCard.jsx";
const AdminGroupsPage = () => {
    const queryClient = useQueryClient();
    const [roomTitle, setRoomTitle] = useState("");
    const [roomLanguage, setRoomLanguage] = useState("");

    const { data: groups = [], isLoading: loadingGroups } = useQuery({
        queryKey: ["Mygroups"],
        queryFn: getMyAdminGroups,
    });

    const { mutate: createRoomMutation, isPending: creatingRoom } = useMutation({
        mutationFn: createRoom,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["MyRooms"] }) }
    });;
    const { mutate: deleteRoomMutation, isPending: deletingRoom } = useMutation({
        mutationFn: deleteMyRoom,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["MyRooms"] }) }
    });;

    const handleCreate = async (e, title, language) => {
        e.preventDefault();
        createRoomMutation({ title, language });
    }
    const handleDelete = async (e, roomID) => {
        e.preventDefault();
        deleteRoomMutation(roomID);
    }





    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Admin Groups</h2>
                </div>

                {loadingGroups ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : groups.length === 0 ? (
                    <NoGroupsFound />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groups.map((group) => (
                            <GroupCard key={group._id} group={group} />
                        ))}
                    </div>
                )}






            </div>
        </div>
    );
};

export default AdminGroupsPage;
