import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Label } from '@/components/ui/label/Label';
import Select from '@/components/ui/select/Select';
import { teamService } from '@/services/teamService';
import { TeamMember, TeamMemberWithProjects } from '@/services/teamService';
import { Project } from '@/services/projectService';

interface AddTeamMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: TeamMember) => void;
  projects: Project[];
  editMember?: TeamMemberWithProjects;
}

const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  projects,
  editMember
}) => {
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    clientName: '',
    department: 'Development',
    assignedProjects: []
  });

  // Initialize form data with edit member if provided
  React.useEffect(() => {
    if (editMember) {
      setFormData({
        ...editMember,
        assignedProjects: editMember.assignedProjects.map(p => p.id)
      });
      setSelectedProjects(editMember.assignedProjects.map(p => p.id));
    }
  }, [editMember]);

  // Initialize form data with edit member if provided
  React.useEffect(() => {
    if (editMember) {
      setFormData({
        ...editMember,
        assignedProjects: editMember.assignedProjects.map(p => p.id)
      });
      setSelectedProjects(editMember.assignedProjects.map(p => p.id));
    }
  }, [editMember]);

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSubmit = async () => {
    // Create a new ID if not provided
    if (!formData.id) {
      formData.id = Date.now().toString();
    }

    // Update assignedProjects with the selected projects
    const assignedProjects = selectedProjects.map(id => {
      const project = projects.find((p: Project) => p.id === id);
      if (!project) {
        console.warn(`Project with ID ${id} not found`);
        return { id, name: 'Unknown Project' };
      }
      return project;
    });

    const newMember: TeamMember = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      clientName: formData.clientName || '',
      department: formData.department || 'Development',
      assignedProjects: selectedProjects || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(newMember);
    onClose();
    setFormData({
      id: '',
      name: '',
      email: '',
      clientName: '',
      department: 'Development',
      assignedProjects: []
    });
    setSelectedProjects([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">{editMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter team member name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
              placeholder="Enter client name"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleSelectChange}
              required
            >
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Management">Management</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="projects">Assigned Projects</Label>
            <Select
              id="projects"
              name="projects"
              value={selectedProjects}
              onChange={handleProjectChange}
              multiple
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!formData.name || !formData.email} onClick={handleSubmit}>
              {editMember ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTeamMemberForm;
