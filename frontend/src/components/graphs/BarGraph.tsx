import React from 'react'
import { BarChart } from '@mui/x-charts/BarChart'

export interface BarGraphProps {
  data: {
    labels: string[]
    values: { data: number[]; label: string }[]
  }
}

export const exampleData: BarGraphProps = {
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [{ data: [21.5, 25.0, 47.5, 64.8, 105.5, 133.2], label: 'Income' }],
  },
}

export const exampleData2: BarGraphProps = {
  data: {
    labels: ['series A', 'series B', 'series C'],
    values: [
      { data: [10, 15, 20], label: 'American' },
      { data: [20, 25, 30], label: 'European' },
    ],
  },
}

const BarGraph: React.FC<BarGraphProps> = ({ data }) => {
  // Sort the data according to labels
  const sortedData = {
    ...data,
    labels: [...data.labels].sort((a, b) => {
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return a.localeCompare(b)
    }),
    values: data.values.map((value) => ({
      ...value,
      data: data.labels
        .map((label, index) => ({ label, value: value.data[index] }))
        .sort((a, b) => {
          const numA = parseFloat(a.label)
          const numB = parseFloat(b.label)
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB
          }
          return a.label.localeCompare(b.label)
        })
        .map((item) => item.value),
    })),
  }

  return <BarChart xAxis={[{ scaleType: 'band', data: sortedData.labels }]} series={sortedData.values} height={300} />
}

export default BarGraph
