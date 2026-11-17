import { Navigate, Route, Routes } from 'react-router-dom'
import Sistema from './pages/Sistema/Sistema'

export default function App() {
  return (
    <Routes>
      <Route path="/sistema" element={<Sistema />} />
      <Route path="*" element={<Navigate to="/sistema" replace />} />
    </Routes>
  )
}
