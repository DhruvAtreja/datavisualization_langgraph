# SQL Query Visualization Project

Upload SQLite or CSV files, query the data using natural language, and visualize the results. It's built with Next.js for the frontend, uses LangChain and LangGraph Cloud for text to SQL and data visualization, and includes a custom server for handling SQLite and CSV files.

The project is deployed [here](https://data-visualization-frontend-gamma.vercel.app/).

[Video Demo](demo.mov)

## Features

- SQL query generation and validation
- Query execution and result formatting
- Visualization recommendation and data formatting
- Streaming LangGraph state
- File upload support for SQLite and CSV files, automatic cleanup of uploaded files
- Automatic visualization of query results
- Trace viewing for query execution

## Architecture

![SQL Agent Workflow](graph.png)

The project uses a LangGraph-based workflow to process queries, generate SQL, and create visualizations.

## Getting Started

### Prerequisites

- Install Docker
- Set up [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio/)

### Setup

#### Backend

Go to the `backend_py` or `backend_js` directory:

1. Set up the following environment variables:

   ```
   OPENAI_API_KEY=
   DB_ENDPOINT_URL=http://host.docker.internal:3001
   ```

   Note: Since LangGraph Studio runs your backend on a Docker container, you need to use `host.docker.internal` instead of `localhost` here.

2. Upload the directory to LangGraph Studio.

#### Frontend

1. `cd frontend`
2. Set up the following environment variables:
   ```
   NEXT_PUBLIC_SQLITE_URL=http://localhost:3001
   LANGGRAPH_API_URL=
   ```
   Note: LANGGRAPH_API_URL is the URL you will find on LangGraph Studio. It changes each time you start the backend instance.
3. `yarn install`
4. `yarn dev`

#### SQLite Server

This server has been built to allow uploading of SQL and CSV files under 1MB. It automatically cleans up files after 4 hours.
When you upload a file, it gives a UUID which can be used by the backend to refer to your database.
It also has a default database which is used when you don't upload any file.

1. `cd sqlite_server`
2. `yarn install`
3. `yarn start`

## Usage

### Using the Frontend

1. Navigate to the frontend URL (localhost:3000 by default)
2. Upload a SQLite or CSV file under 1 MB, or just ask a question using the provided sample dataset
3. Enter a natural language query
4. View the stream of the graph state and then the generated visualization
5. Optionally, view the query execution traces

### Using the LangGraph Studio

You need to input the question and the UUID of the database. You can see it by the name of the file in `sqlite_server/uploads`.
The UUID of the default database is `921c838c-541d-4361-8c96-70cb23abd9f5`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
