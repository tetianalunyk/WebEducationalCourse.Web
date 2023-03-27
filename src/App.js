import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UserList from "./components/UsersList/UserList";
import ModelList from './components/ModelsList/ModelList';
import Header from './components/Header/Header';
import NotFound from './components/Error/404';
import Login from './components/Login/Login';
import Forbidden from './components/Error/403';
import InternalServerError from './components/Error/500';
import ProtectedRoute from './routes/PrivateRoute';
import './App.css';

function App() {
  const [authorizedUser, setAuthorizedUser] = useState(localStorage.getItem('loggedUser'));

  return (
    <Router>
      <div>
        <Header user={authorizedUser} handleUser={setAuthorizedUser} />
        <hr />
        <Routes>
          <Route path="/management/users" element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="/management/models" element={
            <ProtectedRoute>
              <ModelList />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login handleUser={setAuthorizedUser} />} />
          <Route path="/unauthorized" element={<Login handleUser={setAuthorizedUser} />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/internalError" element={<InternalServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
