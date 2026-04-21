import React from 'react'
// group_name, group_topics = [], group_contents = [], requires_permission = true
import useCreateGroup from "../hooks/useCreateGroup.js"
import { useState } from 'react'
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from '../store/useThemeStore.js';
const CreateGroupPage = () => {
    const [GroupData, setGroupData] = useState({
        group_name: "",
        group_topics: [],
        group_contents: [],
        requires_permission: false
    })
    const { theme } = useThemeStore();
    const [topicInput, setTopicInput] = useState("");
    const [contentInput, setContentInput] = useState("");

    const { error, isPending, createGroupMutation } = useCreateGroup();
    const handleCreate = (e) => {
        e.preventDefault();
        createGroupMutation(GroupData);
        setGroupData({
        group_name: "",
        group_topics: [],
        group_contents: [],
        requires_permission: false
    })
    };

    return (
        <div
            className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
            data-theme={theme}
        >
            <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
                    {/* <div className="mb-4 flex items-center justify-start gap-2">
                        <ShipWheelIcon className="size-9 text-primary" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                            StudySync
                        </span>
                    </div> */}

                    {/* ERROR MESSAGE IF ANY */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error.response.data.message}</span>
                        </div>
                    )}

                    <div className="w-full">
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Create a Group</h2>
                                    <p className="text-sm opacity-70">
                                        Create Groups and Top the class
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {/* FULLNAME */}
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Group Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="bajrang Dal"
                                            className="input input-bordered w-full"
                                            value={GroupData.group_name}
                                            onChange={(e) => setGroupData({ ...GroupData, group_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Group Topics</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. DSA, OS, DBMS"
                                            className="input input-bordered w-full"
                                            value={GroupData.group_topics.join(", ")}
                                            onChange={(e) =>
                                                setGroupData({
                                                    ...GroupData,
                                                    group_topics: e.target.value.split(",").map(s => s.trim())
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Group Contents</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. notes, assignments"
                                            className="input input-bordered w-full"
                                            value={GroupData.group_contents.join(", ")}
                                            onChange={(e) =>
                                                setGroupData({
                                                    ...GroupData,
                                                    group_contents: e.target.value.split(",").map(s => s.trim())
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Private</span>

                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                checked={GroupData.requires_permission}
                                                onChange={(e) =>
                                                    setGroupData({
                                                        ...GroupData,
                                                        requires_permission: e.target.checked,
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>

                                </div>

                                <button className="btn btn-primary w-full" type="submit">
                                    {isPending ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        "Create Group"
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>

                {/* SIGNUP FORM - RIGHT SIDE */}
                <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
                    <div className="max-w-md p-8">
                        {/* Illustration */}
                        <div className="relative aspect-square max-w-sm mx-auto">
                            <img src="/i2.png" alt="Language connection illustration" className="w-full h-full" />
                        </div>

                        <div className="text-center space-y-3 mt-6">
                            <h2 className="text-xl font-semibold">May this  group lead to good grades</h2>
                            <p className="opacity-70">
                                best things are done together...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateGroupPage
