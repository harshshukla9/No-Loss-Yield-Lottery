"use client"
import React, { useState, useEffect } from 'react'
import { useFetchTimeUntilNextDraw } from '../hooks/fetchTimeUntilNextDraw'
import { useFetchTotalTicketCount } from '../hooks/FetchTicketCount'
import Modal from './Modal'

const Hero = () => {
  const [currentPrize, setCurrentPrize] = useState(125000)
  const [participants, setParticipants] = useState(8247)
  const [showModal, setShowModal] = useState(false)

  // Animate prize pool
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrize(prev => prev + Math.floor(Math.random() * 100))
      setParticipants(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Use the real countdown
  const { seconds, isLoading, error } = useFetchTimeUntilNextDraw()
  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const { total: totalTickets, loading: ticketsLoading } = useFetchTotalTicketCount()

  const features = [
    { icon: "🔗", title: "Chainlink VRF", desc: "Provably fair randomness" },
    { icon: "🛡️", title: "Smart Contracts", desc: "Transparent & secure" },
    { icon: "⚡", title: "Instant Payouts", desc: "Automated distributions" },
    { icon: "🌐", title: "Global Access", desc: "Play from anywhere" }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white  overflow-hidden relative'>
      {/* Animated background elements */}
      <div className='absolute inset-0  opacity-20'>
        <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500 rounded-full blur-2xl animate-bounce'></div>
      </div>

      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-24 text-center'>
        {/* Main headline */}
        <div className='mb-8 space-y-4'>
          <div className='inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30 mb-6'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
            <span className='text-sm font-medium'>
              {isLoading ? 'Loading...' : error ? 'Error' : `Next Draw in ${days}d ${hours}h ${minutes}m ${secs}s`}
            </span>
          </div>
          
          <h1 className='text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent animate-pulse'>
          Play Earn<span className='block md:inline'> Never Loose</span>
          </h1>
          
          <h2 className='text-2xl md:text-3xl font-semibold mb-2'>
            Where <span className='text-yellow-400'>Luck</span> Meets <span className='text-blue-400'>Blockchain</span>
          </h2>
          
          <p className='text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            The first truly decentralized no loss lottery powered by <span className='text-blue-400 font-semibold'>Chainlink VRF</span>
            <br />
            <span className='text-green-400 font-bold'>Provably Fair • Instant Payouts • Global Access</span>
          </p>
        </div>

        {/* Prize pool display */}
        <div className='bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-green-500/30 transform hover:scale-105 transition-all duration-300'>
          <div className='text-sm text-gray-300 mb-2'>Current Prize Pool</div>
          <div className='text-5xl md:text-6xl font-bold text-green-400 mb-2'>
            ${currentPrize.toLocaleString()}
          </div>
          <div className='text-3xl md:text-4xl font-bold text-blue-400 text-center'>
            {ticketsLoading ? 'Loading tickets...' : `${totalTickets} tickets sold`}
          </div>
        </div>

        <div className='inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30 mb-6 text-sm font-medium'>
            <span>5 LINK = 1 TICKET</span>
        </div>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mb-12'>
          <button
            className="group bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
            onClick={() => setShowModal(true)}
          >
            <span className="flex items-center gap-2">
              🎲 Enter Lottery Now
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </span>
          </button>
          
          <button className='group bg-transparent border-2 border-blue-400 hover:bg-blue-400/10 text-blue-400 font-bold py-4 px-8 rounded-xl text-lg transform hover:scale-105 transition-all duration-300'>
            <span className='flex items-center gap-2'>
              📊 View Smart Contract
              <span className='group-hover:translate-x-2 transition-transform'>→</span>
            </span>
          </button>
        </div>

        {/* Features grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto'>
          {features.map((feature, index) => (
            <div key={index} className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/10 transform hover:-translate-y-2'>
              <div className='text-3xl mb-3'>{feature.icon}</div>
              <h3 className='font-semibold text-blue-300 mb-2'>{feature.title}</h3>
              <p className='text-sm text-gray-400'>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className='mt-16 text-center'>
          <div className='text-sm text-gray-400 mb-4'>Trusted by crypto enthusiasts worldwide</div>
          <div className='flex flex-wrap justify-center items-center gap-8 opacity-60'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>🔗</div>
              <span className='font-semibold'>Chainlink</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>💎</div>
              <span className='font-semibold'>Ethereum</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>🛡️</div>
              <span className='font-semibold'>Audited</span>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className='absolute top-20 left-10 text-6xl opacity-20 animate-bounce delay-500'>💎</div>
        <div className='absolute bottom-20 right-10 text-4xl opacity-20 animate-pulse delay-700'>🚀</div>
        <div className='absolute top-1/3 right-20 text-5xl opacity-20 animate-spin-slow'>⭐</div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enter the Lottery" />

      {/* Custom CSS for slow spin */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Hero