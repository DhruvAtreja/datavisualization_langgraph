import BarGraph, { BarGraphProps, exampleData as barExampleData } from './BarGraph'
import HorizontalBarGraph, {
  HorizontalBarGraphProps,
  exampleData as horizontalBarExampleData,
} from './HorizontalBarGraph'
import ScatterPlot, { ScatterPlotProps, exampleData as scatterExampleData } from './ScatterPlot'
import LineGraph, { LineGraphProps, exampleData as lineExampleData } from './LineGraph'
import PieChart, { PieChartProps, exampleData as pieExampleData } from './PieChart'

export type InputType = BarGraphProps | HorizontalBarGraphProps | ScatterPlotProps | LineGraphProps | PieChartProps

export const graphDictionary = {
  bar: {
    component: BarGraph,
    description:
      'Requires data of type BarGraphProps. Best for comparing categorical data or showing changes over time when categories are discrete. Use for questions like "What are the sales figures for each product?" or "How does the population of cities compare?"',
    exampleData: barExampleData,
  },
  horizontal_bar: {
    component: HorizontalBarGraph,
    description:
      'Requires data of type HorizontalBarGraphProps. Similar to bar graph, but with horizontal orientation. Best for comparing categorical data, especially with long category names.',
    exampleData: horizontalBarExampleData,
  },
  scatter: {
    component: ScatterPlot,
    description:
      'Requires data of type ScatterPlotProps. Useful for identifying relationships or correlations between two numerical variables. Use for questions like "Is there a relationship between advertising spend and sales?" or "How do height and weight correlate in the dataset?"',
    exampleData: scatterExampleData,
  },
  line: {
    component: LineGraph,
    description:
      'Requires data of type LineGraphProps. Best for showing trends over time with continuous data. Use for questions like "How have website visits changed over the year?" or "What is the trend in temperature over the past decade?"',
    exampleData: lineExampleData,
  },
  pie: {
    component: PieChart,
    description:
      'Requires data of type PieChartProps. Ideal for showing proportions or percentages within a whole. Use for questions like "What is the market share distribution among different companies?" or "What percentage of the total revenue comes from each product?"',
    exampleData: pieExampleData,
  },
}
