import React, { useState, useEffect } from 'react'

export const StreamRow = ({ heading, information }: { heading: string; information: string }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      setIsVisible(false)
    }
  }, [])

  return (
    <div
      className={`relative w-full bg-white rounded-[10px] p-4 mb-2 border transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isHovered ? 'scale-105' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='absolute top-2 left-2 text-sm font-bold text-blue-500'>{heading}</div>
      <div className='mt-4 ml-10 text-sm text-left overflow-x-scroll'>{information}</div>
    </div>
  )
}
