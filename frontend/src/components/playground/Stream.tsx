import { StreamRow } from './StreamRow'
import { GraphState } from './Playground'

export const Stream = ({ graphState }: { graphState: GraphState }) => {
  return (
    <div className='w-full mb-10 items-center  '>
      {graphState.question && <StreamRow heading='Question' information={graphState.question} />}
      {graphState.uuid && <StreamRow heading='UUID' information={graphState.uuid} />}
      {graphState.parsed_question && (
        <StreamRow heading='Parsed Question' information={JSON.stringify(graphState.parsed_question)} />
      )}
      {graphState.unique_nouns && <StreamRow heading='Unique Nouns' information={graphState.unique_nouns.join(', ')} />}
      {graphState.sql_query && <StreamRow heading='SQL Query' information={graphState.sql_query} />}
      {graphState.sql_valid !== undefined && (
        <StreamRow heading='SQL Valid' information={graphState.sql_valid.toString()} />
      )}
      {graphState.sql_issues && <StreamRow heading='SQL Issues' information={graphState.sql_issues} />}
      {graphState.results && <StreamRow heading='Results' information={JSON.stringify(graphState.results)} />}
      {graphState.answer && <StreamRow heading='Answer' information={graphState.answer} />}
      {graphState.error && <StreamRow heading='Error' information={graphState.error} />}
      {graphState.visualization && <StreamRow heading='Visualization' information={graphState.visualization} />}
      {graphState.visualization_reason && (
        <StreamRow heading='Visualization Reason' information={graphState.visualization_reason} />
      )}
      {graphState.visualization_reason && graphState.visualization != 'none' && (
        <StreamRow heading='Formatting data' information={'Loading...'} />
      )}
      {graphState.formatted_data_for_visualization && (
        <StreamRow heading='Formatted Data' information={JSON.stringify(graphState.formatted_data_for_visualization)} />
      )}
    </div>
  )
}
