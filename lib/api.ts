// API client for BuildTrack backend integration
// This is a mock implementation that can be replaced with real API calls

import { Project, Task, Incident, Inspection, Worker } from '../types';

// Simulated API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    await delay();
    return [];
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    await delay();
    return data as Project;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    await delay();
    return { ...data, id } as Project;
  },

  async deleteProject(id: string): Promise<void> {
    await delay();
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    await delay();
    return [];
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    await delay();
    return data as Task;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    await delay();
    return { ...data, id } as Task;
  },

  // Safety
  async getIncidents(): Promise<Incident[]> {
    await delay();
    return [];
  },

  async createIncident(data: Partial<Incident>): Promise<Incident> {
    await delay();
    return data as Incident;
  },

  async getInspections(): Promise<Inspection[]> {
    await delay();
    return [];
  },

  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    await delay();
    return data as Inspection;
  },

  // Team
  async getWorkers(): Promise<Worker[]> {
    await delay();
    return [];
  },

  async createWorker(data: Partial<Worker>): Promise<Worker> {
    await delay();
    return data as Worker;
  },
};

export default api;
