import { useState } from 'react'
import './App.css'
import ReceiptUploader from './Upload'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ReceiptUploader />   
      <section id="spacer"></section>
    </>
  )
}

export default App
