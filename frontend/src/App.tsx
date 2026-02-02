import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { client } from './api/apollo'
import './App.css'

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>TaskFlow Pro</h1>
            <p>Collaborative Task Management Platform</p>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<div>Welcome to TaskFlow Pro</div>} />
              <Route path="/login" element={<div>Login Page</div>} />
              <Route path="/register" element={<div>Register Page</div>} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  )
}

export default App
