import { fileApi } from './FileService';

/**
 * @typedef {import('./FileService').FileItem} FileItem
 * 
 * @typedef {Object} SearchResult
 * @property {string} id - File/folder ID
 * @property {string} name - File/folder name
 * @property {'file'|'folder'} type - Item type
 * @property {number} [size] - File size in bytes (optional for folders)
 * @property {string} created_at - Creation date
 * @property {string} [updated_at] - Last update date
 * @property {Object} [owner] - File owner information
 * @property {number} owner.id - Owner ID
 * @property {string} owner.name - Owner name
 * @property {FileItem[]} [items] - Child items for folders
 * @property {string} path - Full path to the file/folder
 * @property {string} [parent_path] - Path to the parent folder
 */

class SearchService {
  constructor() {
    this.allFiles = new Map();
    this.isIndexing = false;
  }

  // Index all files across all folders
  async indexAllFiles(forceRefresh = false) {
    if (this.isIndexing) return;
        
    this.isIndexing = true;
    try {
      if (!forceRefresh && this.allFiles.size > 0) {
        return; // Already indexed
      }

      this.allFiles.clear();
      await this.indexFolder(null, '/');
    } finally {
      this.isIndexing = false;
    }
  }

  async indexFolder(parentId, path) {
    try {
      const files = await fileApi.listFiles(parentId);
      this.allFiles.set(parentId || 'root', files);

      // Recursively index subfolders
      for (const file of files) {
        if (file.type === 'folder') {
          const subPath = `${path}${file.name}/`;
          await this.indexFolder(file.id, subPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to index folder ${path}:`, error);
    }
  }

  // Global search across all indexed files
  search(query) {
    if (!query.trim()) return [];

    const results = [];
    const searchTerm = query.toLowerCase();

    for (const [parentId, files] of this.allFiles.entries()) {
      const parentPath = this.getParentPath(parentId);
            
      for (const file of files) {
        if (file.name.toLowerCase().includes(searchTerm)) {
          results.push({
            ...file,
            path: `${parentPath}${file.name}`,
            parent_path: parentPath
          });
        }
      }
    }

    // Sort by relevance (exact matches first, then by name)
    return results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm;
      const bExact = b.name.toLowerCase() === searchTerm;
            
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
            
      return a.name.localeCompare(b.name);
    });
  }

  getParentPath(parentId) {
    if (!parentId || parentId === 'root') return '/';
        
    // This is a simplified version - in a real app you'd want to
    // build proper path tracking during indexing
    return '/';
  }

  // Get folder structure for navigation
  getFolderStructure() {
    const rootFiles = this.allFiles.get('root') || [];
    return rootFiles.filter(file => file.type === 'folder');
  }

  // Clear the index
  clearIndex() {
    this.allFiles.clear();
  }
}

export const searchService = new SearchService();