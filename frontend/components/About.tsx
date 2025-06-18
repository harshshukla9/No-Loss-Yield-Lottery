"use client"
import React, { useState, useEffect } from 'react'

const About = () => {
  const [stakingYield, setStakingYield] = useState(8.5)
  const [totalStaked, setTotalStaked] = useState(2547890)

  // Animate values
  useEffect(() => {
    const interval = setInterval(() => {
      setStakingYield(prev => prev + (Math.random() - 0.5) * 0.1)
      setTotalStaked(prev => prev + Math.floor(Math.random() * 1000))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      icon: "🎯",
      title: "PARTICIPATE & STAKE",
      subtitle: "Your funds work while you wait",
      description: "Buy your lottery ticket and all funds automatically get staked in DeFi protocols. Your money isn't just sitting idle - it's earning yield!",
      highlight: "Earn while you play",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: "🔗",
      title: "CHAINLINK VRF DECIDES",
      subtitle: "Provably fair randomness",
      description: "Chainlink VRF selects winners with mathematical precision. No manipulation, no insider knowledge - pure cryptographic fairness.",
      highlight: "100% transparent",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: "🏆",
      title: "WINNERS GET REWARDS",
      subtitle: "Prize pool + staking rewards",
      description: "Winners receive the main prize pool PLUS their share of staking rewards. Bigger wins, better returns!",
      highlight: "Enhanced prizes",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: "🔄",
      title: "LOSERS KEEP PLAYING",
      subtitle: "No total loss - keep your stake",
      description: "Didn't win? No problem! Your staked funds remain, earning yield. Use them for the next draw or withdraw anytime.",
      highlight: "Never lose everything",
      color: "from-pink-500 to-red-500"
    }
  ]

  const trustFeatures = [
    {
      icon: "📖",
      title: "Open Source",
      desc: "Every line of code is public and auditable",
      link: "View on GitHub"
    },
    {
      icon: "🔒",
      title: "Decentralized",
      desc: "No single point of failure or control",
      link: "Smart Contract"
    },
    {
      icon: "🛡️",
      title: "Audited",
      desc: "Security verified by top audit firms",
      link: "Audit Reports"
    },
    {
      icon: "⚡",
      title: "No Rug Pulls",
      desc: "Trustless system, immutable contracts",
      link: "How It Works"
    }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white'>
      {/* Animated background */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-1/6 left-1/6 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/6 right-1/6 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-2/3 left-1/3 w-48 h-48 bg-green-500 rounded-full blur-3xl animate-pulse delay-500'></div>
      </div>

      <div className='relative z-10 py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          
          {/* Header Section */}
          <div className='text-center mb-20'>
            <div className='inline-flex items-center gap-3 bg-red-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-red-500/30 mb-8'>
              <span className='text-3xl animate-bounce'>⚠️</span>
              <span className='text-lg font-bold'>THIS IS NOT YOUR COMMON LOTTERY</span>
            </div>
            
            <h1 className='text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent'>
              WIN-WIN
              <span className='block'>REVOLUTION</span>
            </h1>
            
            <p className='text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8'>
              Where <span className='text-yellow-400 font-bold'>everyone wins</span>, 
              <span className='text-green-400 font-bold'> funds grow</span>, and 
              <span className='text-blue-400 font-bold'> transparency rules</span>
            </p>

            {/* Live Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto'>
              <div className='bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30'>
                <div className='text-sm text-gray-300 mb-1'>Current Staking APY</div>
                <div className='text-3xl font-bold text-green-400'>{stakingYield.toFixed(2)}%</div>
              </div>
              <div className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30'>
                <div className='text-sm text-gray-300 mb-1'>Total Value Staked</div>
                <div className='text-3xl font-bold text-purple-400'>${totalStaked.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className='mb-20'>
            <h2 className='text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              HOW THE MAGIC HAPPENS
            </h2>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {steps.map((step, index) => (
                <div key={index} className='relative group'>
                  <div className={`bg-gradient-to-br ${step.color}/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10 h-full transform hover:scale-105 transition-all duration-500 hover:border-white/30`}>
                    <div className='text-6xl mb-6 text-center animate-bounce'>{step.icon}</div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 bg-gradient-to-r ${step.color} text-white`}>
                      STEP {index + 1}
                    </div>
                    
                    <h3 className='text-xl font-bold mb-2 text-white'>{step.title}</h3>
                    <div className='text-sm text-gray-400 mb-4 font-semibold'>{step.subtitle}</div>
                    <p className='text-gray-300 text-sm leading-relaxed mb-4'>{step.description}</p>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${step.color}/30 text-white border border-white/20`}>
                      ✨ {step.highlight}
                    </div>
                  </div>
                  
                  {/* Connection Arrow */}
                  {index < steps.length - 1 && (
                    <div className='hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-4xl text-yellow-400 animate-pulse z-20'>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Win-Win Explanation */}
          <div className='mb-20'>
            <div className='bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-12 border border-green-500/20'>
              <div className='text-center mb-10'>
                <h2 className='text-4xl md:text-5xl font-bold mb-6 text-green-400'>
                  🎯 THE WIN-WIN SITUATION
                </h2>
                <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                  Traditional lotteries take your money and most people lose everything. 
                  We changed the game entirely.
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-8'>
                <div className='bg-green-500/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30'>
                  <h3 className='text-2xl font-bold text-green-400 mb-4 flex items-center gap-3'>
                    🏆 IF YOU WIN
                  </h3>
                  <ul className='space-y-3 text-gray-200'>
                    <li className='flex items-center gap-3'>
                      <span className='text-green-400'>✓</span>
                      Get the entire prize pool
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='text-green-400'>✓</span>
                      Plus your staking rewards
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='text-green-400'>✓</span>
                      Massive ROI on your ticket
                    </li>
                  </ul>
                </div>

                <div className='bg-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30'>
                  <h3 className='text-2xl font-bold text-blue-400 mb-4 flex items-center gap-3'>
                    🎪 IF YOU DON'T WIN
                  </h3>
                  <ul className='space-y-3 text-gray-200'>
                    <li className='flex items-center gap-3'>
                      <span className='text-blue-400'>✓</span>
                      Keep your staked funds
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='text-blue-400'>✓</span>
                      Earned staking rewards
                    </li>
                    <li className='flex items-center gap-3'>
                      <span className='text-blue-400'>✓</span>
                      Play again or withdraw anytime
                    </li>
                  </ul>
                </div>
              </div>

              <div className='text-center mt-8'>
                <div className='inline-block bg-yellow-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-500/30'>
                  <span className='text-yellow-400 font-bold text-lg'>
                    🎉 RESULT: Everyone walks away with something!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Transparency */}
          <div className='mb-20'>
            <div className='text-center mb-12'>
              <h2 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent'>
                🚫 NO RUG PULLS HERE
              </h2>
              <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
                We're not here for quick cash grabs. This is a 
                <span className='text-blue-400 font-bold'> truly decentralized</span>, 
                <span className='text-green-400 font-bold'> community-owned</span> ecosystem built for the long term.
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {trustFeatures.map((feature, index) => (
                <div key={index} className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10 group cursor-pointer'>
                  <div className='text-4xl mb-4 group-hover:scale-110 transition-transform'>{feature.icon}</div>
                  <h3 className='font-bold text-blue-300 mb-2'>{feature.title}</h3>
                  <p className='text-sm text-gray-400 mb-4'>{feature.desc}</p>
                  <div className='text-xs text-blue-400 font-semibold group-hover:text-blue-300 flex items-center gap-1'>
                    {feature.link} <span className='group-hover:translate-x-1 transition-transform'>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className='text-center'>
            <div className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/30'>
              <h2 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent'>
                READY TO JOIN THE REVOLUTION?
              </h2>
              <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
                Experience the future of fair gaming. Where transparency meets profitability, 
                and everyone has a chance to win.
              </p>
              
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='group bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl'>
                  <span className='flex items-center gap-2'>
                    🎯 Enter Next Draw
                    <span className='group-hover:translate-x-2 transition-transform'>→</span>
                  </span>
                </button>
                
                <button className='group bg-transparent border-2 border-purple-400 hover:bg-purple-400/10 text-purple-400 font-bold py-4 px-8 rounded-xl text-lg transform hover:scale-105 transition-all duration-300'>
                  <span className='flex items-center gap-2'>
                    📖 Read Smart Contract
                    <span className='group-hover:translate-x-2 transition-transform'>→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating lottery elements */}
      <div className='absolute top-20 left-10 text-6xl opacity-20 animate-bounce delay-300'>🎰</div>
      <div className='absolute bottom-32 right-16 text-5xl opacity-20 animate-pulse delay-700'>🎲</div>
      <div className='absolute top-1/2 left-20 text-4xl opacity-20 animate-spin-slow'>🍀</div>
      <div className='absolute bottom-20 left-1/4 text-5xl opacity-20 animate-bounce delay-1000'>💰</div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default About