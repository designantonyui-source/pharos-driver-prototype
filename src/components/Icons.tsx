/** Minimal inline icon set (mirrors the Lucide icons used in Figma). */
type P = { size?: number; className?: string };
const base = (size = 24, className = '') => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className });

export const SearchIcon = ({ size, className }: P) => (<svg {...base(size, className)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const BoxIcon = ({ size, className }: P) => (<svg {...base(size, className)}><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></svg>);
export const CalendarIcon = ({ size, className }: P) => (<svg {...base(size, className)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" /></svg>);
export const UserIcon = ({ size, className }: P) => (<svg {...base(size, className)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>);
export const ChevronLeftIcon = ({ size, className }: P) => (<svg {...base(size, className)}><path d="m15 6-6 6 6 6" /></svg>);
export const MapPinIcon = ({ size, className }: P) => (<svg {...base(size, className)}><path d="M12 22s7-6.2 7-12A7 7 0 0 0 5 10c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
