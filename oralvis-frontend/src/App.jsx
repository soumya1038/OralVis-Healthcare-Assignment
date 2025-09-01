
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './component/Home'
import Login from './component/login'
import TechnicianUpload from './component/technician'
import Dentist from './component/dentist'
import ProtectedRoute from './ProtectedRoute'



const App = () => (
  <Router>
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/' element={<Home />} />
        <Route path="/technician" element={<ProtectedRoute element={<TechnicianUpload />} />} />
        <Route path="/dentist" element={<ProtectedRoute element={<Dentist />} />} />
      </Routes>
    </div>
  </Router>
)


export default App