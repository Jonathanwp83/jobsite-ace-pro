import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { ChatManagement } from '@/components/admin/ChatManagement';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  response?: string;
  status: string;
  created_at: string;
}

export default function AdminChats() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchChats();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchChats = async () => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;
      setChats(chatsData || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading chats...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Chat Management</h2>
          <p className="text-muted-foreground mt-2">Monitor and respond to customer inquiries</p>
        </div>

        <ChatManagement chats={chats} onRefresh={fetchChats} />
      </div>
    </AdminLayout>
  );
}