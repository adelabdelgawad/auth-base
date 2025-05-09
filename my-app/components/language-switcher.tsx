"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/language-context";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

// Import round flags from country-flag-icons
import { EG, US } from "country-flag-icons/react/3x2";

const languages = [
  {
    code: "en",
    label: "English",
    flag: <US title="United States" className="w-5 h-5 rounded-full mr-2" />,
  },
  {
    code: "ar",
    label: "العربية",
    flag: <EG title="Egypt" className="w-5 h-5 rounded-full mr-2" />,
  },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLanguageChange = (newLang: "en" | "ar") => {
    // Update language in context
    setLanguage(newLang);
    
    // Update cookie
    setCookie("lang", newLang, { maxAge: 60 * 60 * 24 * 365 });
    
    // Refresh client components without full page reload
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            flex items-center gap-2 px-3 py-2 rounded-md bg-white text-gray-900
            hover:bg-gray-50 transition
            focus:outline-none
          "
        >
          <span className="flex items-center">
            {languages.find((l) => l.code === language)?.flag}
            {languages.find((l) => l.code === language)?.label ?? "Language"}
          </span>
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-md shadow-lg bg-white border border-gray-200 mt-2"
      >
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleLanguageChange(l.code as "en" | "ar")}
            className={`flex items-center gap-2 cursor-pointer ${
              language === l.code ? "bg-gray-100" : ""
            }`}
          >
            {l.flag}
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
