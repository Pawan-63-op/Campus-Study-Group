import { Link } from "react-router";
// import { LANGUAGE_TO_FLAG } from "../constants";

const GroupCard = ({ group }) => {
  return (
    <div className="card group bg-base-100 border border-base-300 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="card-body p-5">
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

          <div className="flex flex-wrap gap-2">
            {group.group_topics?.map((topic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-medium text-base-content/80"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <Link
          to={`/chat/${group._id}`}
          className="btn btn-primary btn-outline w-full"
        >
          Message
        </Link>
      </div>
    </div>
  );
};

export default GroupCard;