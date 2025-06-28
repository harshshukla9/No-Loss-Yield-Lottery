"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Logo from "./ui/logo";
import HamburgerButton from "./ui/Hamburger";
import EnterAppButton from "./EnterAppButton";

const navLinks = [
  { title: "About", href: "#about" },
  { title: "Lottery", href: "/lottery" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const navVariants: Variants = {
    top: {
      width: "100%",
      top: "0rem",
      left: "0%",
      x: "0%",
      borderRadius: "0px",
      backgroundColor: "transparent",
      backdropFilter: "blur(0px)",
      boxShadow: "",
    },
    scrolled: {
      width: "clamp(80%, 750px, 90%)",
      top: "0.75rem",
      left: "50%",
      x: "-50%",
      borderRadius: "20px",
      backgroundColor: "rgba(236, 236, 236, 0.5)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
  };

  const menuVariants: Variants = {
    closed: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    open: {
      x: "0%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    closed: {},
    open: {
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  return (
    <>
      <motion.nav
        className="fixed z-50 h-[5rem]"
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        variants={navVariants}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          mass: 0.8,
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-300 font-medium text-lg text-black"
                >
                  {link.title}
                </Link>
              ))}
              <ConnectButton />
            </div>

            <div className="md:hidden flex items-center cursor-pointer">
              <HamburgerButton isOpen={isOpen} toggleMenu={toggleMenu} />
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white backdrop-blur-md z-40 flex flex-col items-center justify-center md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              variants={containerVariants}
              className="flex flex-col items-center space-y-8"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={linkVariants}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={link.href}
                    className="transition-colors duration-300 font-semibold text-2xl text-black"
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={linkVariants}
                className="pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <ConnectButton />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
