from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

class LLMManager:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def invoke(self, prompt: ChatPromptTemplate, **kwargs) -> str:
        messages = prompt.format_messages(**kwargs)
        response = self.llm.invoke(messages)
        return response.content