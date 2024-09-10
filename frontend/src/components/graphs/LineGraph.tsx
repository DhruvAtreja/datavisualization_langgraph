import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'

export interface LineGraphProps {
  data: {
    xValues: number[] | string[]
    yValues: { data: number[]; label: string }[]
  }
}

// Example usage:
export const exampleData: LineGraphProps = {
  data: {
    xValues: [1, 2, 3, 4, 5],
    yValues: [
      { data: [2, 5.5, 2, 8.5, 1.5], label: '' },
      { data: [2, 5.5, 2, 8.5, 1.5], label: '' },
    ],
  },
}

// Example usage with date strings and multiple series:
export const exampleData2: LineGraphProps = {
  data: {
    xValues: [
      '1/1/2019',
      '1/10/2019',
      '1/12/2019',
      '1/13/2019',
      '1/15/2019',
      '1/17/2019',
      '1/2/2019',
      '1/20/2019',
      '1/21/2019',
      '1/22/2019',
      '1/23/2019',
      '1/24/2019',
      '1/25/2019',
      '1/26/2019',
      '1/27/2019',
      '1/28/2019',
      '1/5/2019',
      '1/6/2019',
      '1/7/2019',
      '1/9/2019',
      '2/10/2019',
      '2/11/2019',
      '2/12/2019',
      '2/14/2019',
      '2/15/2019',
      '2/17/2019',
      '2/2/2019',
      '2/20/2019',
      '2/23/2019',
      '2/24/2019',
      '2/25/2019',
      '2/27/2019',
      '2/28/2019',
      '2/3/2019',
      '2/6/2019',
      '2/7/2019',
      '2/8/2019',
      '2/9/2019',
      '3/10/2019',
      '3/11/2019',
      '3/12/2019',
      '3/13/2019',
      '3/15/2019',
      '3/16/2019',
      '3/19/2019',
      '3/2/2019',
      '3/22/2019',
      '3/23/2019',
      '3/25/2019',
      '3/27/2019',
      '3/29/2019',
      '3/3/2019',
      '3/4/2019',
      '3/5/2019',
      '3/6/2019',
      '3/7/2019',
      '3/8/2019',
      '3/9/2019',
    ],
    yValues: [
      {
        data: [
          457.443, 703.752, 0, 0, 0, 0, 44.5935, 0, 172.2105, 705.6315, 161.7, 827.085, 16.2015, 0, 489.048, 737.7615,
          0, 939.54, 0, 463.428, 119.259, 652.26, 0, 318.108, 0, 181.44, 117.831, 0, 0, 351.099, 945.8925, 535.7205, 0,
          671.79, 94.2375, 1206.135, 669.5745, 0, 328.755, 0, 801.045, 166.635, 507.7485, 32.277, 0, 279.1845, 0,
          166.1625, 1029.3465, 456.057, 922.635, 593.5335, 0, 798.147, 166.005, 33.936, 102.018, 363.9195,
        ],
        label: 'Male',
      },
      {
        data: [
          0, 237.699, 189.0945, 437.325, 1165.752, 91.056, 0, 759.675, 624.897, 106.995, 198.996, 0, 463.89, 775.572, 0,
          0, 548.9715, 0, 686.469, 0, 304.3845, 0, 246.4875, 0, 77.931, 0, 19.2465, 172.746, 337.512, 772.38, 433.692,
          485.037, 722.232, 520.4115, 667.4745, 0, 435.456, 78.435, 184.107, 591.2655, 0, 0, 0, 867.615, 0, 516.81,
          461.328, 0, 0, 749.49, 0, 829.08, 1585.584, 0, 0, 80.22, 872.865,
        ],
        label: 'Female',
      },
    ],
  },
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  // Sort the data according to x-axis
  const sortedData = {
    xValues: [...data.xValues].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b
      }

      if (
        typeof a === 'string' &&
        typeof b === 'string' &&
        !isNaN(new Date(a).getTime()) &&
        !isNaN(new Date(b).getTime())
      ) {
        const dateA = new Date(a).getTime()
        const dateB = new Date(b).getTime()
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return dateA - dateB
        }
      }
      const numA = parseFloat(a as string)
      const numB = parseFloat(b as string)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return (a as string).localeCompare(b as string)
    }),
    yValues: data.yValues.map((series) => ({
      ...series,
      connectNulls: true,
      data: data.xValues
        .map((x, i) => ({ x, y: series.data[i] }))
        .sort((a, b) => {
          if (typeof a.x === 'number' && typeof b.x === 'number') {
            return a.x - b.x
          }
          if (
            typeof a.x === 'string' &&
            typeof b.x === 'string' &&
            !isNaN(new Date(a.x).getTime()) &&
            !isNaN(new Date(b.x).getTime())
          ) {
            const dateA = new Date(a.x).getTime()
            const dateB = new Date(b.x).getTime()
            if (!isNaN(dateA) && !isNaN(dateB)) {
              return dateA - dateB
            }
          }
          const numA = parseFloat(a.x as string)
          const numB = parseFloat(b.x as string)
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB
          }
          // If not dates, compare as strings
          return (a.x as string).localeCompare(b.x as string)
        })
        .map((point) => point.y),
    })),
  }

  return (
    <LineChart
      xAxis={[{ scaleType: 'point', data: sortedData.xValues }]}
      series={sortedData.yValues}
      width={1000}
      height={300}
    />
  )
}

export default LineGraph
