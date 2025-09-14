import { fileApi } from './FileService';

/*
SearchResult structure (for documentation/reference):
{
  // All FileItem properties
  id: string,
  name: string,
  type: 'file' | 'folder',
  size?: number,
  created_at: string,
  updated_at?: string,
  owner?: {
    id: number,
    name: string
  },
  items?: FileItem[],
  // Additional search properties
  path: string,
  parent_path?: string
}
*/

class SearchService {
  constructor() {
    this.allFiles = new Map();
    this.flatFileList = [];
    this.isIndexing = false;
    this.lastIndexTime = 0;
    this.INDEX_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Fast indexing - only index when needed and use cached data
  async indexAllFiles(forceRefresh = false) {
    if (this.isIndexing) return;
        
    const now = Date.now();
    if (!forceRefresh && 
        this.flatFileList.length > 0 && 
        now - this.lastIndexTime < this.INDEX_CACHE_DURATION) {
      return; // Use cached index
    }
        
    this.isIndexing = true;
    try {
      this.allFiles.clear();
      this.flatFileList = [];
            
      // Only index root level initially for speed
      await this.quickIndexFolder(null, '/');
      this.lastIndexTime = now;
    } finally {
      this.isIndexing = false;
    }
  }

  // Faster indexing - build flat list directly without deep recursion
  async quickIndexFolder(parentId, path) {
    try {
      const files = await fileApi.listFiles(parentId);
      this.allFiles.set(parentId || 'root', files);

      // Build flat list for faster searching
      for (const file of files) {
        this.flatFileList.push({
          ...file,
          path: `${path}${file.name}${file.type === 'folder' ? '/' : ''}`,
          parent_path: path
        });

        // Only index first level subfolders to avoid deep recursion
        if (file.type === 'folder' && path === '/') {
          const subPath = `${path}${file.name}/`;
          const subFiles = await fileApi.listFiles(file.id);
          this.allFiles.set(file.id, subFiles);
                    
          for (const subFile of subFiles) {
            this.flatFileList.push({
              ...subFile,
              path: `${subPath}${subFile.name}${subFile.type === 'folder' ? '/' : ''}`,
              parent_path: subPath
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to index folder ${path}:`, error);
    }
  }

  // Fast search using pre-built flat list
  search(query) {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results = this.flatFileList.filter(file => 
      file.name.toLowerCase().includes(searchTerm)
    );

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
    this.flatFileList = [];
    this.lastIndexTime = 0;
  }
}

export const searchService = new SearchService();