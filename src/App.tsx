import './App.sass'
import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModelViewer } from '@/components/viewer/ModelViewer'

function App(): ReactElement {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<ModelViewer />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
