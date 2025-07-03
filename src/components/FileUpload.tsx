import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  bucket?: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export const FileUpload = ({ 
  onFileUploaded, 
  bucket = 'job-media',
  accept = 'image/*,video/*',
  maxSizeMB = 10,
  multiple = false,
  disabled = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, name: file.name, type: file.type };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const filesToUpload = Array.from(files);
      const uploadPromises = filesToUpload.map(uploadFile);
      const results = await Promise.all(uploadPromises);

      setUploadedFiles(prev => [...prev, ...results]);

      results.forEach(result => {
        onFileUploaded?.(result.url, result.name);
      });

      toast({
        title: "Upload Successful",
        description: `${results.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Choose files to upload</Label>
          <Input
            id="file-upload"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading || disabled}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Max file size: {maxSizeMB}MB
          </p>
        </div>

        {uploading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Uploading...
            </div>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files</Label>
            <div className="grid gap-2">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};