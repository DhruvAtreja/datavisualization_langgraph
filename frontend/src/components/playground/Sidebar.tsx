import React, { useState, useEffect } from 'react'
import { Stream } from './Stream'
import { GraphState } from './Playground'

interface SidebarProps {
  graphState: GraphState
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ graphState, onClose }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-1/3  shadow-lg overflow-y-auto z-50 transition-all duration-300 ease-in-out bg-emerald-950 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className='flex justify-between items-center mt-2 px-4'>
        <h2 className='text-white text-xl font-semibold'>Traces</h2>
        <button onClick={handleClose} className='text-white'>
          Hide
        </button>
      </div>

      <div className='p-4'>
        <Stream graphState={graphState} />
      </div>
    </div>
  )
}
