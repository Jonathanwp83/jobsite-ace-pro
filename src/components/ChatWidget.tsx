import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, X, Send, Headphones, CreditCard, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'form' | 'sent'>('category');
  const [category, setCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'pre-sales', label: 'Pre-Sales Questions', icon: Headphones, description: 'Learn about our features and pricing' },
    { value: 'technical', label: 'Technical Support', icon: Wrench, description: 'Get help with using ContractorPro' },
    { value: 'billing', label: 'Billing Support', icon: CreditCard, description: 'Questions about your subscription' },
  ];

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setCurrentStep('form');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('chats')
        .insert([{
          visitor_name: formData.name,
          visitor_email: formData.email,
          message: `[${category.toUpperCase()}] ${formData.message}`,
          status: 'pending'
        }]);

      if (error) throw error;

      setCurrentStep('sent');
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetChat = () => {
    setCurrentStep('category');
    setCategory('');
    setFormData({ name: '', email: '', message: '' });
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>
              {currentStep === 'category' && 'How can we help you?'}
              {currentStep === 'form' && `${categories.find(c => c.value === category)?.label}`}
              {currentStep === 'sent' && 'Message Sent!'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {currentStep === 'category' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose the type of support you need:
              </p>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card
                    key={cat.value}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={() => handleCategorySelect(cat.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-sm">{cat.label}</h3>
                          <p className="text-xs text-gray-600">{cat.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {currentStep === 'form' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your question or issue..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('category')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'sent' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Thank You!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your message has been sent to our support team. We'll respond to <strong>{formData.email}</strong> within 24 hours.
                </p>
              </div>
              <Button onClick={resetChat} className="w-full">
                Send Another Message
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};