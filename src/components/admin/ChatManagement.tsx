import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Clock, CheckCircle, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  response?: string;
  status: string;
  created_at: string;
  category?: string;
  priority?: number;
}

interface ChatManagementProps {
  chats: Chat[];
  onRefresh: () => void;
}

export const ChatManagement = ({ chats, onRefresh }: ChatManagementProps) => {
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatResponse, setChatResponse] = useState('');

  const respondToChat = async () => {
    if (!selectedChat || !chatResponse.trim()) return;

    try {
      const { error } = await supabase
        .from('chats')
        .update({ 
          response: chatResponse,
          status: 'responded'
        })
        .eq('id', selectedChat.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response sent successfully",
      });

      setChatResponse('');
      setSelectedChat(null);
      onRefresh();
    } catch (error) {
      console.error('Error responding to chat:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'responded':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-primary/10 text-primary';
      case 'responded':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority?: number) => {
    if (!priority) return null;
    
    if (priority >= 3) {
      return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
    } else if (priority === 2) {
      return <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Medium Priority</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const pendingChats = chats.filter(chat => chat.status === 'pending');
  const respondedChats = chats.filter(chat => chat.status === 'responded');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Chat Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pending Chats Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-primary" />
              Pending Chats ({pendingChats.length})
            </h3>
            <div className="space-y-3">
              {pendingChats.map((chat) => (
                <div key={chat.id} className="p-4 border rounded-lg border-primary/20 bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{chat.visitor_name || 'Anonymous'}</h4>
                        {getStatusIcon(chat.status)}
                        <Badge className={getStatusColor(chat.status)}>
                          {chat.status}
                        </Badge>
                        {getPriorityBadge(chat.priority)}
                        {chat.category && (
                          <Badge variant="outline" className="text-xs">
                            {chat.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                        {chat.visitor_email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {chat.visitor_email}
                          </span>
                        )}
                        <span>{formatDate(chat.created_at)}</span>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                        <p>{chat.message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedChat(chat)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Respond
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Respond to {chat.visitor_name || 'Anonymous'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded">
                            <p className="text-sm font-medium mb-2">Customer Message:</p>
                            <p>{chat.message}</p>
                          </div>
                          <div>
                            <Label htmlFor="response">Your Response</Label>
                            <Textarea
                              id="response"
                              placeholder="Type your response..."
                              value={chatResponse}
                              onChange={(e) => setChatResponse(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={() => {
                            setSelectedChat(null);
                            setChatResponse('');
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={respondToChat}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Response
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              {pendingChats.length === 0 && (
                <p className="text-gray-500 text-center py-8">No pending chats at the moment.</p>
              )}
            </div>
          </div>

          {/* Responded Chats Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-primary" />
              Recent Responses ({respondedChats.length})
            </h3>
            <div className="space-y-3">
              {respondedChats.slice(0, 5).map((chat) => (
                <div key={chat.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{chat.visitor_name || 'Anonymous'}</h4>
                        {getStatusIcon(chat.status)}
                        <Badge className={getStatusColor(chat.status)}>
                          {chat.status}
                        </Badge>
                        {chat.category && (
                          <Badge variant="outline" className="text-xs">
                            {chat.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                        {chat.visitor_email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {chat.visitor_email}
                          </span>
                        )}
                        <span>{formatDate(chat.created_at)}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                        <p className="text-sm">{chat.message}</p>
                      </div>
                      {chat.response && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-medium text-blue-700 mb-1">Your Response:</p>
                          <p className="text-sm">{chat.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {respondedChats.length === 0 && (
                <p className="text-gray-500 text-center py-8">No responded chats yet.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};