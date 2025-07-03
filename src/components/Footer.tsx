import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CP</span>
              </div>
              <span className="text-xl font-bold font-space text-foreground">ContractorPro</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {t('footerTagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                Twitter
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-smooth">{t('features')}</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-smooth">{t('pricing')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Mobile App</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Integrations</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Help Center</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-smooth">{t('contact')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">API Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ContractorPro. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made in Canada 🇨🇦
          </p>
        </div>
      </div>
    </footer>
  );
};