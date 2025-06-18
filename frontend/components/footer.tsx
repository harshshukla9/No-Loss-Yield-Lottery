"use client"
import React, { useState, useEffect } from 'react'

const Footer = () => {
  const [heartBeat, setHeartBeat] = useState(false)
  const [blockNumber, setBlockNumber] = useState(18756432)

  // Heart animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat(true)
      setTimeout(() => setHeartBeat(false), 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Block number simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1)
    }, 12000) // ~12 second block time
    return () => clearInterval(interval)
  }, [])

  const socialLinks = [
    { icon: "🐦", name: "Twitter", handle: "@cryptofortune" },
    { icon: "💬", name: "Discord", handle: "Join Community" },
    { icon: "📱", name: "Telegram", handle: "t.me/cryptofortune" },
    { icon: "📘", name: "Medium", handle: "Our Blog" }
  ]

  const quickLinks = [
    "How It Works", "Smart Contract", "Audit Reports", "Tokenomics", 
    "FAQ", "Documentation", "API", "Bug Bounty"
  ]

  const legalLinks = [
    "Terms of Service", "Privacy Policy", "Risk Disclosure", "Responsible Gaming"
  ]

  return (
    <footer className='relative bg-black  text-white overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-1/4 left-1/6 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/4 right-1/6 w-48 h-48 bg-green-500 rounded-full blur-2xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500 rounded-full blur-xl animate-bounce'></div>
      </div>

      <div className='relative z-10 px-4 py-16'>
        <div className='max-w-7xl mx-auto'>
          
          {/* Main Footer Content */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'>
            
            {/* Brand Section */}
            <div className='lg:col-span-1'>
              <div className='mb-6'>
                <h3 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2'>
                  CryptoFortune
                </h3>
                <p className='text-gray-400 text-sm leading-relaxed'>
                  The world's first truly decentralized lottery where everyone wins. 
                  Powered by Chainlink VRF for provable fairness.
                </p>
              </div>

              {/* Live Stats */}
              <div className='bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30 mb-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                  <span className='text-xs text-green-400 font-semibold'>LIVE ON ETHEREUM</span>
                </div>
                <div className='text-xs text-gray-300'>
                  Block: #{blockNumber.toLocaleString()}
                </div>
                <div className='text-xs text-gray-300'>
                  Network: Mainnet
                </div>
              </div>

              {/* Social Links */}
              <div className='flex flex-wrap gap-3'>
                {socialLinks.map((social, index) => (
                  <div key={index} className='group cursor-pointer'>
                    <div className='bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-110'>
                      <div className='text-xl group-hover:animate-bounce'>{social.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className='text-lg font-semibold text-blue-400 mb-6'>Quick Links</h4>
              <ul className='space-y-3'>
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-2 transform inline-block'>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className='text-lg font-semibold text-green-400 mb-6'>Resources</h4>
              <ul className='space-y-3'>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    🔗 Chainlink VRF
                  </a>
                </li>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    📊 Analytics Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    🛡️ Security Audits
                  </a>
                </li>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    📈 DeFi Integration
                  </a>
                </li>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    💰 Yield Farming
                  </a>
                </li>
                <li>
                  <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center gap-2'>
                    🎯 Lottery History
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h4 className='text-lg font-semibold text-purple-400 mb-6'>Legal & Support</h4>
              <ul className='space-y-3 mb-6'>
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#" className='text-gray-400 hover:text-white text-sm transition-colors duration-300'>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Contact */}
              <div className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30'>
                <h5 className='text-sm font-semibold text-purple-400 mb-2'>Need Help?</h5>
                <p className='text-xs text-gray-300 mb-3'>24/7 Community Support</p>
                <button className='bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-semibold px-3 py-2 rounded-md border border-purple-500/30 transition-all duration-300 transform hover:scale-105'>
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className='border-t border-gray-800 mb-8'></div>

          {/* Bottom Section */}
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            
            {/* Made with Love */}
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-gray-400'>Made with</span>
              <span className={`text-red-500 text-lg transition-transform duration-300 ${heartBeat ? 'scale-125' : 'scale-100'}`}>
                ❤️
              </span>
              <span className='text-gray-400'>by the</span>
              <span className='text-blue-400 font-semibold'>CryptoFortune Team</span>
            </div>

            {/* Powered by Chainlink */}
            <div className='flex items-center gap-3'>
              <span className='text-gray-400 text-sm'>Powered by</span>
              <div className='flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30'>
                <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold'>
                  🔗
                </div>
                <span className='text-blue-400 font-bold text-sm'>Chainlink</span>
              </div>
            </div>

            {/* Copyright */}
            <div className='text-gray-500 text-sm text-center md:text-right'>
              <p>© 2025 CryptoFortune Protocol</p>
              <p className='text-xs mt-1'>Decentralized • Trustless • Fair</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className='mt-12 pt-8 border-t border-gray-800'>
            <div className='text-center'>
              <p className='text-gray-500 text-xs mb-4'>Built on cutting-edge blockchain technology</p>
              <div className='flex flex-wrap justify-center items-center gap-6 opacity-60'>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>⟠</span>
                  <span>Ethereum</span>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>🔗</span>
                  <span>Chainlink VRF</span>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>🔒</span>
                  <span>OpenZeppelin</span>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>📊</span>
                  <span>The Graph</span>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>💧</span>
                  <span>IPFS</span>
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-lg'>⚡</span>
                  <span>MetaMask</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating lottery symbols */}
          <div className='absolute bottom-4 left-4 text-2xl opacity-20 animate-bounce delay-300'>🎰</div>
          <div className='absolute bottom-12 right-8 text-xl opacity-20 animate-pulse delay-700'>🎲</div>
          <div className='absolute bottom-8 left-1/3 text-lg opacity-20 animate-spin-slow'>🍀</div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </footer>
  )
}

export default Footer