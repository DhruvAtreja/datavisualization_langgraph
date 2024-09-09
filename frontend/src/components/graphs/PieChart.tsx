import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'

export interface PieChartProps {
  data: {
    id: number
    value: number
    label: string
  }[]
}

export const exampleData: PieChartProps = {
  data: [
    { id: 0, value: 10, label: '' },
    { id: 1, value: 15, label: '' },
    { id: 2, value: 20, label: '' },
  ],
}

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  console.log(data)
  return (
    <PieChart
      series={[
        {
          data: data,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
        },
      ]}
      height={300}
    />
  )
}

export default PieChartComponent
