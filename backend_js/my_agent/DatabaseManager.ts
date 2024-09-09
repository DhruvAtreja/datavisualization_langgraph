import axios from "axios";

export class DatabaseManager {
  private endpoint_url: string;

  constructor() {
    this.endpoint_url =
      process.env.DB_ENDPOINT_URL || "http://host.docker.internal:3001";
    this.get_schema = this.get_schema.bind(this);
    this.execute_query = this.execute_query.bind(this);
  }

  async get_schema(uuid: string): Promise<string> {
    try {
      console.log("Getting schema for uuid: ", this.endpoint_url);
      const response = await axios.get(
        `${this.endpoint_url}/get-schema/${uuid}`
      );
      return response.data.schema;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error fetching schema: ${error.message}`);
      } else {
        throw new Error(`Error fetching schema: ${String(error)}`);
      }
    }
  }

  async execute_query(uuid: string, query: string): Promise<any[]> {
    try {
      const response = await axios.post(`${this.endpoint_url}/execute-query`, {
        uuid,
        query,
      });
      return response.data.results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error executing query: ${error.message}`);
      } else {
        throw new Error(`Error executing query: ${String(error)}`);
      }
    }
  }
}
