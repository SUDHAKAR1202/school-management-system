import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout    from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students  from "./pages/Students";
import Tasks     from "./pages/Tasks";
import Login     from "./pages/Login";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students"  element={<Students />} />
          <Route path="tasks"     element={<Tasks />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
