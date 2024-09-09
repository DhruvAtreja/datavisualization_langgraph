import React, { useState } from 'react'

interface FormProps {
  selectedQuestion: string
  setSelectedQuestion: (question: string) => void
  onFormSubmit: () => void
  disabled?: boolean
}

export default function Form({ selectedQuestion, setSelectedQuestion, onFormSubmit, disabled }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onFormSubmit()
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className='flex fixed top-20 w-full justify-center'>
      <input
        type='text'
        value={selectedQuestion}
        onChange={(e) => setSelectedQuestion(e.target.value)}
        placeholder='Ask a question about your data'
        className='px-4 py-2 w-1/4 rounded-l text-white border-2 border-r-0 border-gray-500 ring-0 focus:outline-none focus:border-gray-500 bg-black'
        required
        disabled={isSubmitting}
      />
      <button
        type='submit'
        className='px-6 py-2 rounded-r bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? 'Processing...' : 'Ask Question'}
      </button>
    </form>
  )
}
