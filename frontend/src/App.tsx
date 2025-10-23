import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import QuestionsPage from './pages/QuestionsPage'
import RegisterPage from './pages/RegisterPage'
import ChangeFieldPage from './pages/ChangeFieldPage'
import SanitizerTestPage from './pages/SanitizerTestPage'
import ConceptLibraryPage from './pages/ConceptLibraryPage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import { Toaster } from './components/ui/toaster'



export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-field" element={<ChangeFieldPage />} />
        <Route path="/library" element={<ConceptLibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
  <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/sanitizer-test" element={<SanitizerTestPage />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
