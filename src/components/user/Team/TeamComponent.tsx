import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Label } from '@/components/ui/label/Label';
import Select from '@/components/ui/select/Select';
import { Modal } from '@/components/ui/modal';
import { teamService } from '@/services/teamService';
import { projectService } from '@/services/projectService';
import TeamList from './TeamList';
import AddTeamMemberForm from './AddTeamMemberForm';
import { TeamMember, TeamMemberWithProjects } from '@/services/teamService';
import { Project } from '@/services/projectService';

const TeamComponent: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberWithProjects | undefined>(undefined);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await teamService.getAll();
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const allProjects = await projectService.getProjects();
        setProjects(allProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchTeamMembers();
    fetchProjects();
  }, []);

  const handleAddMember = async (member: TeamMember) => {
    try {
      await teamService.create(member);
      const updatedMembers = await teamService.getAll();
      setTeamMembers(updatedMembers);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleEditMember = async (id: string) => {
    try {
      const member = await teamService.getById(id);
      if (member) {
        setEditMember(member as TeamMemberWithProjects);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error editing team member:', error);
    }
  };

  const handleUpdateMember = async (member: TeamMember) => {
    try {
      await teamService.update(member.id, member);
      const updatedMembers = await teamService.getAll();
      setTeamMembers(updatedMembers);
      setEditMember(undefined);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await teamService.delete(id);
      const updatedMembers = await teamService.getAll();
      setTeamMembers(updatedMembers);
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team Members</h2>
        <Button 
          variant="primary" 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <span>Add Team Member</span>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-64">
            <Label htmlFor="groupBy">Group By</Label>
            <Select
              id="groupBy"
              value={groupBy || ''}
              onChange={(e) => setGroupBy(e.target.value || null)}
            >
              <option value="">None</option>
              <option value="department">Department</option>
              <option value="clientName">Client</option>
            </Select>
          </div>
        </div>

        <TeamList
          teamMembers={filteredMembers}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          groupBy={groupBy}
        />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddTeamMemberForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMember}
          projects={projects}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <AddTeamMemberForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateMember}
          projects={projects}
          editMember={editMember || undefined}
        />
      </Modal>
    </div>
  );
};

export default TeamComponent;
