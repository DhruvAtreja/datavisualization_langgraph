import React, { useState, useEffect, useCallback, useRef } from 'react'
import Form from './Form'
import Logo from '../Logo'
import { Client } from '@langchain/langgraph-sdk'
import { QuestionDisplay } from './QuestionDisplay'
import { Stream } from './Stream'
import { graphDictionary, InputType } from '../graphs/graphDictionary'
import UploadButton from '../UploadButton'
import { Sidebar } from './Sidebar'

type GraphComponentProps = InputType & { data: any }

const sampleQuestions = [
  'Relation b/w income and rating in men and women',
  'Avg unit price in sports vs food',
  'What is the market share of products?',
  'Spending across categories and gender',
  'Best performing cities over time?',
]
export type GraphState = {
  question: string
  uuid: string
  parsed_question: { [key: string]: any }
  unique_nouns: string[]
  sql_query: string
  sql_valid: boolean
  sql_issues: string
  results: any[]
  answer: string
  error: string
  visualization: string
  visualization_reason: string
  formatted_data_for_visualization: { [key: string]: any }
}

export default function Playground() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [displayedQuestions, setDisplayedQuestions] = useState<string[]>([])
  const [graphState, setGraphState] = useState<GraphState | null>(null)
  const [databaseUuid, setDatabaseUuid] = useState<string | null>(null)
  const [databaseFileName, setDatabaseFileName] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadDatabase = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SQLITE_URL + '/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.uuid
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }, [])

  const run = useCallback(
    async (question: string) => {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, databaseUuid }),
      })

      if (!response.ok) {
        console.log(response)
        throw new Error('Run failed')
      }

      const reader = response.body?.getReader()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            setGraphState(data)
            console.log(data)
          }
        }
      }
    },
    [databaseUuid],
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const uuid = await uploadDatabase(file)
        setDatabaseUuid(uuid)
        setDatabaseFileName(file.name)
        console.log(`File "${file.name}" uploaded successfully. UUID: ${uuid}`)
      } catch (error) {
        console.error('Failed to upload file:', error)
        alert('Failed to upload file')
      } finally {
        setIsUploading(false)
      }
    },
    [uploadDatabase, setDatabaseUuid, setDatabaseFileName],
  )

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleQuestions.length)
    }, 3000)

    return () => clearInterval(rotateInterval)
  }, [])

  useEffect(() => {
    const startIndex = currentIndex
    const endIndex = (currentIndex + 5) % sampleQuestions.length
    if (startIndex < endIndex) {
      setDisplayedQuestions(sampleQuestions.slice(startIndex, endIndex))
    } else {
      setDisplayedQuestions([...sampleQuestions.slice(startIndex), ...sampleQuestions.slice(0, endIndex)])
    }
  }, [currentIndex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question)
  }

  const onFormSubmit = useCallback(async () => {
    await run(selectedQuestion)
  }, [run, selectedQuestion])

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[#204544] m-0 p-0'>
      <Logo setGraphState={setGraphState} />
      <UploadButton onFileUpload={handleFileUpload} disabled={isUploading} />

      <Form
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        onFormSubmit={onFormSubmit}
        disabled={isUploading}
      />

      {!graphState && (
        <>
          <div className='text-white text-center mb-20 w-2/3'>
            Don't have a .sqlite or .csv file to query? We'll use this one by default:{' '}
            <a
              href='https://docs.google.com/spreadsheets/d/1S2mYAKwYYmjZW6jURiAfMWTVmwg74QQDfwdMUvVEgMk/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-300 hover:text-blue-100'
            >
              Sample Dataset
            </a>
          </div>
          <QuestionDisplay displayedQuestions={displayedQuestions} handleQuestionClick={handleQuestionClick} />
        </>
      )}

      {graphState && !(graphState.formatted_data_for_visualization || graphState.visualization == 'none') && (
        <div className='flex  w-2/3 items-start  items-center justify-center mt-60'>
          <Stream graphState={graphState} />
        </div>
      )}
      {graphState && graphState.visualization == 'none' && (
        <div id='answer_canvas' className='p-10 w-2/3 flex flex-col items-center justify-center relative'>
          <button
            onClick={toggleSidebar}
            className='absolute top-12 right-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            See Traces
          </button>
          <div className='flex w-full flex-col p-10 rounded-[10px] bg-white items-center justify-center'>
            <div className='text-lg mx-20'>{graphState.answer}</div>
            {graphState.visualization_reason && (
              <div className='text-sm mt-10 text-gray-500 mx-20'>{graphState.visualization_reason}</div>
            )}
          </div>
          {showSidebar && (
            <div ref={sidebarRef}>
              <Sidebar graphState={graphState} onClose={toggleSidebar} />
            </div>
          )}
        </div>
      )}

      {graphState && graphState.formatted_data_for_visualization && (
        <div id='answer_canvas' className='p-10 w-full flex flex-col items-center justify-center relative'>
          <button
            onClick={toggleSidebar}
            className='absolute top-12 right-12 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            See Traces
          </button>
          <div className='flex w-full flex-col p-10 rounded-[10px] bg-white items-center justify-center'>
            <div className='text-sm mb-10 mx-20'>
              {graphState.answer && <div className='markdown-content'>{graphState.answer}</div>}
            </div>
            {React.createElement(
              graphDictionary[graphState.visualization as keyof typeof graphDictionary]
                .component as React.ComponentType<any>,
              {
                data: graphState.formatted_data_for_visualization,
              },
            )}
          </div>
          {showSidebar && (
            <div ref={sidebarRef}>
              <Sidebar graphState={graphState} onClose={toggleSidebar} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
