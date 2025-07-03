import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CP</span>
          </div>
          <span className="text-xl font-bold font-space text-foreground">ContractorPro</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t('home')}
          </a>
          <a href="#features" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t('features')}
          </a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t('pricing')}
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-smooth font-medium">
            {t('contact')}
          </a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <Button variant="professional" size="sm">
            Sign In
          </Button>
          <Button variant="hero" size="sm">
            {t('startFreeTrial')}
          </Button>
        </div>
      </div>
    </header>
  );
};