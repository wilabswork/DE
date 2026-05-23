'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, LayoutDashboard, PlusCircle, Search, TrendingUp } from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'New Comparison',
    href: '/new',
    icon: PlusCircle,
  },
  {
    label: 'Browse',
    href: '/browse',
    icon: Search,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">PriceScout</span>
            <div className="text-xs text-indigo-500 font-medium -mt-0.5">SG</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-indigo-100'
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
              </div>
              <span
                className={`font-medium text-sm ${
                  isActive ? 'text-indigo-700' : ''
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}

        {/* Platform section */}
        <div className="px-3 py-2 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platforms</span>
        </div>
        <div className="px-3 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EE4D2D]" />
            <span className="text-sm text-slate-500 font-medium">Shopee SG</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0F146D]" />
            <span className="text-sm text-slate-500 font-medium">Lazada SG</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
            <span className="text-sm text-slate-500 font-medium">Amazon SG</span>
          </div>
        </div>
      </nav>

      {/* Footer tagline */}
      <div className="px-6 py-5 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <p className="text-xs font-medium">Smart shopping starts here</p>
        </div>
        <p className="text-xs text-slate-300 mt-1">Singapore Market Prices</p>
      </div>
    </aside>
  );
}
