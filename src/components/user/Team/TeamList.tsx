import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon, PlusIcon, ChevronDownIcon } from '@/icons';
import { TeamMember, TeamMemberWithProjects } from '@/services/teamService';
import { Project } from '@/services/projectService';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import AddTeamMemberForm from './AddTeamMemberForm';
import { teamService } from '@/services/teamService';

interface TeamListProps {
  teamMembers: (TeamMember | TeamMemberWithProjects)[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddMember?: (id: string) => void;
  groupBy?: string | null;
}

const TeamList: React.FC<TeamListProps> = ({ 
  teamMembers, 
  onEdit, 
  onDelete, 
  onAddMember,
  groupBy
}) => {
  // Group the data if groupBy is specified
  const groupedData = React.useMemo(() => {
    if (!groupBy) return null;
    
    const groups: Record<string, TeamMember[]> = {};
    teamMembers.forEach(member => {
      const groupValue = String(member[groupBy as keyof TeamMember] || 'Unknown');
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(member);
    });
    
    return groups;
  }, [teamMembers, groupBy]);

  // Render a department badge with appropriate color
  const renderDepartmentBadge = (department: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    switch (department.toLowerCase()) {
      case 'development':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'design':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'marketing':
        bgColor = 'bg-pink-100';
        textColor = 'text-pink-800';
        break;
      case 'management':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
        {department}
      </span>
    );
  };

  // Render a single team member row
  const renderMemberRow = (member: TeamMember | TeamMemberWithProjects) => {
    const projects = 'assignedProjects' in member ? member.assignedProjects : (member as TeamMemberWithProjects).projects || [];
    const hasProjects = projects.length > 0;
    
    return (
      <React.Fragment key={member.id}>
        <TableRow>
          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-gray-400/90 text-theme-sm whitespace-nowrap">
            {member.id}
          </TableCell>
          <TableCell className="px-4 py-3 font-medium text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 text-theme-sm whitespace-nowrap">
            {member.name}
          </TableCell>
          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-gray-400/90 text-theme-sm whitespace-nowrap">
            {member.email}
          </TableCell>
          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-gray-400/90 text-theme-sm whitespace-nowrap">
            {member.clientName}
          </TableCell>
          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-gray-400/90 text-theme-sm whitespace-nowrap">
            {renderDepartmentBadge(member.department)}
          </TableCell>
          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-gray-400/90 text-theme-sm whitespace-nowrap">
            <div className="flex flex-wrap gap-2">
              {projects.map((project: Project, index: number) => (
                <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {typeof project === 'object' ? project.name : project}
                </span>
              ))}
            </div>
          </TableCell>
          <TableCell className="px-2 py-3 border border-gray-100 dark:border-white/[0.05] w-20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit && onEdit(member.id)}
                className="p-1 text-gray-500 transition-colors rounded hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => onDelete && onDelete(member.id)}
                className="p-1 text-gray-500 transition-colors rounded hover:bg-gray-100 hover:text-danger-500 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <TrashBinIcon />
              </button>
            </div>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  // Render group header row
  const renderGroupHeader = (groupName: string) => (
    <TableRow key={`group-${groupName}`} className="bg-gray-100">
      <TableCell className="px-4 py-2 font-medium text-gray-800 border border-gray-200 col-span-8">
        {groupName}
      </TableCell>
    </TableRow>
  );

  return (
    <Table>
      <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">ID</span>
          </TableCell>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Name</span>
          </TableCell>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Email</span>
          </TableCell>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Client</span>
          </TableCell>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Department</span>
          </TableCell>
          <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Projects</span>
          </TableCell>
          <TableCell isHeader className="px-2 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Actions</span>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedData ? (
          // Render grouped data
          Object.entries(groupedData).map(([groupName, members]) => (
            <React.Fragment key={`group-container-${groupName}`}>
              {renderGroupHeader(groupName)}
              {members.map(member => renderMemberRow(member))}
            </React.Fragment>
          ))
        ) : (
          // Render ungrouped data
          teamMembers.map(member => renderMemberRow(member))
        )}
      </TableBody>
    </Table>
  );
};

export default TeamList;
