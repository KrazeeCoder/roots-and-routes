"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border shadow-lg bg-[#F6F1E7] text-[#334233] border-[#D8C9AF] data-[visible=true]:animate-in data-[visible=true]:slide-in-from-right-4",
          title: "font-semibold text-[#334233]",
          description: "text-[#5B473A]",
          actionButton: "bg-[#334233] text-[#F6F1E7] hover:bg-[#B36A4C]",
          cancelButton: "bg-[#E7D9C3] text-[#334233] hover:bg-[#D8C9AF]",
          success: "bg-[#EAF4E6] border-[#7FA36B] text-[#2F4A2F]",
          error: "bg-[#FBE9E4] border-[#C96A4A] text-[#6B2E1E]",
          warning: "bg-[#FAF0DB] border-[#D29C4A] text-[#6B4A1F]",
          info: "bg-[#E8EFE5] border-[#6F7553] text-[#334233]",
          loading: "bg-[#EEF1E6] border-[#A7AE8A] text-[#334233]",
        },
      }}
      style={
        {
          "--normal-bg": "#F6F1E7",
          "--normal-text": "#334233",
          "--normal-border": "#D8C9AF",
          "--success-bg": "#EAF4E6",
          "--success-text": "#2F4A2F",
          "--success-border": "#7FA36B",
          "--error-bg": "#FBE9E4",
          "--error-text": "#6B2E1E",
          "--error-border": "#C96A4A",
          "--warning-bg": "#FAF0DB",
          "--warning-text": "#6B4A1F",
          "--warning-border": "#D29C4A",
          "--info-bg": "#E8EFE5",
          "--info-text": "#334233",
          "--info-border": "#6F7553",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
