import React from 'react'
import { ScatterChart } from '@mui/x-charts/ScatterChart'

export interface ScatterPlotProps {
  data: {
    series: {
      data: { x: number; y: number; id: number }[]
      label?: string
    }[]
  }
}

export const exampleData = {
  series: [
    {
      data: [
        {
          x: 0,
          y: 0,
          id: 1,
        },
      ],
      label: '',
    },
  ],
}

export const exampleData2: ScatterPlotProps = {
  data: {
    series: [
      {
        data: [
          { x: 0.42, y: 1.0, id: 1 },
          { x: 0.67, y: 1.0, id: 2 },
          { x: 0.83, y: 2.0, id: 3 },
          { x: 0.92, y: 1.0, id: 4 },
          { x: 1.0, y: 5.0, id: 5 },
          { x: 10.0, y: 1.0, id: 6 },
          { x: 11.0, y: 3.0, id: 7 },
          { x: 12.0, y: 1.0, id: 8 },
          { x: 14.0, y: 2.0, id: 9 },
          { x: 15.0, y: 1.0, id: 10 },
          // ... (truncated for brevity)
        ],
        label: 'male',
      },
      {
        data: [
          { x: 0.75, y: 2.0, id: 1 },
          { x: 1.0, y: 2.0, id: 2 },
          { x: 10.0, y: 1.0, id: 3 },
          { x: 11.0, y: 1.0, id: 4 },
          { x: 13.0, y: 2.0, id: 5 },
          { x: 14.0, y: 4.0, id: 6 },
          { x: 14.5, y: 1.0, id: 7 },
          { x: 15.0, y: 4.0, id: 8 },
          { x: 16.0, y: 6.0, id: 9 },
          { x: 17.0, y: 6.0, id: 10 },
          // ... (truncated for brevity)
        ],
        label: 'female',
      },
    ],
  },
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  const sortedSeries = data.series.map((series) => ({
    ...series,
    data: series.data.sort((a, b) => {
      const xA =
        typeof a.x === 'string'
          ? !isNaN(new Date(a.x).getTime())
            ? new Date(a.x).getTime()
            : parseFloat(a.x as string)
          : a.x
      const xB =
        typeof b.x === 'string'
          ? !isNaN(new Date(b.x).getTime())
            ? new Date(b.x).getTime()
            : parseFloat(b.x as string)
          : b.x
      return xA - xB
    }),
  }))

  return <ScatterChart width={1000} height={300} series={sortedSeries} />
}

export default ScatterPlot
