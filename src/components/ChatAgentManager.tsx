
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatAgent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  categories: string[];
  is_online: boolean;
  max_concurrent_chats: number;
  current_chat_count: number;
  created_at: string;
}

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  category: string;
  status: string;
  assigned_agent_id: string | null;
  created_at: string;
}

export const ChatAgentManager = () => {
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    categories: [] as string[],
    max_concurrent_chats: 5
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'sales', label: 'Sales' },
    { value: 'pre-sales', label: 'Pre-Sales' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Support' },
    { value: 'live-agent', label: 'Live Agent' },
  ];

  useEffect(() => {
    fetchAgents();
    fetchChats();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to load chat agents",
        variant: "destructive",
      });
    }
  };

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAgent = async () => {
    if (!newAgent.name.trim() || !newAgent.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_agents')
        .insert([{
          name: newAgent.name,
          email: newAgent.email,
          categories: newAgent.categories,
          max_concurrent_chats: newAgent.max_concurrent_chats,
          user_id: 'placeholder-user-id' // In a real app, this would be the actual user ID
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat agent added successfully",
      });

      setNewAgent({
        name: '',
        email: '',
        categories: [],
        max_concurrent_chats: 5
      });
      setIsAddingAgent(false);
      fetchAgents();
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error",
        description: "Failed to add chat agent",
        variant: "destructive",
      });
    }
  };

  const toggleAgentOnline = async (agentId: string, isOnline: boolean) => {
    try {
      const { error } = await supabase
        .from('chat_agents')
        .update({ is_online: !isOnline })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Agent ${!isOnline ? 'brought online' : 'taken offline'}`,
      });

      fetchAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  const assignChatToAgent = async (chatId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ assigned_agent_id: agentId, status: 'assigned' })
        .eq('id', chatId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat assigned to agent",
      });

      fetchChats();
    } catch (error) {
      console.error('Error assigning chat:', error);
      toast({
        title: "Error",
        description: "Failed to assign chat",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setNewAgent(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  if (loading) {
    return <div className="p-6">Loading chat management...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat Agent Management</h1>
        <Dialog open={isAddingAgent} onOpenChange={setIsAddingAgent}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Chat Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                />
              </div>
              
              <div>
                <Label htmlFor="agent-email">Email Address</Label>
                <Input
                  id="agent-email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="agent@contractorpro.com"
                />
              </div>

              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.value}`}
                        checked={newAgent.categories.includes(cat.value)}
                        onCheckedChange={(checked) => handleCategoryChange(cat.value, checked as boolean)}
                      />
                      <Label htmlFor={`cat-${cat.value}`} className="text-sm">{cat.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="max-chats">Max Concurrent Chats</Label>
                <Input
                  id="max-chats"
                  type="number"
                  value={newAgent.max_concurrent_chats}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, max_concurrent_chats: parseInt(e.target.value) }))}
                  min={1}
                  max={20}
                />
              </div>

              <Button onClick={addAgent} className="w-full">
                Add Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Chat Agents ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${agent.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {categories.find(c => c.value === cat)?.label || cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {agent.current_chat_count}/{agent.max_concurrent_chats} chats
                  </div>
                  <Switch
                    checked={agent.is_online}
                    onCheckedChange={() => toggleAgentOnline(agent.id, agent.is_online)}
                  />
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No chat agents configured yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Chats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Recent Chats ({chats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{chat.visitor_name}</h4>
                    <Badge variant={chat.status === 'pending' ? 'destructive' : 'default'}>
                      {chat.status}
                    </Badge>
                    <Badge variant="outline">
                      {categories.find(c => c.value === chat.category)?.label || chat.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(chat.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{chat.visitor_email}</p>
                <p className="text-sm mb-3">{chat.message}</p>
                {chat.status === 'pending' && (
                  <Select onValueChange={(value) => assignChatToAgent(chat.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign to agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents
                        .filter(agent => agent.is_online && agent.categories.includes(chat.category))
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.current_chat_count}/{agent.max_concurrent_chats})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
            {chats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No chats received yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
