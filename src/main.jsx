// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import { BrowserRouter as Router } from 'react-router-dom';
// // import ThemeProvider from './utils/ThemeContext';
// // import App from './App';

// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <React.StrictMode>
// //     <Router>
// //       <ThemeProvider>
// //         <App />
// //       </ThemeProvider>
// //     </Router>
// //   </React.StrictMode>
// // );

// // import React from 'react'
// // import ReactDOM from 'react-dom/client'
// // import App from './App.jsx'
// // import './index.css'
// // import { BrowserRouter } from 'react-router-dom'
// // import { ToastContainer } from "react-toastify";
// // import { AuthProvider } from './context/auth.jsx'
// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <React.StrictMode>
// //     <BrowserRouter>
// //     <AuthProvider>
// //     <App />
// //     <ToastContainer position="top-right" autoClose={3000} />
// //     </AuthProvider>
// //     </BrowserRouter>
// //   </React.StrictMode>,
// // )
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { ToastContainer } from "react-toastify";
// import { AuthProvider } from './context/auth.jsx'
// import { LanguageProvider } from './context/LanguageContext'  // استيراد LanguageProvider
// import ThemeProvider from './context/ThemeContext'             // استيراد ThemeProvider

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <LanguageProvider>      {/* لف هنا LanguageProvider */}
//           <ThemeProvider>       {/* ولّف هنا ThemeProvider */}
//             <App />
//             <ToastContainer position="top-right" autoClose={3000} />
//           </ThemeProvider>
//         </LanguageProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// )

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./context/auth.jsx";
import { LanguageProvider } from "./context/LanguageContext";
import ThemeProvider from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);