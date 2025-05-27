import { Project as ProjectType } from './projectService';
import { Client as ClientType } from './clientService';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  clientName: string;
  department: string;
  assignedProjects: string[]; // Project IDs
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberWithProjects extends TeamMember {
  projects: ProjectType[];
  client: ClientType;
}

export class TeamService {
  private static instance: TeamService;
  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  async getAll(): Promise<TeamMember[]> {
    // TODO: Implement actual API call
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        clientName: 'Client A',
        department: 'Development',
        assignedProjects: ['proj1', 'proj2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        clientName: 'Client B',
        department: 'Design',
        assignedProjects: ['proj3'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getById(id: string): Promise<TeamMember | null> {
    const members = await this.getAll();
    return members.find(m => m.id === id) || null;
  }

  async create(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    const newMember = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // TODO: Implement actual API call
    return newMember;
  }

  async update(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    const member = await this.getById(id);
    if (!member) return null;
    
    const updatedMember = {
      ...member,
      ...data,
      updatedAt: new Date().toISOString()
    };
    // TODO: Implement actual API call
    return updatedMember;
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Implement actual API call
    return true;
  }

  async getWithProjects(id: string): Promise<TeamMemberWithProjects | null> {
    const member = await this.getById(id);
    if (!member) return null;

    // TODO: Implement actual API calls to fetch projects and client
    const projects = await projectService.getAll();
    const client = await clientService.getAll();

    return {
      ...member,
      projects: projects.filter(p => member.assignedProjects.includes(p.id)),
      client: client.find(c => c.name === member.clientName) || {
        id: '',
        name: member.clientName,
        email: '',
        phone: '',
        address: '',
        createdAt: '',
        updatedAt: ''
      }
    };
  }
}

export const teamService = TeamService.getInstance();
