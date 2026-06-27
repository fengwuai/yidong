import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DataStoragePage from './pages/DataStoragePage'
import DataProcessingPage from './pages/DataProcessingPage'
import SimpleQueryPage from './pages/SimpleQueryPage'
import ProfessionalQueryPage from './pages/ProfessionalQueryPage'
import BatchQueryPage from './pages/BatchQueryPage'
import BusinessScenarioPage from './pages/BusinessScenarioPage'
import ExtremeWarningPage from './pages/ExtremeWarningPage'
import WarningRulesPage from './pages/WarningRulesPage'
import WarningPushPage from './pages/WarningPushPage'
import DataPushPage from './pages/DataPushPage'
import HistoryPage from './pages/HistoryPage'
import APIDocsPage from './pages/APIDocsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="data-storage" element={<DataStoragePage />} />
          <Route path="data-processing" element={<DataProcessingPage />} />
          <Route path="simple-query" element={<SimpleQueryPage />} />
          <Route path="professional-query" element={<ProfessionalQueryPage />} />
          <Route path="batch-query" element={<BatchQueryPage />} />
          <Route path="business-scenario" element={<BusinessScenarioPage />} />
          <Route path="extreme-warning" element={<ExtremeWarningPage />} />
          <Route path="warning-rules" element={<WarningRulesPage />} />
          <Route path="warning-push" element={<WarningPushPage />} />
          <Route path="data-push" element={<DataPushPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="api-docs" element={<APIDocsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
