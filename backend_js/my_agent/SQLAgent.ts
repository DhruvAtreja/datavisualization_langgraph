import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { DatabaseManager } from "./DatabaseManager";
import LLMManager from "./LLMManager";
import { type State } from "./State";

export class SQLAgent {
  private db_manager: DatabaseManager;
  private llm_manager: LLMManager;

  constructor() {
    this.db_manager = new DatabaseManager();
    this.llm_manager = new LLMManager();

    this.parse_question = this.parse_question.bind(this);
    this.get_unique_nouns = this.get_unique_nouns.bind(this);
    this.generate_sql = this.generate_sql.bind(this);
    this.validate_and_fix_sql = this.validate_and_fix_sql.bind(this);
    this.execute_sql = this.execute_sql.bind(this);
    this.format_results = this.format_results.bind(this);
    this.choose_visualization = this.choose_visualization.bind(this);
  }

  async parse_question(state: State): Promise<Partial<State>> {
    const question = state.question;
    const schema = await this.db_manager.get_schema(state.uuid);
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a data analyst that can help summarize SQL tables and parse user questions about a database. 
Given the question and database schema, identify the relevant tables and columns. 
If the question is not relevant to the database or if there is not enough information to answer the question, set is_relevant to false.

Your response should be in the following JSON format:
{{
    "is_relevant": boolean,
    "relevant_tables": [
        {{
            "table_name": string,
            "columns": [string],
            "noun_columns": [string]
        }}
    ]
}}

The "noun_columns" field should contain only the columns that are relevant to the question and contain nouns or names, for example, the column "Artist name" contains nouns relevant to the question "What are the top selling artists?", but the column "Artist ID" is not relevant because it does not contain a noun. Do not include columns that contain numbers.
`,
      ],
      [
        "human",
        "===Database schema:\n{schema}\n\n===User question:\n{question}\n\nIdentify relevant tables and columns:",
      ],
    ]);

    const output_parser = new JsonOutputParser();

    const response = await this.llm_manager.invoke(prompt, {
      schema,
      question,
    });
    const parsed_response = output_parser.parse(response);
    return { parsed_question: parsed_response };
  }

  async get_unique_nouns(state: State): Promise<Partial<State>> {
    const parsed_question = state.parsed_question;

    if (!parsed_question.is_relevant) {
      return { unique_nouns: [] };
    }

    const unique_nouns = new Set<string>();
    for (const table_info of parsed_question.relevant_tables) {
      const table_name = table_info.table_name;
      const noun_columns = table_info.noun_columns;

      if (noun_columns.length > 0) {
        const column_names = noun_columns
          .map((col: string) => `\`${col}\``)
          .join(", ");
        const query = `SELECT DISTINCT ${column_names} FROM \`${table_name}\``;
        const results = await this.db_manager.execute_query(state.uuid, query);
        for (const row of results) {
          for (const value of Object.values(row)) {
            if (value) unique_nouns.add(String(value));
          }
        }
      }
    }

    return { unique_nouns: Array.from(unique_nouns) };
  }

  async generate_sql(state: State): Promise<Partial<State>> {
    const question = state.question;
    const parsed_question = state.parsed_question;
    const unique_nouns = state.unique_nouns;

    if (!parsed_question.is_relevant) {
      return { sql_query: "NOT_RELEVANT" };
    }

    const schema = await this.db_manager.get_schema(state.uuid);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `
You are an AI assistant that generates SQL queries based on user questions, database schema, and unique nouns found in the relevant tables. Generate a valid SQL query to answer the user's question.

If there is not enough information to write a SQL query, respond with "NOT_ENOUGH_INFO".

Here are some examples:

1. What is the top selling product?
Answer: SELECT product_name, SUM(quantity) as total_quantity FROM sales WHERE product_name IS NOT NULL AND quantity IS NOT NULL AND product_name != "" AND quantity != "" AND product_name != "N/A" AND quantity != "N/A" GROUP BY product_name ORDER BY total_quantity DESC LIMIT 1

2. What is the total revenue for each product?
Answer: SELECT \`product name\`, SUM(quantity * price) as total_revenue FROM sales WHERE \`product name\` IS NOT NULL AND quantity IS NOT NULL AND price IS NOT NULL AND \`product name\` != "" AND quantity != "" AND price != "" AND \`product name\` != "N/A" AND quantity != "N/A" AND price != "N/A" GROUP BY \`product name\`  ORDER BY total_revenue DESC

3. What is the market share of each product?
Answer: SELECT \`product name\`, SUM(quantity) * 100.0 / (SELECT SUM(quantity) FROM sa  les) as market_share FROM sales WHERE \`product name\` IS NOT NULL AND quantity IS NOT NULL AND \`product name\` != "" AND quantity != "" AND \`product name\` != "N/A" AND quantity != "N/A" GROUP BY \`product name\`  ORDER BY market_share DESC

4. Plot the distribution of income over time
Answer: SELECT income, COUNT(*) as count FROM users WHERE income IS NOT NULL AND income != "" AND income != "N/A" GROUP BY income

THE RESULTS SHOULD ONLY BE IN THE FOLLOWING FORMAT, SO MAKE SURE TO ONLY GIVE TWO OR THREE COLUMNS:
[[x, y]]
or 
[[label, x, y]]
             
For questions like "plot a distribution of the fares for men and women", count the frequency of each fare and plot it. The x axis should be the fare and the y axis should be the count of people who paid that fare.
SKIP ALL ROWS WHERE ANY COLUMN IS NULL or "N/A" or "".
Just give the query string. Do not format it. Make sure to use the correct spellings of nouns as provided in the unique nouns list. All the table and column names should be enclosed in backticks.
`,
      ],
      [
        "human",
        `===Database schema:
{schema}

===User question:
{question}

===Relevant tables and columns:
{parsed_question}

===Unique nouns in relevant tables:
{unique_nouns}

Generate SQL query string`,
      ],
    ]);

    const response = await this.llm_manager.invoke(prompt, {
      schema,
      question,
      parsed_question,
      unique_nouns,
    });

    if (response.trim() === "NOT_ENOUGH_INFO") {
      return { sql_query: "NOT_RELEVANT" };
    } else {
      return { sql_query: response };
    }
  }

  async validate_and_fix_sql(state: State): Promise<Partial<State>> {
    const sql_query = state.sql_query;

    if (sql_query === "NOT_RELEVANT") {
      return { sql_query: "NOT_RELEVANT", sql_valid: false };
    }

    const schema = await this.db_manager.get_schema(state.uuid);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `
You are an AI assistant that validates and fixes SQL queries. Your task is to:
1. Check if the SQL query is valid.
2. Ensure all table and column names are correctly spelled and exist in the schema. All the table and column names should be enclosed in backticks.
3. If there are any issues, fix them and provide the corrected SQL query.
4. If no issues are found, return the original query.

Respond in JSON format with the following structure. Only respond with the JSON:
{{
    "valid": boolean,
    "issues": string or null,
    "corrected_query": string
}}
`,
      ],
      [
        "human",
        `===Database schema:
{schema}

===Generated SQL query:
{sql_query}

Respond in JSON format with the following structure. Only respond with the JSON:
{{
    "valid": boolean,
    "issues": string or null,
    "corrected_query": string
}}

For example:
1. {{
    "valid": true,
    "issues": null,
    "corrected_query": "None"
}}  
             
2. {{
    "valid": false,
    "issues": "Column USERS does not exist",
    "corrected_query": "SELECT * FROM \`users\` WHERE age > 25"
}}

3. {{
    "valid": false,
    "issues": "Column names should be enclosed in backticks if they contain spaces or special characters",
    "corrected_query": "SELECT * FROM \`gross income\` WHERE age > 25"
}}
`,
      ],
    ]);

    const output_parser = new JsonOutputParser<{
      valid: boolean;
      issues: string | undefined;
      corrected_query: string;
    }>();
    const response = await this.llm_manager.invoke(prompt, {
      schema,
      sql_query,
    });
    const result = await output_parser.parse(response);

    if (result.valid && result.issues === null) {
      return { sql_query, sql_valid: true };
    } else {
      return {
        sql_query: result.corrected_query,
        sql_valid: result.valid,
        sql_issues: result.issues,
      };
    }
  }

  async execute_sql(state: State): Promise<Partial<State>> {
    const query = state.sql_query;
    const uuid = state.uuid;

    if (query === "NOT_RELEVANT") {
      return { results: "NOT_RELEVANT" };
    }

    try {
      const results = await this.db_manager.execute_query(uuid, query);
      return { results };
    } catch (e) {
      return { error: (e as Error).toString() };
    }
  }

  async format_results(state: State): Promise<Partial<State>> {
    const question = state.question;
    const results = state.results;

    if (results === "NOT_RELEVANT") {
      return {
        answer: "Sorry, I can only give answers relevant to the database.",
      };
    }

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an AI assistant that formats database query results into a human-readable response. Give a conclusion to the user's question based on the query results. Do not give the answer in markdown format. Only give the answer in one line.",
      ],
      [
        "human",
        "User question: {question}\n\nQuery results: {results}\n\nFormatted response:",
      ],
    ]);

    const response = await this.llm_manager.invoke(prompt, {
      question,
      results,
    });
    return { answer: response };
  }

  async choose_visualization(state: State): Promise<Partial<State>> {
    const question = state.question;
    const results = state.results;
    const sql_query = state.sql_query;

    if (results === "NOT_RELEVANT") {
      return {
        visualization: "none",
        visualization_reason:
          "No visualization needed for irrelevant questions.",
      };
    }

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `
You are an AI assistant that recommends appropriate data visualizations. Based on the user's question, SQL query, and query results, suggest the most suitable type of graph or chart to visualize the data. If no visualization is appropriate, indicate that.

Available chart types and their use cases:
- Bar Graphs: Best for comparing categorical data or showing changes over time when categories are discrete and the number of categories is more than 2. Use for questions like "What are the sales figures for each product?" or "How does the population of cities compare? or "What percentage of each city is male?"
- Horizontal Bar Graphs: Best for comparing categorical data or showing changes over time when the number of categories is small or the disparity between categories is large. Use for questions like "Show the revenue of A and B?" or "How does the population of 2 cities compare?" or "How many men and women got promoted?" or "What percentage of men and what percentage of women got promoted?" when the disparity between categories is large.
- Scatter Plots: Useful for identifying relationships or correlations between two numerical variables or plotting distributions of data. Best used when both x axis and y axis are continuous. Use for questions like "Plot a distribution of the fares (where the x axis is the fare and the y axis is the count of people who paid that fare)" or "Is there a relationship between advertising spend and sales?" or "How do height and weight correlate in the dataset? Do not use it for questions that do not have a continuous x axis."
- Pie Charts: Ideal for showing proportions or percentages within a whole. Use for questions like "What is the market share distribution among different companies?" or "What percentage of the total revenue comes from each product?"
- Line Graphs: Best for showing trends and distributionsover time. Best used when both x axis and y axis are continuous. Used for questions like "How have website visits changed over the year?" or "What is the trend in temperature over the past decade?". Do not use it for questions that do not have a continuous x axis or a time based x axis.

Consider these types of questions when recommending a visualization:
1. Aggregations and Summarizations (e.g., "What is the average revenue by month?" - Line Graph)
2. Comparisons (e.g., "Compare the sales figures of Product A and Product B over the last year." - Line or Column Graph)
3. Plotting Distributions (e.g., "Plot a distribution of the age of users" - Scatter Plot)
4. Trends Over Time (e.g., "What is the trend in the number of active users over the past year?" - Line Graph)
5. Proportions (e.g., "What is the market share of the products?" - Pie Chart)
6. Correlations (e.g., "Is there a correlation between marketing spend and revenue?" - Scatter Plot)

Provide your response in the following format:
Recommended Visualization: [Chart type or "None"]. ONLY use the following names: bar, horizontal_bar, line, pie, scatter, none
Reason: [Brief explanation for your recommendation]
`,
      ],
      [
        "human",
        `
User question: {question}
SQL query: {sql_query}
Query results: {results}

Recommend a visualization:`,
      ],
    ]);

    const response = await this.llm_manager.invoke(prompt, {
      question,
      sql_query,
      results,
    });

    const lines = response.split("\n");
    const visualization = lines[0].split(": ")[1];
    const reason = lines[1].split(": ")[1];

    return { visualization, visualization_reason: reason };
  }
}
