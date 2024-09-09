import { Annotation } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  uuid: Annotation<string>,
  parsed_question: Annotation<Record<string, any>>,
  unique_nouns: Annotation<string[]>,
  sql_query: Annotation<string>,
  sql_valid: Annotation<boolean>,
  sql_issues: Annotation<string>,
  results: Annotation<any[] | "NOT_RELEVANT">,
  answer: Annotation<string>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => "",
  }),

  error: Annotation<string>,
  visualization: Annotation<string>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => "",
  }),
  visualization_reason: Annotation<string>({
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    default: () => "",
  }),
  formatted_data_for_visualization: Annotation<Record<string, any>>,
});

export type State = typeof StateAnnotation.State;
