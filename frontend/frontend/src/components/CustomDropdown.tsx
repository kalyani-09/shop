import { useState, useRef, useEffect } from "react";

interface CustomDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  className?: string;
}

export default function CustomDropdown({ options, selected, onSelect, className = "w-[200px]" }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all flex items-center justify-between cursor-pointer"
      >
        <span className="truncate">{selected}</span>

        <svg
          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-indigo-100/50 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="py-2">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className={`px-5 py-3 text-sm cursor-pointer transition-colors
                  ${
                    selected === option
                      ? "bg-indigo-50 text-indigo-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}