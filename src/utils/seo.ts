interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  noindex?: boolean;
}

interface StructuredData {
  '@context'?: string;
  '@type'?: string;
  name?: string;
  description?: string;
  url?: string;
  image?: string;
  headline?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
  };
  location?: {
    '@type': string;
    name: string;
    address: string;
  };
  offers?: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
  }[];
}

export function generateMetaTags(meta: MetaTags): string {
  const {
    title = "Roots & Routes: Bothell",
    description = "Your community resource hub for local residents. Connecting Bothell through paths of support, opportunity, and shared growth.",
    keywords = "Bothell, community resources, local services, events, directory, Washington",
    ogImage,
    ogUrl,
    noindex = false
  } = meta;

  const metaTags = [
    { charset: "UTF-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: "Roots & Routes Bothell" },
    { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
    
    // Open Graph tags
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ogUrl || (typeof window !== 'undefined' ? window.location.href : '') },
    { property: "og:site_name", content: "Roots & Routes: Bothell" },
    ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
  ];

  return metaTags
    .map(tag => {
      if (tag.charset) {
        return `<meta charset="${tag.charset}">`;
      }
      if (tag.name) {
        return `<meta name="${tag.name}" content="${tag.content}">`;
      }
      if (tag.property) {
        return `<meta property="${tag.property}" content="${tag.content}">`;
      }
      return '';
    })
    .join('\n');
}

export function generateStructuredData(data: StructuredData): string {
  const structuredData = {
    "@context": "https://schema.org",
    ...data
  };

  return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url?: string }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      ...(crumb.url ? { "item": crumb.url } : {})
    }))
  };

  return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
}

export function generateOrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Roots & Routes: Bothell",
    "description": "Your community resource hub for local residents. Connecting Bothell through paths of support, opportunity, and shared growth.",
    "url": "https://rootsandroutesbothell.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://rootsandroutesbothell.com/favicon.svg"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "rootsandroutes.bothell@outlook.com"
    },
    "sameAs": [
      "https://rootsandroutesbothell.com"
    ]
  };

  return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
}

export function generateWebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Roots & Routes: Bothell",
    "description": "Your community resource hub for local residents. Connecting Bothell through paths of support, opportunity, and shared growth.",
    "url": "https://rootsandroutesbothell.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rootsandroutesbothell.com/directory?q={search_term}",
      "query-input": "required name=search_term"
    }
  };

  return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
}

// Page-specific helpers
export function generateDirectoryMeta() {
  return generateMetaTags({
    title: "Resource Directory - Roots & Routes: Bothell",
    description: "Browse community resources, services, and support programs in the Bothell area. Find local help, organizations, and neighbor-led initiatives.",
    keywords: "Bothell directory, community resources, local services, support programs, Bothell WA",
  });
}

export function generateEventsMeta() {
  return generateMetaTags({
    title: "Community Events - Roots & Routes: Bothell",
    description: "Discover upcoming community gatherings, workshops, and events in Bothell. Connect with neighbors and strengthen community bonds.",
    keywords: "Bothell events, community gatherings, workshops, local events, Bothell WA",
  });
}

export function generateCalendarMeta() {
  return generateMetaTags({
    title: "Community Calendar - Roots & Routes: Bothell",
    description: "View our interactive community calendar for Bothell events. Browse monthly gatherings and plan your community involvement.",
    keywords: "Bothell calendar, community events, monthly gatherings, event planning, Bothell WA",
  });
}

export function generateAboutMeta() {
  return generateMetaTags({
    title: "About Us - Roots & Routes: Bothell",
    description: "Learn about Roots & Routes: Bothell, our mission to connect community resources and strengthen local support networks.",
    keywords: "Roots and Routes, about, mission, community organization, Bothell WA",
  });
}
