import React from 'react'
import { NextPage } from 'next'
import Head from 'next/head'

import Playground from '@/components/playground/Playground'

const Home: NextPage = () => (
  <>
    <Head>
      <link rel='icon' href='/logo.jpeg' />
      <title>Data Visualization Tool</title>
    </Head>
    <Playground />
  </>
)

export default Home
