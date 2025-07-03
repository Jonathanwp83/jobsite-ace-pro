
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users } from 'lucide-react';
import { TestLoginHelper } from '@/components/TestLoginHelper';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'contractor' | 'staff'>('contractor');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestHelper, setShowTestHelper] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate('/dashboard');
      }
    } else {
      const userData = {
        user_type: userType,
        ...(userType === 'contractor' && {
          company_name: companyName,
          contact_name: contactName,
        }),
      };

      const { error } = await signUp(email, password, userData);
      if (!error) {
        setIsLogin(true);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            ContractorPro
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Button
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
                className="mr-2"
              >
                Sign In
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>

            {/* Test Login Helper Toggle */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestHelper(!showTestHelper)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showTestHelper ? 'Hide' : 'Show'} Test Login Options
              </Button>
            </div>

            {showTestHelper && (
              <div className="border-t pt-4">
                <TestLoginHelper />
              </div>
            )}

            <div className="border-t pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <Tabs value={userType} onValueChange={(value) => setUserType(value as 'contractor' | 'staff')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="contractor" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Contractor
                      </TabsTrigger>
                      <TabsTrigger value="staff" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Staff
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="contractor" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          required
                          placeholder="Your Name"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="staff" className="mt-4">
                      <p className="text-sm text-gray-600">
                        Staff accounts must be created by your contractor. Please contact your contractor to get invited.
                      </p>
                    </TabsContent>
                  </Tabs>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Your password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (!isLogin && userType === 'staff')}
                >
                  {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
