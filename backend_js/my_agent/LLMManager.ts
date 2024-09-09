import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

class LLMManager {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });
    this.invoke = this.invoke.bind(this);
  }

  async invoke(
    prompt: ChatPromptTemplate,
    kwargs: Record<string, any>
  ): Promise<string> {
    const messages = await prompt.formatMessages(kwargs);
    const response = await this.llm.invoke(messages);
    return response.content as string;
  }
}

export default LLMManager;
