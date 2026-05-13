export interface NavItem {
  title: string;
  url: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export interface TechLayer {
  name: string;
  items: Array<{ name: string; logoUrl: string }>;
}

export interface TeamMember {
  name: string;
  nickname: string;
  title: string;
  credentials: string[];
  links?: { label: string; url: string }[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface ClientLogo {
  title: string;
  logo: ImageMetadata;
}

export interface PartnerLogo {
  name: string;
  url: string;
}

export interface FooterLink {
  description: string;
  icon: string;
  url: string;
}

export interface ProductItem {
  title: string;
  description: string;
  url: string;
  status: "live" | "beta" | "coming-soon";
}

export interface CompatibilityItem {
  icon: string;
  title: string;
  url: string;
}

export interface FeatureItem {
  description: string;
  icon: string;
  title: string;
}

export interface OurServiceItem {
  description: {
    short: string;
    long: string;
    thai: string;
  };
  icon: string;
  title: string;
}
