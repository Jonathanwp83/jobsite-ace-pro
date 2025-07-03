
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TestLoginHelper = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const testAccounts = [
    {
      id: 'contractor',
      email: 'contractor@contractorpro.com',
      password: 'testpass123',
      type: 'Contractor',
      description: 'Access to full dashboard with all features',
      userData: {
        user_type: 'contractor',
        company_name: 'Test Construction Co.',
        contact_name: 'John Contractor'
      }
    },
    {
      id: 'staff',
      email: 'staff@contractorpro.com',
      password: 'testpass123',
      type: 'Staff',
      description: 'Limited access - view jobs and time tracking',
      userData: {
        user_type: 'staff'
      }
    },
    {
      id: 'admin',
      email: 'admin@contractorpro.com',
      password: 'testpass123',
      type: 'Admin',
      description: 'Full system access with administrative privileges',
      userData: {
        user_type: 'contractor',
        company_name: 'Admin Construction Ltd.',
        contact_name: 'Admin User',
        is_admin: true
      }
    }
  ];

  const handleCreateAndLogin = async (account: typeof testAccounts[0]) => {
    setLoading(account.id);
    
    try {
      console.log('Attempting to create account:', account.email);
      
      // Try to sign up first (in case account doesn't exist)
      const signupResult = await signUp(account.email, account.password, account.userData);
      console.log('Signup result:', signupResult);
      
      // Wait a moment for account creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then try to sign in
      console.log('Attempting to sign in:', account.email);
      const { error } = await signIn(account.email, account.password);
      console.log('Sign in result:', { error });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          variant: 'destructive',
          title: 'Login Error',
          description: error.message
        });
      } else {
        // For contractor accounts, create the contractor profile if it doesn't exist
        if (account.userData.user_type === 'contractor') {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Check if contractor profile exists
              const { data: existingContractor } = await supabase
                .from('contractors')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (!existingContractor) {
                // Create contractor profile
                await supabase.from('contractors').insert({
                  user_id: user.id,
                  email: account.email,
                  company_name: account.userData.company_name,
                  contact_name: account.userData.contact_name,
                  subscription_plan: 'professional',
                  is_platform_admin: account.userData.is_admin || false
                });
                console.log('Created contractor profile');
              }
            }
          } catch (profileError) {
            console.error('Error creating contractor profile:', profileError);
          }
        }
        
        toast({
          title: 'Success',
          description: `Logged in as ${account.type}`
        });
      }
    } catch (error) {
      console.error('Test login error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create or login to test account'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Login Accounts</h3>
        <p className="text-sm text-gray-600">
          Click below to create and login to test accounts
        </p>
      </div>

      {testAccounts.map((account) => (
        <Card key={account.id} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {account.type}
                <Badge variant="outline">{account.id}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{account.description}</p>
              
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div><strong>Email:</strong> {account.email}</div>
                <div><strong>Password:</strong> {account.password}</div>
              </div>

              <Button 
                onClick={() => handleCreateAndLogin(account)}
                disabled={loading !== null}
                className="w-full"
              >
                {loading === account.id ? 'Creating & Logging in...' : `Login as ${account.type}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What you'll see:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Contractor:</strong> Full dashboard with jobs, customers, staff management, time tracking</li>
          <li><strong>Staff:</strong> Limited dashboard focused on time tracking and assigned jobs</li>
          <li><strong>Admin:</strong> Full system access with administrative privileges and oversight</li>
        </ul>
      </div>
    </div>
  );
};
