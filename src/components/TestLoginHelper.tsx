
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
      id: 'platform-admin',
      email: 'admin@contractorpro.com',
      password: 'testpass123',
      type: 'Platform Admin',
      description: 'Contractor Pro employee - manages the SaaS platform and customers',
      role: 'admin',
      badge: 'Platform'
    },
    {
      id: 'contractor-customer',
      email: 'bob@abcplumbing.com',
      password: 'testpass123',
      type: 'Contractor Customer',
      description: 'Owner of ABC Plumbing Co. - pays for Contractor Pro subscription',
      role: 'contractor', 
      badge: 'Customer'
    },
    {
      id: 'staff-member',
      email: 'thomas@abcplumbing.com',
      password: 'testpass123',
      type: 'Staff Member',
      description: 'Customer service staff at ABC Plumbing Co. - manages clients and schedules',
      role: 'staff',
      badge: 'Staff'
    },
    {
      id: 'contractor-client',
      email: 'suzanne@email.com',
      password: 'testpass123',
      type: 'Contractor Client',
      description: 'End customer of ABC Plumbing Co. - can view invoices and job status',
      role: 'client',
      badge: 'Client'
    }
  ];

  const handleCreateAndLogin = async (account: typeof testAccounts[0]) => {
    setLoading(account.id);
    
    try {
      console.log('🚀 Creating test account:', account.email, account.type);
      
      // Try to sign up first (will handle existing users gracefully)
      const { error: signupError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signupError && signupError.message !== 'User already registered') {
        throw signupError;
      }

      // Sign in to get the user
      const { error: signinError } = await signIn(account.email, account.password);
      if (signinError) {
        throw signinError;
      }

      // Get the user to set up their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Failed to get user after login');

      console.log('👤 User authenticated:', user.id, user.email);

      // Set up user profile based on their role
      if (account.role === 'admin') {
        console.log('🔧 Setting up Platform Admin role...');
        
        const { error: adminError } = await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: 'admin'
        }, { onConflict: 'user_id,role' });

        if (adminError) throw adminError;
        console.log('✅ Platform Admin role created');

      } else if (account.role === 'contractor') {
        console.log('🔧 Setting up Contractor Customer record...');
        
        // Update or insert contractor record
        const { error: contractorError } = await supabase.from('contractors').upsert({
          user_id: user.id,
          email: account.email,
          company_name: 'ABC Plumbing Co.',
          contact_name: 'Bob Sanders',
          subscription_plan: 'professional',
          subscription_active: true,
          is_platform_admin: false
        }, { onConflict: 'user_id' });

        if (contractorError) throw contractorError;
        console.log('✅ Contractor Customer record ready');

      } else if (account.role === 'staff') {
        console.log('🔧 Setting up Staff Member record...');
        
        // Find ABC Plumbing Co. contractor
        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .select('id')
          .eq('company_name', 'ABC Plumbing Co.')
          .single();

        if (contractorError || !contractor) {
          throw new Error('ABC Plumbing Co. contractor not found. Please set up contractor first.');
        }

        console.log('🏢 Found contractor:', contractor.id);

        const { error: staffError } = await supabase.from('staff').upsert({
          user_id: user.id,
          contractor_id: contractor.id,
          email: account.email,
          first_name: 'Thomas',
          last_name: 'McKay',
          is_active: true,
          hourly_rate: 28.00,
          permissions: {
            can_view_jobs: true,
            can_edit_jobs: true,
            can_manage_clients: true,
            can_view_invoices: true,
            can_accept_payments: true,
            can_schedule_jobs: true
          }
        }, { onConflict: 'user_id' });

        if (staffError) throw staffError;
        console.log('✅ Staff Member record created');

      } else if (account.role === 'client') {
        console.log('🔧 Setting up Contractor Client record...');
        
        // Find ABC Plumbing Co. contractor
        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .select('id')
          .eq('company_name', 'ABC Plumbing Co.')
          .single();

        if (contractorError || !contractor) {
          throw new Error('ABC Plumbing Co. contractor not found. Please set up contractor first.');
        }

        console.log('🏢 Found contractor for client:', contractor.id);

        // Direct insert to contractor_clients table
        const { error: clientError } = await supabase.from('contractor_clients' as any).upsert({
          user_id: user.id,
          contractor_id: contractor.id,
          email: account.email,
          first_name: 'Suzanne',
          last_name: 'Summers',
          phone: '(555) 123-4567',
          address: '123 Main Street',
          city: 'Toronto',
          province: 'ON',
          postal_code: 'M5V 3A8',
          is_active: true
        }, { onConflict: 'email,contractor_id' });

        if (clientError) {
          console.error('Client creation error:', clientError);
          throw clientError;
        }

        console.log('✅ Contractor Client record created');
      }

      // Verify the role was set up correctly
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });

      if (roleError) {
        console.warn('Role verification failed:', roleError);
      } else {
        console.log('🎯 User role verified:', roleData);
      }

      toast({
        title: 'Success',
        description: `Logged in as ${account.type}. Role: ${roleData || 'checking...'}`
      });

      // Force a page refresh to trigger role detection
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Test login error:', error);
      toast({
        variant: 'destructive',
        title: 'Setup Error',
        description: error instanceof Error ? error.message : 'Failed to create test account'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">ABC Plumbing Co. Test Accounts</h3>
        <p className="text-sm text-gray-600">
          Complete 4-tier business model testing accounts
        </p>
      </div>

      {testAccounts.map((account) => (
        <Card key={account.id} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {account.type}
                <Badge variant={account.role === 'admin' ? 'default' : 'outline'}>
                  {account.badge}
                </Badge>
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
                variant={account.role === 'admin' ? 'default' : 'outline'}
              >
                {loading === account.id ? 'Setting up...' : `Login as ${account.type}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">ABC Plumbing Co. Business Structure:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Platform Admin:</strong> Contractor Pro employee (manages SaaS platform)</li>
          <li><strong>Contractor Customer:</strong> Bob Sanders (owns ABC Plumbing Co.)</li>
          <li><strong>Staff Member:</strong> Thomas McKay (customer service for ABC Plumbing Co.)</li>
          <li><strong>Contractor Client:</strong> Suzanne Summers (end customer of ABC Plumbing Co.)</li>
        </ul>
      </div>
    </div>
  );
};
