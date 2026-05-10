const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.buildtrack.app';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; firstName?: string; lastName?: string; companyName?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profile: Record<string, any>) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Projects
  async getProjects(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/projects?${query}`);
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(project: Record<string, any>) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Record<string, any>) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  async getProjectStats(id: string) {
    return this.request(`/projects/${id}/stats`);
  }

  // Tasks
  async getTasks(params?: { projectId?: string; status?: string; priority?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/tasks?${query}`);
  }

  async createTask(task: Record<string, any>) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Record<string, any>) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  async completeTask(id: string) {
    return this.request(`/tasks/${id}/complete`, { method: 'POST' });
  }

  // Workers
  async getWorkers(params?: { role?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/workers?${query}`);
  }

  async createWorker(worker: Record<string, any>) {
    return this.request('/workers', {
      method: 'POST',
      body: JSON.stringify(worker),
    });
  }

  async updateWorker(id: string, worker: Record<string, any>) {
    return this.request(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(worker),
    });
  }

  async deleteWorker(id: string) {
    return this.request(`/workers/${id}`, { method: 'DELETE' });
  }

  // Safety
  async getIncidents(params?: { projectId?: string; severity?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/safety/incidents?${query}`);
  }

  async createIncident(incident: Record<string, any>) {
    return this.request('/safety/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncident(id: string, incident: Record<string, any>) {
    return this.request(`/safety/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incident),
    });
  }

  async deleteIncident(id: string) {
    return this.request(`/safety/incidents/${id}`, { method: 'DELETE' });
  }

  // Inspections
  async getInspections(params?: { projectId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/inspections?${query}`);
  }

  async createInspection(inspection: Record<string, any>) {
    return this.request('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspection),
    });
  }

  async updateInspection(id: string, inspection: Record<string, any>) {
    return this.request(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inspection),
    });
  }

  async deleteInspection(id: string) {
    return this.request(`/inspections/${id}`, { method: 'DELETE' });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getActivity() {
    return this.request('/dashboard/activity');
  }

  // Punch Items
  async getPunchItems(params?: { projectId?: string; status?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/punch-items${qs}`);
  }

  async createPunchItem(data: Record<string, any>) {
    return this.request('/punch-items', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePunchItemStatus(id: string, status: string) {
    return this.request(`/punch-items/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  // Site Photos
  async getSitePhotos(params?: { projectId?: string; tag?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/site-photos${qs}`);
  }

  async createSitePhoto(data: Record<string, any>) {
    return this.request('/site-photos', { method: 'POST', body: JSON.stringify(data) });
  }

  // Delay Notes
  async getDelayNotes(params?: { projectId?: string; status?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/delay-notes${qs}`);
  }

  async createDelayNote(data: Record<string, any>) {
    return this.request('/delay-notes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDelayNoteStatus(id: string, status: string) {
    return this.request(`/delay-notes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  // RFIs
  async getRFIs(params?: { projectId?: string; status?: string; priority?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/rfis${qs}`);
  }

  async createRFI(data: Record<string, any>) {
    return this.request('/rfis', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRFI(id: string, data: Record<string, any>) {
    return this.request(`/rfis/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteRFI(id: string) {
    return this.request(`/rfis/${id}`, { method: 'DELETE' });
  }

  // Timesheets
  async getTimesheets(params?: { projectId?: string; workerId?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/timesheets${qs}`);
  }

  async createTimesheet(data: Record<string, any>) {
    return this.request('/timesheets', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTimesheet(id: string, data: Record<string, any>) {
    return this.request(`/timesheets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTimesheet(id: string) {
    return this.request(`/timesheets/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
