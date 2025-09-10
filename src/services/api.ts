const API_BASE_URL = "http://localhost:3000/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FileItem {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: string;
  type: "document" | "zip" | "image" | "video" | "folder";
  path: string;
  starred?: boolean;
  shared?: boolean;
  trashed?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      // Return dummy data for development
      return this.getDummyResponse<T>(endpoint);
    }
  }

  private getDummyResponse<T>(endpoint: string): ApiResponse<T> {
    // Return dummy data based on endpoint
    if (endpoint.includes("/files")) {
      // Different responses based on folderId parameter
      if (endpoint.includes("folderId=f1")) {
        return {
          success: true,
          data: [
            {
              id: "f1_1",
              name: "Client A Proposal.docx",
              owner: "Me",
              lastModified: "Yesterday",
              size: "2.1 MB",
              type: "document",
              path: "/client-projects",
              starred: false,
              shared: false,
              trashed: false,
            },
            {
              id: "f1_2",
              name: "Project Timeline.xlsx",
              owner: "Me",
              lastModified: "March 24, 2024",
              size: "850 KB",
              type: "document",
              path: "/client-projects",
              starred: false,
              shared: false,
              trashed: false,
            },
          ] as T,
        };
      }
      if (endpoint.includes("folderId=f2")) {
        return {
          success: true,
          data: [
            {
              id: "f2_1",
              name: "panel Guidelines.pdf",
              owner: "Me",
              lastModified: "March 23, 2024",
              size: "3.2 MB",
              type: "document",
              path: "/marketing",
              starred: false,
              shared: false,
              trashed: false,
            },
            {
              id: "f2_2",
              name: "Campaign Assets.zip",
              owner: "Me",
              lastModified: "March 22, 2024",
              size: "12.5 MB",
              type: "zip",
              path: "/marketing",
              starred: false,
              shared: false,
              trashed: false,
            },
          ] as T,
        };
      }
      if (endpoint.includes("folderId=f3")) {
        return {
          success: true,
          data: [
            {
              id: "f3_1",
              name: "Q1 Report.pdf",
              owner: "Me",
              lastModified: "March 21, 2024",
              size: "1.8 MB",
              type: "document",
              path: "/financial",
              starred: false,
              shared: false,
              trashed: false,
            },
            {
              id: "f3_2",
              name: "Budget Analysis.xlsx",
              owner: "Me",
              lastModified: "March 20, 2024",
              size: "950 KB",
              type: "document",
              path: "/financial",
              starred: false,
              shared: false,
              trashed: false,
            },
          ] as T,
        };
      }

      return {
        success: true,
        data: [
          {
            id: "1",
            name: "Project Brief.docx",
            owner: "Me",
            lastModified: "Yesterday",
            size: "1.2 MB",
            type: "document",
            path: "/",
            starred: false,
            shared: false,
            trashed: false,
          },
          {
            id: "2",
            name: "Designs_v1.zip",
            owner: "Me",
            lastModified: "March 25, 2024",
            size: "15.8 MB",
            type: "zip",
            path: "/",
            starred: true,
            shared: false,
            trashed: false,
          },
          {
            id: "3",
            name: "logo_final.png",
            owner: "Alice Johnson",
            lastModified: "March 22, 2024",
            size: "350 KB",
            type: "image",
            path: "/",
            starred: false,
            shared: true,
            trashed: false,
          },
          {
            id: "4",
            name: "Kickoff_Meeting.mp4",
            owner: "Bob Williams",
            lastModified: "March 20, 2024",
            size: "128 MB",
            type: "video",
            path: "/",
            starred: false,
            shared: false,
            trashed: false,
          },
        ] as T,
      };
    }

    if (endpoint.includes("/folders")) {
      // Different responses based on parentId parameter
      if (endpoint.includes("parentId=f1")) {
        return {
          success: true,
          data: [
            {
              id: "f1_sub1",
              name: "Active Projects",
              path: "/client-projects/active",
              parentId: "f1",
              createdAt: "2024-03-05",
              updatedAt: "2024-03-05",
            },
            {
              id: "f1_sub2",
              name: "Completed Projects",
              path: "/client-projects/completed",
              parentId: "f1",
              createdAt: "2024-03-06",
              updatedAt: "2024-03-06",
            },
          ] as T,
        };
      }
      if (endpoint.includes("parentId=f2")) {
        return {
          success: true,
          data: [
            {
              id: "f2_sub1",
              name: "Social Media",
              path: "/marketing/social",
              parentId: "f2",
              createdAt: "2024-03-07",
              updatedAt: "2024-03-07",
            },
          ] as T,
        };
      }

      return {
        success: true,
        data: [
          {
            id: "f1",
            name: "Client Projects",
            path: "/client-projects",
            createdAt: "2024-03-01",
            updatedAt: "2024-03-01",
          },
          {
            id: "f2",
            name: "Marketing Materials",
            path: "/marketing",
            createdAt: "2024-03-02",
            updatedAt: "2024-03-02",
          },
          {
            id: "f3",
            name: "Financial Reports",
            path: "/financial",
            createdAt: "2024-03-03",
            updatedAt: "2024-03-03",
          },
        ] as T,
      };
    }

    return {
      success: true,
      data: {} as T,
      message: "Dummy response - backend not connected",
    };
  }

  // File operations
  async getFiles(folderId?: string): Promise<ApiResponse<FileItem[]>> {
    return this.request<FileItem[]>(
      `/files${folderId ? `?folderId=${folderId}` : ""}`
    );
  }

  async uploadFile(
    file: File,
    folderId?: string
  ): Promise<ApiResponse<FileItem>> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);

    return this.request<FileItem>("/files/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}`, {
      method: "DELETE",
    });
  }

  async moveToTrash(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/trash`, {
      method: "PUT",
    });
  }

  async starFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/star`, {
      method: "PUT",
    });
  }

  async shareFile(fileId: string, email: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/share`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Folder operations
  async getFolders(parentId?: string): Promise<ApiResponse<FolderItem[]>> {
    return this.request<FolderItem[]>(
      `/folders${parentId ? `?parentId=${parentId}` : ""}`
    );
  }

  async createFolder(
    name: string,
    parentId?: string
  ): Promise<ApiResponse<FolderItem>> {
    return this.request<FolderItem>("/folders", {
      method: "POST",
      body: JSON.stringify({ name, parentId }),
    });
  }

  async deleteFolder(folderId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/folders/${folderId}`, {
      method: "DELETE",
    });
  }

  // Search
  async searchFiles(query: string): Promise<ApiResponse<FileItem[]>> {
    return this.request<FileItem[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Starred files
  async getStarredFiles(): Promise<ApiResponse<FileItem[]>> {
    return this.request<FileItem[]>("/files/starred");
  }

  // Shared files
  async getSharedFiles(): Promise<ApiResponse<FileItem[]>> {
    return this.request<FileItem[]>("/files/shared");
  }

  // Trash
  async getTrashedFiles(): Promise<ApiResponse<FileItem[]>> {
    return this.request<FileItem[]>("/files/trash");
  }

  async restoreFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/restore`, {
      method: "PUT",
    });
  }

  async moveFile(fileId: string, folderId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/move`, {
      method: "PUT",
      body: JSON.stringify({ folderId }),
    });
  }

  async downloadFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/files/${fileId}/download`, {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
