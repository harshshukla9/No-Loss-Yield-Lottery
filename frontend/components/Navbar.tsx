"use client";
import { LayoutGrid, Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";

export const navigationItems = [
  {
    title: "Lottery",
    href: "/lottery",
  },
  {
    title: "About",
    href: "/about",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-1/2 top-0 z-50 mt-6 w-11/12 max-w-7xl -translate-x-1/2 rounded-full bg-background/20 px-4 py-2 backdrop-blur-lg shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <img
              src="https://i.pinimg.com/736x/44/ff/51/44ff5196e97af69d7efbf2fc4f880f7a.jpg"
              alt="Orc Dev"
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 text-sm font-medium">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side: Connect button & Hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="block md:hidden focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mt-3 flex flex-col items-center gap-4 md:hidden pb-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-white hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          ))}
          <ConnectButton />
        </div>
      )}
    </nav>
  );
}
