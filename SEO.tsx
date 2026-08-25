import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  schemaData?: any;
}

export const SEO: React.FC<SEOProps> = ({ 
  title = "Mail Factory - Trusted Gmail Exchange Platform", 
  description = "Bangladesh's #1 Trusted Gmail Exchange Platform. Fast payments, multi-tier reward levels, and high referral commissions.",
  url = "https://mailfectory.top",
  type = "website",
  schemaData
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:type', type, true);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Structured Data (JSON-LD)
    if (schemaData) {
      let script = document.getElementById('seo-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaData);
    }

    return () => {
      // Cleanup if needed, but for SPA we can leave them and overwrite on next mount
    };
  }, [title, description, url, type, schemaData]);

  return null;
};
