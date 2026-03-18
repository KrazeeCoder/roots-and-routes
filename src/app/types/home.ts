import type { ComponentType, SVGProps } from "react";

export interface Waypoint {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  desc: string;
}

export interface Step {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}

export interface EventItem {
  date: string;
  title: string;
  time: string;
  location: string;
  category: string;
  image?: string | null;
}
