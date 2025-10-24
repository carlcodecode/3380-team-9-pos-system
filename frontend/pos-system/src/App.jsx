import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  const [count, setCount] = useState(0)

  // Connect to backend
  useEffect(() => {
    fetch("http://18.188.240.121:3000/api/test")
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(console.error);
  }, []);

  return (
    <></>
  )
}

export default App
