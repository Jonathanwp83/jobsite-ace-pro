import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { Upload, FolderOpen, FileText, Image, Video, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  size: number;
  file_type: string;
  file_url: string;
  created_at: string;
  job?: {
    title: string;
  };
}

export default function Files() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchFiles();
    }
  }, [profile?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      // Get files from job_media table
      const { data, error } = await supabase
        .from('job_media')
        .select(`
          id,
          file_url,
          file_type,
          created_at,
          job:jobs(title)
        `)
        .eq('contractor_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match FileItem interface
      const transformedFiles = data?.map(item => ({
        id: item.id,
        name: item.file_url.split('/').pop() || 'Unknown file',
        size: 0, // Size not stored in job_media table
        file_type: item.file_type,
        file_url: item.file_url,
        created_at: item.created_at,
        job: item.job
      })) || [];

      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileUrl: string, fileName: string) => {
    setUploading(true);
    try {
      // For now, we'll just refresh the files list
      // In a real implementation, you'd want to save file metadata to the database
      await fetchFiles();
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast({
        title: "Error",
        description: "Failed to process uploaded file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <DashboardLayout profile={profile}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading files...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Files</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileUploaded={handleFileUpload}
              disabled={uploading}
            />
          </CardContent>
        </Card>

        {files.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
              <p className="text-gray-500">Upload your first file to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          {file.job && (
                            <>
                              <span>•</span>
                              <span>{file.job.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}