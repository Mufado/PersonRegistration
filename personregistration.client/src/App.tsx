import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { PeopleListPage } from "./pages/PeopleListPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PeopleListPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}