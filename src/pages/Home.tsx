import React, { Fragment } from 'react'
import Counter from '../components/counter/Counter'

export const Home: React.FC = () => {
  return (
    <Fragment>
      <h1>Ratio Finace</h1>
      <p>Hello and welcome!</p>
      <Counter />
    </Fragment>
  )
}
