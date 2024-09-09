import React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'

export interface HorizontalBarGraphProps {
  data: {
    labels: string[]
    values: { data: number[]; label: string }[]
  }
}

// Example usage:
export const exampleData: HorizontalBarGraphProps = {
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [{ data: [21.5, 25.0, 47.5, 64.8, 105.5, 133.2], label: '' }],
  },
}

const HorizontalBarGraph: React.FC<HorizontalBarGraphProps> = ({ data }) => {
  return (
    <BarChart
      yAxis={[{ scaleType: 'band', data: data.labels }]}
      series={data.values}
      layout='horizontal'
      width={1000}
      height={300}
      tooltip={{
        trigger: 'item',
      }}
    />
  )
}

export default HorizontalBarGraph
