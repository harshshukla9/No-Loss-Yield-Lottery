"use client"
import React, { useState, useEffect } from 'react'

const Footer = () => {
  const [heartBeat, setHeartBeat] = useState(false)
  const [blockNumber, setBlockNumber] = useState(18756432)

  // Heart animation - smoother timing
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat(true)
      setTimeout(() => setHeartBeat(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Block number simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  // const quickLinks = [
  //   "How It Works", "Smart Contract", "Audit Reports", "Tokenomics", 
  //   "FAQ", "Documentation", "API", "Bug Bounty"
  // ]

  return (
    <>
      <footer className='relative bg-black text-white overflow-hidden'>
        {/* Animated background elements - reduced opacity and smoother animations */}
        <div className='absolute inset-0 opacity-3'>
          <div className='absolute top-1/4 left-1/6 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse-slow'></div>
          <div className='absolute bottom-1/4 right-1/6 w-48 h-48 bg-green-500 rounded-full blur-2xl animate-pulse-slow-delayed'></div>
          <div className='absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500 rounded-full blur-xl animate-float'></div>
        </div>

        <div className='relative z-10 px-4 py-16'>
          <div className='max-w-7xl mx-auto'>
            
            {/* Main Footer Content */}
            <div className='flex grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16'>
              
              {/* Brand Section */}
              <div className='lg:col-span-1'>
                <div className='mb-6'>
                  <h3 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-3'>
                    NOLO
                  </h3>
                  <p className='text-gray-400 text-sm leading-relaxed'>
                    The world's first truly decentralized lottery where everyone wins. 
                    Powered by Chainlink VRF for provable fairness.
                  </p>
                </div>

                {/* Live Stats - cleaner animation */}
                <div className='bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 mb-6 hover:border-blue-500/40 transition-all duration-500'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse-gentle'></div>
                    <span className='text-xs text-green-400 font-semibold tracking-wide'>LIVE ON ETHEREUM</span>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-xs text-gray-300'>
                      Block: #{blockNumber.toLocaleString()}
                    </div>
                    <div className='text-xs text-gray-300'>
                      Network: Sepolia
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              {/* <div>
                <h4 className='text-lg font-semibold text-blue-400 mb-6'>Quick Links</h4>
                <ul className='space-y-3'>
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a href="#" className='text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 transform inline-block group'>
                        <span className='group-hover:text-blue-400 transition-colors duration-300'>{link}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div> */}

              {/* Additional Info */}
              <div>
                <h4 className='text-lg font-semibold text-green-400 mb-6'>Community</h4>
                <div className='space-y-4'>
                  <div className='text-gray-400 text-sm'>
                    Join thousands of players in the most transparent lottery ever created.
                  </div>
                  <div className='bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20'>
                    <div className='text-sm font-semibold text-green-400 mb-2'>100% Decentralized</div>
                    <div className='text-xs text-gray-300'>
                      No single point of failure. Truly trustless gaming.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className='border-t border-gray-800/50 mb-8'></div>

            {/* Bottom Section */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
              
              {/* Made with Love - improved heart animation */}
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-400'>Made with</span>
                <span className={`text-red-500 text-lg transition-all duration-300 ${heartBeat ? 'scale-110 brightness-125' : 'scale-100'}`}>
                  ❤️
                </span>
                <span className='text-gray-400'>by the</span>
                <span className='text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300'>NOLO Team</span>
              </div>

              {/* Powered by Chainlink */}
              <div className='flex items-center gap-3'>
                <span className='text-gray-400 text-sm'>Powered by</span>
                <div className='flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105'>
                  <div className='w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold animate-pulse-gentle'>
                    🔗
                  </div>
                  <span className='text-blue-400 font-bold text-sm'>Chainlink</span>
                </div>
              </div>

              {/* Copyright */}
              <div className='text-gray-500 text-sm text-center md:text-right'>
                <p>© 2025 NOLO</p>
                <p className='text-xs mt-1 opacity-75'>Decentralized • Trustless • Fair</p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className='mt-12 pt-8 border-t border-gray-800/50'>
              <div className='text-center'>
                <p className='text-gray-500 text-xs mb-6'>Built on cutting-edge blockchain technology</p>
                <div className='flex flex-wrap justify-center items-center gap-8 opacity-60'>
                  <div className='flex items-center gap-2 text-xs hover:opacity-100 transition-opacity duration-300 cursor-pointer group'>
                    <span className='text-lg group-hover:scale-110 transition-transform duration-300'>⟠</span>
                    <span>Ethereum</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs hover:opacity-100 transition-opacity duration-300 cursor-pointer group'>
                    <span className='text-lg group-hover:scale-110 transition-transform duration-300'>🔗</span>
                    <span>Chainlink VRF</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs hover:opacity-100 transition-opacity duration-300 cursor-pointer group'>
                    <span className='text-lg group-hover:scale-110 transition-transform duration-300'>🔒</span>
                    <span>OpenZeppelin</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs hover:opacity-100 transition-opacity duration-300 cursor-pointer group'>
                    <span className='text-lg group-hover:scale-110 transition-transform duration-300'>📊</span>
                    <span>The Graph</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs hover:opacity-100 transition-opacity duration-300 cursor-pointer group'>
                    <span className='text-lg group-hover:scale-110 transition-transform duration-300'>⚡</span>
                    <span>MetaMask</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating lottery symbols - better positioned and animated */}
            <div className='absolute bottom-6 left-6 text-2xl opacity-10 animate-float-delayed'>🎰</div>
            <div className='absolute bottom-16 right-12 text-xl opacity-10 animate-pulse-gentle'>🎲</div>
            <div className='absolute bottom-10 left-1/3 text-lg opacity-10 animate-spin-slow'>🍀</div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for cleaner animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes pulse-slow-delayed {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delayed {
          animation: pulse-slow-delayed 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </>
  )
}

export default Footer