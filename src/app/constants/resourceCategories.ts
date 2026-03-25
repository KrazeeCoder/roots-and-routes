import type { LucideIcon } from "lucide-react";
import { Briefcase, Calendar, HeartPulse, Home, Users, Wheat } from "lucide-react";

export const RESOURCE_CATEGORIES = [
  "Food Assistance",
  "Health & Wellness",
  "Housing Support",
  "Youth Programs",
  "Job Help",
  "Community Events",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type ResourceCategoryFilter = "All" | ResourceCategory;

export interface ResourceCategoryMeta {
  icon: LucideIcon;
  resourceDescription: string;
  badgeClassName: string;
  sectionBackgroundClassName: string;
  sectionTextClassName: string;
  sectionBorderClassName: string;
}

export const RESOURCE_CATEGORY_META: Record<ResourceCategory, ResourceCategoryMeta> = {
  "Food Assistance": {
    icon: Wheat,
    resourceDescription: "Nourishment resources and meal programs for everyday needs.",
    badgeClassName: "bg-[#A7AE8A]/20 text-[#5B473A] border-[#A7AE8A]/40",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#A7AE8A]/10 to-[#A7AE8A]/5",
    sectionTextClassName: "text-[#5B473A]",
    sectionBorderClassName: "border-[#A7AE8A]/20",
  },
  "Health & Wellness": {
    icon: HeartPulse,
    resourceDescription: "Wellness resources and care options for residents.",
    badgeClassName: "bg-[#B36A4C]/10 text-[#B36A4C] border-[#B36A4C]/30",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#B36A4C]/10 to-[#B36A4C]/5",
    sectionTextClassName: "text-[#B36A4C]",
    sectionBorderClassName: "border-[#B36A4C]/20",
  },
  "Housing Support": {
    icon: Home,
    resourceDescription: "Housing resources and stability support.",
    badgeClassName: "bg-[#334233]/10 text-[#334233] border-[#334233]/30",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#334233]/10 to-[#334233]/5",
    sectionTextClassName: "text-[#334233]",
    sectionBorderClassName: "border-[#334233]/20",
  },
  "Youth Programs": {
    icon: Users,
    resourceDescription: "Growth resources and mentorship opportunities.",
    badgeClassName: "bg-[#E7D9C3] text-[#5B473A] border-[#C2B99E]",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#E7D9C3]/20 to-[#E7D9C3]/10",
    sectionTextClassName: "text-[#5B473A]",
    sectionBorderClassName: "border-[#E7D9C3]/30",
  },
  "Job Help": {
    icon: Briefcase,
    resourceDescription: "Career resources and employment support.",
    badgeClassName: "bg-[#6F7553]/10 text-[#6F7553] border-[#6F7553]/30",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#6F7553]/10 to-[#6F7553]/5",
    sectionTextClassName: "text-[#6F7553]",
    sectionBorderClassName: "border-[#6F7553]/20",
  },
  "Community Events": {
    icon: Calendar,
    resourceDescription: "Community gathering resources and shared experiences.",
    badgeClassName: "bg-[#F6F1E7] text-[#5B473A] border-[#E7D9C3]",
    sectionBackgroundClassName: "bg-gradient-to-br from-[#F6F1E7]/50 to-[#E7D9C3]/30",
    sectionTextClassName: "text-[#5B473A]",
    sectionBorderClassName: "border-[#C2B99E]/30",
  },
};

const resourceCategorySet = new Set<string>(RESOURCE_CATEGORIES);

export function isResourceCategory(value: string): value is ResourceCategory {
  return resourceCategorySet.has(value);
}
