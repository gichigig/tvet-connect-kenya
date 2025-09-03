/**
 * R2 File Manager Component
 * Displays and manages uploaded files stored in Cloudflare R2
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Share, 
  Trash2,
  File,
  FileText,
  Image,
  Archive,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useR2Storage } from '@/hooks/useR2Storage';
import { cn } from '@/lib/utils';

interface FileItem {
  key: string;
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
  category?: 'assignment' | 'material' | 'submission' | 'notes';
  unitId?: string;
  unitCode?: string;
  mimeType?: string;
}

interface R2FileManagerProps {
  /** Array of files to display */
  files: FileItem[];
  /** Title of the file manager */
  title?: string;
  /** Description of the file manager */
  description?: string;
  /** Allow file deletion */
  allowDelete?: boolean;
  /** Allow file sharing */
  allowShare?: boolean;
  /** Allow file preview */
  allowPreview?: boolean;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Callback when file is deleted */
  onFileDelete?: (fileKey: string) => void;
  /** Callback when file is shared */
  onFileShare?: (file: FileItem) => void;
  /** Callback when file is previewed */
  onFilePreview?: (file: FileItem) => void;
  /** Custom styling */
  className?: string;
}

export const R2FileManager: React.FC<R2FileManagerProps> = ({
  files,
  title = 'File Manager',
  description = 'Manage your uploaded files',
  allowDelete = false,
  allowShare = true,
  allowPreview = true,
  showSearch = true,
  showFilters = true,
  onFileDelete,
  onFileShare,
  onFilePreview,
  className
}) => {
  const { downloadFile, formatFileSize } = useR2Storage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (file.unitCode && file.unitCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'date':
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        default:
          return 0;
      }
    });

  // Get file type icon
  const getFileIcon = (mimeType?: string, fileName?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimeType?.includes('zip') || fileName?.endsWith('.zip')) {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle file download
  const handleDownload = async (file: FileItem) => {
    try {
      await downloadFile(file.key, file.originalName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Handle file deletion
  const handleDelete = (file: FileItem) => {
    onFileDelete?.(file.key);
  };

  // Handle file sharing
  const handleShare = (file: FileItem) => {
    onFileShare?.(file);
  };

  // Handle file preview
  const handlePreview = (file: FileItem) => {
    onFilePreview?.(file);
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'material':
        return 'bg-blue-100 text-blue-800';
      case 'submission':
        return 'bg-green-100 text-green-800';
      case 'notes':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {showFilters && (
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="material">Materials</option>
                  <option value="assignment">Assignments</option>
                  <option value="submission">Submissions</option>
                  <option value="notes">Notes</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload some files to get started'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div key={file.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.mimeType, file.fileName)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h4>
                      {file.category && (
                        <Badge className={cn('text-xs', getCategoryColor(file.category))}>
                          {file.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(file.uploadedAt)}
                      </span>
                      {file.unitCode && (
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {file.unitCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {allowPreview && (
                        <DropdownMenuItem onClick={() => handlePreview(file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      
                      {allowShare && (
                        <DropdownMenuItem onClick={() => handleShare(file)}>
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      )}
                      
                      {allowDelete && (
                        <DropdownMenuItem 
                          onClick={() => handleDelete(file)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
