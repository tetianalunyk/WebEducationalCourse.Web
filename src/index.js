import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UserList from "./components/UsersList/UserList";
import ModelList from './components/ModelsList/ModelList';
import Header from './components/Header/Header';
import NotFound from './components/Error/404';
import Login from './components/Login/Login';
import Forbidden from './components/Error/403';
import InternalServerError from './components/Error/500';

const routing = (
  <Router>
    <div>
      <Header />
      <hr />
      <Routes>
        <Route path="/management/users" element={<UserList/>} />
        <Route path="/management/models" element={<ModelList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/internalError" element={<InternalServerError />} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </div>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(routing);

