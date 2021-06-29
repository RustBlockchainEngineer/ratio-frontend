import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Layer from './pages/Layer'

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" component={Layer} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
