## Features

- SQL query generation and validation
- Query execution and result formatting
- Visualization recommendation and data formatting
- Streaming LangGraph state

## Main Components

### WorkflowManager

The `WorkflowManager` class is responsible for creating and managing the workflow of the SQL agent. It uses LangGraph's `StateGraph` to define the sequence of operations.

Key methods:

- `create_workflow()`: Sets up the workflow graph with various nodes and edges.
- `run_sql_agent()`: Executes the entire workflow for a given question.

### SQLAgent

The `SQLAgent` class (not shown in the provided code) likely contains the implementation of individual steps in the workflow, such as:

- Parsing questions
- Generating SQL queries
- Validating and fixing SQL
- Executing SQL queries
- Choosing visualizations

### DataFormatter

The `DataFormatter` class is responsible for formatting the data for the chosen visualization type.

Key methods:

- `format_data_for_visualization()`: Formats the data for the chosen visualization type.
