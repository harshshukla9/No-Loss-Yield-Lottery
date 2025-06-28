"use client";
import React from "react";
import Logo from "./ui/logo";
import { Github, Twitter } from "lucide-react";

const ChainlinkSvg = () => (
  <svg
    viewBox="0 0 247 284"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-auto"
    aria-label="Chainlink"
  >
    <path d="M123.5 0L0 70.9726V212.918L123.5 283.89L247 212.918V70.9726L123.5 0ZM194.679 182.837L123.523 223.728L52.3663 182.837V101.054L123.523 60.1621L194.679 101.054V182.837Z" />
  </svg>
);

const navigation = {
  main: [
    { name: "How It Works", href: "/#about" },
    { name: "Enter Lottery", href: "/lottery" },
    {
      name: "View Contract",
      href: "https://github.com/eik-1/No-Loss-Yield-Lottery/blob/main/contracts/src/LotteryPool.sol",
    },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/NoLo_Lottery",
      icon: (props: React.SVGProps<SVGSVGElement>) => <Twitter {...props} />,
    },
    {
      name: "GitHub",
      href: "https://github.com/eik-1/No-Loss-Yield-Lottery",
      icon: (props: React.SVGProps<SVGSVGElement>) => <Github {...props} />,
    },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-900/10">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-y-12 text-center sm:flex-row sm:text-left">
          {/* Left side: Logo, copyright, made by */}
          <div className="flex items-center gap-x-3">
            <Logo logoWidth="w-10" logoHeight="h-11" />
            <div>
              <p className="text-sm font-semibold leading-6 text-black">
                Made by the NoLo Team
              </p>
              <p className="mt-1 text-xs leading-5 text-black/60">
                &copy; {new Date().getFullYear()} NoLo. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right side: Nav, Socials, and Powered by */}
          <div className="flex flex-col items-center gap-y-8 sm:items-end">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
              {navigation.main.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm leading-6 text-black hover:text-black/70"
                  target={item.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-x-8">
              <div className="flex items-center gap-x-4">
                <span className="text-xs font-semibold text-black/80">
                  Powered by
                </span>
                <a
                  href="https://chain.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-black/70"
                >
                  <ChainlinkSvg />
                </a>
                <a
                  href="https://aave.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-black hover:text-black/70"
                >
                  Aave
                </a>
              </div>
              <div className="flex justify-center gap-x-6">
                {navigation.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-black/70"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
