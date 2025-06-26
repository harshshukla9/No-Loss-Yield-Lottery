"use client"
import React, { useState, useEffect } from 'react'

const Hero = () => {
  const [currentPrize, setCurrentPrize] = useState(125000)
  const [participants, setParticipants] = useState(8247)

  // Mock data for demo - replace with your hooks
  const seconds = 432000 // 5 days
  const totalTickets = 1247
  const interestAccrued = "12.345"
  const isLoading = false
  const error = false

  // Subtle prize animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrize(prev => prev + Math.floor(Math.random() * 50))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const features = [
    { icon: "🔒", title: "Provably Fair", desc: "Chainlink VRF ensures transparent randomness" },
    { icon: "💰", title: "No Loss", desc: "Your deposit is always safe" },
    { icon: "⚡", title: "Instant Wins", desc: "Automated smart contract payouts" },
    { icon: "🌍", title: "Decentralized", desc: "Truly permissionless and global" }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white'>
      {/* Subtle background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5'></div>
      
      <div className='relative z-10 max-w-6xl top-10 mx-auto px-6 py-16'>
        
        {/* Header section */}
        <div className='text-center  mb-16'>
          {/* Countdown badge */}
          <div className='inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur px-4 py-2  rounded-full border border-slate-700 mb-8'>
            <div className='w-2 h-2 bg-green-400 rounded-full'></div>
            <span className='text-sm font-medium text-slate-300'>
              Next Draw: {days}d {hours}h {minutes}m {secs}s
            </span>
          </div>

          {/* Main headline */}
          <h1 className='text-5xl md:text-7xl font-bold mb-6 text-white'>
            Play. Earn.
            <span className='block text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text'>
              Never Lose.
            </span>
          </h1>

          <p className='text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed'>
            The world's first no-loss lottery. Deposit LINK, win prizes, 
            <br className='hidden md:block' />
            keep your principal forever.
          </p>
        </div>

        {/* Prize pool section */}
        <div className='max-w-4xl mx-auto mb-16'>
          <div className='bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center'>
            <div className='grid md:grid-cols-3 gap-8'>
              
              {/* Current Prize */}
              <div>
                <div className='text-sm text-slate-400 mb-2'>Prize Pool</div>
                <div className='text-3xl md:text-4xl font-bold text-green-400'>
                  {Number(interestAccrued).toFixed(2)} LINK
                </div>
              </div>

              {/* Tickets Sold */}
              <div>
                <div className='text-sm text-slate-400 mb-2'>Tickets Sold</div>
                <div className='text-3xl md:text-4xl font-bold text-blue-400'>
                  {totalTickets.toLocaleString()}
                </div>
              </div>

              {/* Ticket Price */}
              <div>
                <div className='text-sm text-slate-400 mb-2'>Ticket Price</div>
                <div className='text-3xl md:text-4xl font-bold text-white'>
                  5 LINK
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-20'>
          <button
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            onClick={() => window.location.href = '/lottery'}
          >
            Enter Lottery
          </button>
          
          <button className='bg-transparent border-2 border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 text-slate-300 hover:text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200'>
            View Contract
          </button>
        </div>

        {/* Features */}
        <div className='grid md:grid-cols-4 gap-6 mb-16'>
          {features.map((feature, index) => (
            <div key={index} className='bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center hover:bg-slate-800/50 transition-colors duration-200'>
              <div className='text-2xl mb-4'>{feature.icon}</div>
              <h3 className='font-semibold text-white mb-2'>{feature.title}</h3>
              <p className='text-sm text-slate-400 leading-relaxed'>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className='text-center border-t border-slate-700 pt-12'>
          <div className='text-sm text-slate-500 mb-6'>Powered by industry-leading protocols</div>
          <div className='flex justify-center items-center gap-12 text-slate-400'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Chainlink VRF</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Ethereum</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Audited Smart Contracts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Hero