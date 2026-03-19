'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'WORK', href: '/' },
  { label: 'STACK', href: '/stack' },
  { label: 'SIGNAL', href: '/signal' },
  { label: 'CONTACT', href: '/contact' },
] as const;

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-8 right-8 z-40 flex flex-col gap-5"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-label ${isActive ? 'nav-label-active' : ''}`}
            style={{
              color: isActive
                ? 'var(--void-purple-300)'
                : 'rgba(248, 246, 255, 0.35)',
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
