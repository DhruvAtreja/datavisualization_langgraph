import { ChatPromptTemplate } from "@langchain/core/prompts";
import LLMManager from "./LLMManager";
import { graph_instructions } from "./graph_instructions";

class DataFormatter {
  private llm_manager: LLMManager;

  constructor() {
    this.llm_manager = new LLMManager();

    this.format_data_for_visualization =
      this.format_data_for_visualization.bind(this);
    this._format_scatter_data = this._format_scatter_data.bind(this);
    this._format_bar_data = this._format_bar_data.bind(this);
    this._format_line_data = this._format_line_data.bind(this);
    this._format_other_visualizations =
      this._format_other_visualizations.bind(this);
  }

  async format_data_for_visualization(
    state: Record<string, any>
  ): Promise<Record<string, any>> {
    const visualization = state["visualization"];
    const results = state["results"];
    const question = state["question"];
    const sql_query = state["sql_query"];

    if (visualization === "none") {
      return { formatted_data_for_visualization: null };
    }

    if (visualization === "scatter") {
      try {
        return await this._format_scatter_data(results);
      } catch (e) {
        return await this._format_other_visualizations(
          visualization,
          question,
          sql_query,
          results
        );
      }
    }

    if (visualization === "bar" || visualization === "horizontal_bar") {
      try {
        return await this._format_bar_data(results, question);
      } catch (e) {
        return await this._format_other_visualizations(
          visualization,
          question,
          sql_query,
          results
        );
      }
    }

    if (visualization === "line") {
      try {
        return await this._format_line_data(results, question);
      } catch (e) {
        return await this._format_other_visualizations(
          visualization,
          question,
          sql_query,
          results
        );
      }
    }

    return await this._format_other_visualizations(
      visualization,
      question,
      sql_query,
      results
    );
  }

  private async _format_line_data(
    results: any,
    question: string
  ): Promise<Record<string, any>> {
    if (typeof results === "string") {
      results = JSON.parse(results);
    }

    if (results[0].length === 2) {
      const x_values = results.map((row: any[]) => String(row[0]));
      const y_values = results.map((row: any[]) => parseFloat(row[1]));

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a data labeling expert. Given a question and some data, provide a concise and relevant label for the data series.",
        ],
        [
          "human",
          "Question: {question}\n Data (first few rows): {data}\n\nProvide a concise label for this y axis. For example, if the data is the sales figures over time, the label could be 'Sales'. If the data is the population growth, the label could be 'Population'. If the data is the revenue trend, the label could be 'Revenue'.",
        ],
      ]);
      const label = await this.llm_manager.invoke(prompt, {
        question,
        data: JSON.stringify(results.slice(0, 2)),
      });

      const formatted_data = {
        xValues: x_values,
        yValues: [
          {
            data: y_values,
            label: label.trim(),
          },
        ],
      };
      return { formatted_data_for_visualization: formatted_data };
    } else if (results[0].length === 3) {
      const data_by_label: Record<string, any[]> = {};
      const x_values: string[] = [];

      // Get a list of unique labels
      const labels = [
        ...new Set(
          results
            .filter(
              ([item1, item2]: [any, any]) =>
                (typeof item2 === "string" &&
                  isNaN(parseFloat(item2)) &&
                  !item2.includes("/")) ||
                (typeof item1 === "string" &&
                  isNaN(parseFloat(item1)) &&
                  !item1.includes("/"))
            )
            .map(([item1, item2]: [any, any]) =>
              typeof item2 === "string" &&
              isNaN(parseFloat(item2)) &&
              !item2.includes("/")
                ? item2
                : item1
            )
        ),
      ];

      for (const [item1, item2, item3] of results) {
        let label, x, y;
        // Determine which item is the label (string not convertible to float and not containing "/")
        if (
          typeof item1 === "string" &&
          isNaN(parseFloat(item1)) &&
          !item1.includes("/")
        ) {
          [label, x, y] = [item1, item2, item3];
        } else {
          [x, label, y] = [item1, item2, item3];
        }

        if (!x_values.includes(String(x))) {
          x_values.push(String(x));
        }
        if (!data_by_label[label]) {
          data_by_label[label] = [];
        }
        data_by_label[label].push(parseFloat(y));

        for (const other_label of labels) {
          if (other_label !== label) {
            if (!data_by_label[other_label as string]) {
              data_by_label[other_label as string] = [];
            }
            data_by_label[other_label as string].push(null);
          }
        }
      }

      // Create yValues array
      const y_values = Object.entries(data_by_label).map(([label, data]) => ({
        data,
        label,
      }));

      const formatted_data = {
        xValues: x_values,
        yValues: y_values,
        yAxisLabel: "",
      };

      // Use LLM to get a relevant label for the y-axis
      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a data labeling expert. Given a question and some data, provide a concise and relevant label for the y-axis.",
        ],
        [
          "human",
          "Question: {question}\n Data (first few rows): {data}\n\nProvide a concise label for the y-axis. For example, if the data represents sales figures over time for different categories, the label could be 'Sales'. If it's about population growth for different groups, it could be 'Population'.",
        ],
      ]);
      const y_axis_label = await this.llm_manager.invoke(prompt, {
        question: question,
        data: JSON.stringify(results.slice(0, 2)),
      });

      formatted_data["yAxisLabel"] = y_axis_label.trim();

      return { formatted_data_for_visualization: formatted_data };
    }

    throw new Error("Unexpected data format in results");
  }

  private async _format_scatter_data(
    results: any
  ): Promise<Record<string, any>> {
    if (typeof results === "string") {
      results = JSON.parse(results);
    }

    const formatted_data: { series: any[] } = { series: [] };

    if (results[0].length === 2) {
      formatted_data.series.push({
        data: results.map(([x, y]: [number, number], i: number) => ({
          x: x,
          y: y,
          id: i + 1,
        })),
        label: "Data Points",
      });
    } else if (results[0].length === 3) {
      const entities: Record<string, any[]> = {};
      for (const [item1, item2, item3] of results) {
        let label: string, x: number, y: number;
        if (
          typeof item1 === "string" &&
          isNaN(parseFloat(item1)) &&
          !item1.includes("/")
        ) {
          [label, x, y] = [item1, item2, item3];
        } else {
          [x, label, y] = [item1, item2, item3];
        }
        if (!entities[label]) {
          entities[label] = [];
        }
        entities[label].push({
          x: x,
          y: y,
          id: entities[label].length + 1,
        });
      }

      for (const [label, data] of Object.entries(entities)) {
        formatted_data.series.push({
          data,
          label,
        });
      }
    } else {
      throw new Error("Unexpected data format in results");
    }

    return { formatted_data_for_visualization: formatted_data };
  }

  private async _format_bar_data(
    results: any,
    question: string
  ): Promise<Record<string, any>> {
    if (typeof results === "string") {
      results = JSON.parse(results);
    }

    let formatted_data: Record<string, any>;

    if (results[0].length === 2) {
      const labels = results.map((row: any[]) => String(row[0]));
      const data = results.map((row: any[]) => parseFloat(row[1]));

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a data labeling expert. Given a question and some data, provide a concise and relevant label for the data series.",
        ],
        [
          "human",
          "Question: {question}\nData (first few rows): {data}\n\nProvide a concise label for this y axis. For example, if the data is the sales figures for products, the label could be 'Sales'. If the data is the population of cities, the label could be 'Population'. If the data is the revenue by region, the label could be 'Revenue'.",
        ],
      ]);
      const label = await this.llm_manager.invoke(prompt, {
        question,
        data: JSON.stringify(results.slice(0, 2)),
      });

      formatted_data = {
        labels,
        values: [{ data, label }],
      };
    } else if (results[0].length === 3) {
      const categories = new Set(results.map((row: any[]) => row[1]));
      const labels = Array.from(categories);
      const entities = new Set(results.map((row: any[]) => row[0]));
      const values = Array.from(entities).map((entity) => ({
        data: results
          .filter((row: any[]) => row[0] === entity)
          .map((row: any[]) => parseFloat(row[2])),
        label: String(entity),
      }));

      formatted_data = { labels, values };
    } else {
      throw new Error("Unexpected data format in results");
    }

    return { formatted_data_for_visualization: formatted_data };
  }

  private async _format_other_visualizations(
    visualization: string,
    question: string,
    sql_query: string,
    results: any
  ): Promise<Record<string, any>> {
    const instructions =
      graph_instructions[visualization as keyof typeof graph_instructions];
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a Data expert who formats data according to the required needs. You are given the question asked by the user, it's sql query, the result of the query and the format you need to format it in.",
      ],
      [
        "human",
        "For the given question: {question}\n\nSQL query: {sql_query}\nResult: {results}\n\nUse the following example to structure the data: {instructions}. Just give the json string. Do not format it",
      ],
    ]);
    const response = await this.llm_manager.invoke(prompt, {
      question,
      sql_query,
      results: JSON.stringify(results),
      instructions,
    });

    try {
      const formatted_data_for_visualization = JSON.parse(response);
      return { formatted_data_for_visualization };
    } catch (error) {
      return {
        error: "Failed to format data for visualization",
        raw_response: response,
      };
    }
  }
}

export default DataFormatter;
