import { Client } from '@langchain/langgraph-sdk'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { question, databaseUuid } = req.body
  const defaultDatabaseUuid = '921c838c-541d-4361-8c96-70cb23abd9f5'

  const client = new Client({
    apiKey: process.env.LANGSMITH_API_KEY,
    apiUrl: process.env.LANGGRAPH_API_URL,
  })

  try {
    const thread = await client.threads.create()
    const streamResponse = client.runs.stream(thread['thread_id'], 'my_agent', {
      input: { question, uuid: databaseUuid || defaultDatabaseUuid },
    })

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    for await (const chunk of streamResponse) {
      if (chunk.data && chunk.data.question) {
        res.write(`data: ${JSON.stringify(chunk.data)}\n\n`)
      }
    }

    res.end()
  } catch (error) {
    console.error('Error in run:', error)
    res.status(500).json({ message: `Error in run: ${error}` })
  }
}
