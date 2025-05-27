import React from "react";
import { BiAlarm, BiInfoCircle, BiTask, BiTaskX } from "react-icons/bi";
import { FaBug, FaBugSlash } from "react-icons/fa6";
import { FaRegCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";


interface StatsCardProps {
  title: string;
  count: number;
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon }) => {
  const getIcon = (size: number) => {
    switch (icon) {
      case 'task':
        return (
          <BiTask className={`w-${size} h-${size}`}/>
        );
      case 'task-closed':
        return (
          <BiTaskX className={`w-${size} h-${size}`}/>
        );
      case 'info':
        return (
          <BiInfoCircle className={`w-${size} h-${size}`}/>
        );
      case 'bug':
        return (
          <FaBug className={`w-${size} h-${size}`}/>
        );
      case 'bug-closed':
        return (
          <FaBugSlash className={`w-${size} h-${size}`}/>
        );
      case 'phase':
        return (
          <FaRegCalendarAlt className={`w-${size} h-${size}`}/>
        );
      case 'phase-closed':
        return (
          <FaRegCalendarCheck className={`w-${size} h-${size}`}/>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between text-center">
        <div>
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{count}</div>
          <h4 className="mb-1 font-medium text-gray-800 text-lg dark:text-white/90">{title}</h4>
        </div>
        <div className="text-blue-500">
          {getIcon(8)}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
