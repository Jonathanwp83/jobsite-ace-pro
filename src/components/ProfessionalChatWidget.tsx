
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  X, 
  Send, 
  Headphones, 
  CreditCard, 
  Wrench, 
  ShoppingCart,
  User,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ProfessionalChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'categories' | 'form' | 'sent'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { 
      value: 'sales', 
      label: 'Sales', 
      icon: ShoppingCart, 
      description: 'New business inquiries and partnerships',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    { 
      value: 'pre-sales', 
      label: 'Pre-Sales', 
      icon: Headphones, 
      description: 'Questions before making a purchase',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    { 
      value: 'technical', 
      label: 'Technical Support', 
      icon: Wrench, 
      description: 'Help using ContractorPro features',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    { 
      value: 'billing', 
      label: 'Billing Support', 
      icon: CreditCard, 
      description: 'Subscription and payment questions',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    { 
      value: 'live-agent', 
      label: 'Live Agent', 
      icon: User, 
      description: 'Connect with a human agent',
      color: 'bg-red-50 text-red-700 border-red-200'
    },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentScreen('form');
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
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('chats')
        .insert([{
          visitor_name: formData.name,
          visitor_email: formData.email,
          message: formData.message,
          category: selectedCategory,
          session_id: sessionId,
          status: 'pending',
          priority: selectedCategory === 'live-agent' ? 1 : 2
        }]);

      if (error) throw error;

      setCurrentScreen('sent');
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
    setCurrentScreen('welcome');
    setSelectedCategory('');
    setFormData({ name: '', email: '', message: '' });
    setIsOpen(false);
  };

  const goBack = () => {
    if (currentScreen === 'form') {
      setCurrentScreen('categories');
    } else if (currentScreen === 'categories') {
      setCurrentScreen('welcome');
    }
  };

  return (
    <>
      {/* Professional Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-40 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        size="lg"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(currentScreen === 'categories' || currentScreen === 'form') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold text-lg">ContractorPro</h3>
                    <p className="text-blue-100 text-xs">Support Team</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentScreen === 'welcome' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to ContractorPro Support
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We're here to help you succeed with your contracting business. 
                    Get instant support from our team of experts.
                  </p>
                </div>
                <Button 
                  onClick={() => setCurrentScreen('categories')} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  size="lg"
                >
                  Chat Now
                </Button>
                <div className="text-xs text-gray-500">
                  Typically replies within a few minutes
                </div>
              </div>
            )}

            {currentScreen === 'categories' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    How can we help you today?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choose the type of support you need
                  </p>
                </div>
                
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Card
                        key={cat.value}
                        className={`cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:scale-[1.02] ${cat.color}`}
                        onClick={() => handleCategorySelect(cat.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{cat.label}</h4>
                              <p className="text-xs opacity-80">{cat.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {currentScreen === 'form' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {categories.find(c => c.value === selectedCategory)?.label} Support
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tell us about your {selectedCategory.replace('-', ' ')} question
                  </p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your question or issue in detail..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            )}

            {currentScreen === 'sent' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Thank you for contacting ContractorPro support. We've received your message 
                    and will respond to <strong>{formData.email}</strong> within 24 hours.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>What's next?</strong><br />
                    Our {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} team 
                    will review your message and get back to you with a personalized response.
                  </p>
                </div>
                <Button onClick={resetChat} variant="outline" className="w-full">
                  Send Another Message
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
