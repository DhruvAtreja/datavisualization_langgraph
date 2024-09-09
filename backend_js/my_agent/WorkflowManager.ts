import { type State, StateAnnotation } from "./State";
import { SQLAgent } from "./SQLAgent";
import DataFormatter from "./DataFormatter";
import { END, START, StateGraph, Annotation } from "@langchain/langgraph";

export class WorkflowManager {
  private sql_agent: SQLAgent;
  private data_formatter: DataFormatter;

  constructor() {
    this.sql_agent = new SQLAgent();
    this.data_formatter = new DataFormatter();

    this.create_workflow = this.create_workflow.bind(this);
    this.returnGraph = this.returnGraph.bind(this);
    this.run_sql_agent = this.run_sql_agent.bind(this);
  }

  private create_workflow() {
    const workflow = new StateGraph(StateAnnotation)
      .addNode("parse_question", this.sql_agent.parse_question)
      .addNode("get_unique_nouns", this.sql_agent.get_unique_nouns)
      .addNode("generate_sql", this.sql_agent.generate_sql)
      .addNode("validate_and_fix_sql", this.sql_agent.validate_and_fix_sql)
      .addNode("execute_sql", this.sql_agent.execute_sql)
      .addNode("format_results", this.sql_agent.format_results)
      .addNode("choose_visualization", this.sql_agent.choose_visualization)
      .addNode(
        "format_data_for_visualization",
        this.data_formatter.format_data_for_visualization
      )
      .addEdge(START, "parse_question")
      .addEdge("parse_question", "get_unique_nouns")
      .addEdge("get_unique_nouns", "generate_sql")
      .addEdge("generate_sql", "validate_and_fix_sql")
      .addEdge("validate_and_fix_sql", "execute_sql")
      .addEdge("execute_sql", "format_results")
      .addEdge("execute_sql", "choose_visualization")
      .addEdge("choose_visualization", "format_data_for_visualization")
      .addEdge("format_data_for_visualization", END)
      .addEdge("format_results", END);

    return workflow;
  }

  public returnGraph() {
    return this.create_workflow().compile();
  }

  public async run_sql_agent(
    question: string,
    uuid: string
  ): Promise<{
    answer: string;
    visualization: string;
    visualization_reason: string;
    formatted_data_for_visualization: any;
  }> {
    const app = this.create_workflow().compile();
    const result = await app.invoke({ question, uuid });

    return {
      answer: result.answer,
      visualization: result.visualization,
      visualization_reason: result.visualization_reason,
      formatted_data_for_visualization: result.formatted_data_for_visualization,
    };
  }
}
