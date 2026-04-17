import { Link } from "react-router";

const GroupCardAdmin = ({ group }) => {
  return (
    <div className="card group bg-base-100 border border-base-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full">
      
      {/* Make card-body flex column */}
      <div className="card-body p-5 flex flex-col h-full">
        
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-tight truncate">
              {group.group_name}
            </h3>
            <div className="mt-1 h-1 w-12 rounded-full bg-primary/40" />
          </div>

          {/* Topics */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-content/60">
              Topics
            </p>

            <div className="flex flex-wrap gap-2 max-h-20 overflow-hidden">
              {group.group_topics?.length > 0 ? (
                group.group_topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-medium text-base-content/80"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-base-content/50">
                  No topics
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons pinned to bottom */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={`/chat/${group._id}`}
            className="btn btn-primary btn-outline w-full"
          >
            Manage Messages 
          </Link>

          <Link
            to={`/AddSessions/${group._id}`}
            className="btn btn-primary btn-outline w-full"
          >
            Add Session
          </Link>
        </div>

      </div>
    </div>
  );
};

export default GroupCardAdmin;