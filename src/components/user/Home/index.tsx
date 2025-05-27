'use client';

import React from 'react';
import StatsCard from './StatsCard';
import TaskList from './TaskList';

interface HomeProps {
  userName?: string;
  company?: string;
}

const Home: React.FC<HomeProps> = ({ userName = 'Amey Rathod', company = 'COMPANY B' }) => {
  const stats = [
    {
      title: 'Open Tasks',
      count: 4,
      icon: 'task',
    },
    {
      title: 'Closed Tasks',
      count: 0,
      icon: 'task-closed',
    },
    {
      title: 'Open Bugs',
      count: 0,
      icon: 'bug',
    },
    {
      title: 'Closed Bugs',
      count: 0,
      icon: 'bug-closed',
    },
    {
      title: 'Open Phases',
      count: 0,
      icon: 'phase',
    },
    {
      title: 'Closed Phases',
      count: 0,
      icon: 'phase-closed',
    },
  ];

  const tasks = [
    {
      id: '1',
      title: 'Homepage Builder',
      project: 'AuctionX',
      dueDate: '',
    },
    {
      id: '2', 
      title: 'User Login and Logout',
      project: 'AuctionX',
      dueDate: '',
    },
    {
      id: '3',
      title: 'Basic Structure of User and Front',
      project: 'AuctionX',
      dueDate: '2025-04-10',
    },
    {
      id: '4',
      title: 'User Front Structure Setup',
      project: 'AuctionX',
      dueDate: '2025-04-18',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome {userName}</h1>
        <p className="text-gray-500">Company: {company}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark shadow-default">
          <div className="border-b border-stroke dark:border-strokedark px-6 py-4">
            <h3 className="font-medium text-black dark:text-white">My Tasks</h3>
          </div>
          <div className="p-6">
            <TaskList tasks={tasks} />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark shadow-default">
          <div className="border-b border-stroke dark:border-strokedark px-6 py-4">
            <h3 className="font-medium text-black dark:text-white">My Bugs</h3>
          </div>
          <div className="p-6 flex items-center justify-center min-h-[200px] text-gray-500">
            No Bugs assigned to you yet.
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark shadow-default">
          <div className="border-b border-stroke dark:border-strokedark px-6 py-4">
            <h3 className="font-medium text-black dark:text-white">My Work Items Due Today</h3>
          </div>
          <div className="p-6">
            <TaskList tasks={[]} />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-sm border border-stroke dark:border-strokedark shadow-default">
          <div className="border-b border-stroke dark:border-strokedark px-6 py-4">
            <h3 className="font-medium text-black dark:text-white">My Overdue Work Items</h3>
          </div>
          <div className="p-6">
            <TaskList tasks={[]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
