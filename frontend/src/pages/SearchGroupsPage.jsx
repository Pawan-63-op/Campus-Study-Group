import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";

import GroupCardSearch from "../components/GroupCardSearch.jsx";
import NoGroupsFound from "../components/NoGroupsFound.jsx";

const SearchGroupsPage = () => {
    const queryClient = useQueryClient();

    const [queryData, setQueryData] = useState({
        query: "",
    });

    const [groups, setGroups] = useState([]);

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (queryData) => {
            const response = await axiosInstance.post("/group/search", queryData);
            return response.data.result;
        },
        onSuccess: (groups) => {
            setGroups(groups);
        },
    });

    useEffect(() => {
        mutate(queryData);
    }, [queryData.query]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto space-y-10">

                {/* HEADER */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Search Groups
                </h2>

                {/* INPUT */}
                <div className="form-control w-full space-y-2">
                    <label className="label">
                        <span className="label-text">Search</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Search groups..."
                        className="input input-bordered w-full"
                        value={queryData.query}
                        onChange={(e) =>
                            setQueryData({ ...queryData, query: e.target.value })
                        }
                    />
                </div>

                {/* RESULTS */}
                {isPending ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : groups.length === 0 ? (
                    <NoGroupsFound />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groups.map((group) => (
                            <GroupCardSearch key={group._id} group={group} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default SearchGroupsPage;