import React,{useState} from "react";
import {ThemeProvider} from "./src/theme/ThemeContext";
import AppShell from "./src/components/layout/AppShell";

export default function App(){
    return (
    <ThemeProvider>
        <AppShell/>
    </ThemeProvider>
    );
}