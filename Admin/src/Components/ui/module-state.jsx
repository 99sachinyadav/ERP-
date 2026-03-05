import React from "react";

const stateStyles = {
  loading: {
    box: "border-blue-200 bg-blue-50",
    icon: "ri-loader-4-line text-blue-600 animate-spin",
    title: "text-blue-900",
    message: "text-blue-700",
    defaultTitle: "Loading data...",
  },
  empty: {
    box: "border-slate-200 bg-slate-50",
    icon: "ri-inbox-2-line text-slate-500",
    title: "text-slate-800",
    message: "text-slate-600",
    defaultTitle: "No records found",
  },
  error: {
    box: "border-red-200 bg-red-50",
    icon: "ri-error-warning-line text-red-600",
    title: "text-red-900",
    message: "text-red-700",
    defaultTitle: "Something went wrong",
  },
};

const ModuleState = ({
  type = "empty",
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const style = stateStyles[type] || stateStyles.empty;

  return (
    <div className={`w-full rounded-xl border p-6 text-center ${style.box}`}>
      <i className={`${style.icon} text-3xl`}></i>
      <h3 className={`mt-3 text-lg font-semibold ${style.title}`}>
        {title || style.defaultTitle}
      </h3>
      {message ? <p className={`mt-1 text-sm ${style.message}`}>{message}</p> : null}
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

export default ModuleState;
