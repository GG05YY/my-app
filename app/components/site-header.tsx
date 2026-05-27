"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { label: "产品", href: "#features" },
  { label: "定价", href: "#pricing" },
  { label: "客户故事", href: "#testimonials" },
  { label: "支持", href: "#" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass-nav fixed inset-x-0 top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "glass-nav-scrolled" : ""
      }`}
    >
      <nav className="mx-auto flex h-[52px] max-w-[980px] items-center justify-between px-6">
        <a href="#" className="text-[21px] font-semibold tracking-tight text-foreground">
          Flow
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#"
            className="hidden text-xs text-accent transition-colors hover:underline md:block"
          >
            登录
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0077ed] dark:hover:bg-[#40a9ff]"
          >
            免费试用
          </a>
        </div>
      </nav>
    </header>
  );
}
