import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UserList from "./components/UsersList/UserList";
import ModelList from './components/ModelsList/ModelList';
import Header from './components/Header/Header';

const routing = (
  <Router>
    <div>
      <Header />
      <hr />
      <Routes>
        <Route path="/management/users" element={<UserList/>} />
        <Route path="/management/models" element={<ModelList />} />
        <Route path="*" element={<ModelList/>} />
      </Routes>
    </div>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(routing);

