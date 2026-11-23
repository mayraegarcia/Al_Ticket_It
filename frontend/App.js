import React,{useState} from "react";
import {ThemeProvider} from "./src/theme/ThemeContext";
import AppShell from "./src/components/layout/AppShell";
import { AuthProvider } from "./src/context/authContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}