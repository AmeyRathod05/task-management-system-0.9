// Service provider to switch between real and mock services
import projectService from './projectService';
import mockProjectService from './mockProjectService';
import taskService from './taskService';
import mockTaskService from './mockTaskService';

// Set to true to use mock services, false to use real services
const USE_MOCK_SERVICES = true;

// Export the appropriate services based on the flag
export const getProjectService = () => {
  return USE_MOCK_SERVICES ? mockProjectService : projectService;
};

export const getTaskService = () => {
  return USE_MOCK_SERVICES ? mockTaskService : taskService;
};
