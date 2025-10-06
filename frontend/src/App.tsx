import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import QuestionsPage from './pages/QuestionsPage'
import RegisterPage from './pages/RegisterPage'
import ChangeFieldPage from './pages/ChangeFieldPage'



export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-field" element={<ChangeFieldPage />} />
      </Routes>
    </Router>
  )
}
