import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    contact: "Contact",
    
    // Hero Section
    heroTitle: "Professional Management for Contractors",
    heroSubtitle: "Stop struggling with QuickBooks. Get a platform built specifically for contractors with GPS tracking, mobile invoicing, and team management.",
    startFreeTrial: "Start Free Trial",
    watchDemo: "Watch Demo",
    
    // Features
    featuresTitle: "Everything contractors need in one platform",
    feature1Title: "Mobile-First Invoicing",
    feature1Desc: "Create branded quotes and invoices directly from job sites with photo documentation.",
    feature2Title: "GPS Time Tracking",
    feature2Desc: "Ensure staff are where they need to be with location verification and driving monitoring.",
    feature3Title: "Team Management", 
    feature3Desc: "Delegate jobs, track schedules, and manage payroll seamlessly across your crew.",
    
    // Pricing
    pricingTitle: "Choose your plan",
    pricingSubtitle: "Scale your business with flexible pricing",
    monthly: "Monthly",
    annually: "Annually",
    save30: "Save 30%",
    
    // Plan names and features
    starter: "Starter",
    professional: "Professional", 
    enterprise: "Enterprise",
    
    starterDesc: "Perfect for solo contractors",
    professionalDesc: "For growing contractor businesses",
    enterpriseDesc: "For large contracting companies",
    
    upTo: "Up to",
    unlimited: "Unlimited",
    staffMembers: "staff members",
    
    basicInvoicing: "Basic invoicing & quotes",
    mobileApp: "Mobile app access",
    basicReporting: "Basic reporting",
    
    advancedInvoicing: "Advanced invoicing with branding",
    gpsTracking: "GPS time tracking",
    jobManagement: "Job delegation & management",
    payrollTracking: "Payroll tracking",
    
    allProfessionalFeatures: "All Professional features",
    advancedReporting: "Advanced reporting & analytics",
    apiIntegrations: "API integrations",
    prioritySupport: "Priority support",
    customBranding: "Custom branding",
    
    getStarted: "Get Started",
    contactSales: "Contact Sales",
    
    // Footer
    footerTagline: "Built by contractors, for contractors",
    
    // Dashboard
    subscription: "Subscription",
    manageSubscriptionDescription: "Manage your subscription plan and billing information",
  },
  fr: {
    // Navigation
    home: "Accueil",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    contact: "Contact",
    
    // Hero Section
    heroTitle: "Gestion Professionnelle pour Entrepreneurs",
    heroSubtitle: "Arrêtez de lutter avec QuickBooks. Obtenez une plateforme conçue spécifiquement pour les entrepreneurs avec suivi GPS, facturation mobile et gestion d'équipe.",
    startFreeTrial: "Commencer l'Essai Gratuit",
    watchDemo: "Voir la Démo",
    
    // Features
    featuresTitle: "Tout ce dont les entrepreneurs ont besoin en une plateforme",
    feature1Title: "Facturation Mobile",
    feature1Desc: "Créez des devis et factures personnalisés directement depuis les chantiers avec documentation photo.",
    feature2Title: "Suivi GPS Temps Réel",
    feature2Desc: "Assurez-vous que votre personnel est là où il doit être avec vérification de localisation et surveillance de conduite.",
    feature3Title: "Gestion d'Équipe",
    feature3Desc: "Déléguez des travaux, suivez les horaires et gérez la paie en toute simplicité.",
    
    // Pricing
    pricingTitle: "Choisissez votre plan",
    pricingSubtitle: "Développez votre entreprise avec une tarification flexible",
    monthly: "Mensuel",
    annually: "Annuel",
    save30: "Économisez 30%",
    
    // Plan names and features
    starter: "Débutant",
    professional: "Professionnel",
    enterprise: "Entreprise",
    
    starterDesc: "Parfait pour les entrepreneurs solo",
    professionalDesc: "Pour les entreprises en croissance",
    enterpriseDesc: "Pour les grandes entreprises de construction",
    
    upTo: "Jusqu'à",
    unlimited: "Illimité",
    staffMembers: "membres du personnel",
    
    basicInvoicing: "Facturation et devis de base",
    mobileApp: "Accès application mobile",
    basicReporting: "Rapports de base",
    
    advancedInvoicing: "Facturation avancée avec image de marque",
    gpsTracking: "Suivi de temps GPS",
    jobManagement: "Délégation et gestion des travaux",
    payrollTracking: "Suivi de la paie",
    
    allProfessionalFeatures: "Toutes les fonctionnalités Professionnelles",
    advancedReporting: "Rapports et analyses avancés",
    apiIntegrations: "Intégrations API",
    prioritySupport: "Support prioritaire",
    customBranding: "Image de marque personnalisée",
    
    getStarted: "Commencer",
    contactSales: "Contacter les Ventes",
    
    // Footer
    footerTagline: "Conçu par des entrepreneurs, pour des entrepreneurs",
    
    // Dashboard
    subscription: "Abonnement",
    manageSubscriptionDescription: "Gérez votre plan d'abonnement et vos informations de facturation",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Auto-detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Language;
    if (browserLang === 'fr') {
      setLanguage('fr');
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};