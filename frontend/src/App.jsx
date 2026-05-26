import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RecordDetail from "./pages/RecordDetail";
import ReviewQueue from "./pages/ReviewQueue";
import {
  AuthProvider,
} from "./context/AuthContext";

import Login from "./pages/Login";
import Companies from "./pages/Companies";

import CompanyWorkspace from "./pages/CompanyWorkspace";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ClientDashboard
  from "./pages/ClientDashboard";
import AdminDashboard
  from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Users from "./pages/Users";

import IngestionHealth from "./pages/IngestionHealth";
export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* Login */}

          <Route
            path="/"
            element={<Login />}
          />
          <Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Upload */}
          <Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>

<Route
  path="/ingestion-health"
  element={
    <ProtectedRoute>
      <IngestionHealth />
    </ProtectedRoute>
  }
/>

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}

          <Route
            path="*"
            element={
              <Navigate to="/" />
            }
          />

          <Route
  path="/reviews"
  element={
    <ProtectedRoute>
      <ReviewQueue />
    </ProtectedRoute>
  }
/>
<Route
  path="/records/:id"
  element={
    <ProtectedRoute>
      <RecordDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/client-dashboard"
  element={
    <ProtectedRoute>
      <ClientDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/companies"
  element={
    <ProtectedRoute>
      <Companies />
    </ProtectedRoute>
  }
/>

<Route
  path="/companies/:companyId"
  element={
    <ProtectedRoute>
      <CompanyWorkspace />
    </ProtectedRoute>
  }
/>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}