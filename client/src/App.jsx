import HomePage from './pages/HomePage';

import '../node_modules/plyr/dist/plyr.css';
import './css/main.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import Chats from './pages/Chats';
import Login from './pages/Login';
import Register from './pages/Register';
import PostSearchBlock from './components/FeedContent/PostSearchBlock';
import { LoginContextProvider } from './components/contexts/LoginContext';
import { useEffect } from 'react';
import NotFound from './pages/NotFound';
import ProtectedRoutes from './components/contexts/ProtectedRoutes';
import { ProfileDataContextProvider } from './components/contexts/ProfileDataContext';
import { ActiveChatContextProvider } from './components/contexts/ActiveChatContext';

const App = () => {
  return (
    <BrowserRouter>
      <LoginContextProvider>
        <Routes>
          {/* Public Routes */}

          <Route element={<Login />} path="/Login" />
          <Route element={<Register />} path="/Register" />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route
              element={
                <ActiveChatContextProvider>
                  <Chats />
                </ActiveChatContextProvider>
              }
              path="/Chats"
            />
            <Route element={<PostSearchBlock />} path="/posts/:id" />
            <Route element={<HomePage />} path="/" />
            <Route
              path="/Mewtopia/:tag"
              element={
                <ProfileDataContextProvider>
                  <Profile />
                </ProfileDataContextProvider>
              }
            />
          </Route>

          {/* Catch-all NotFound route */}
          <Route element={<NotFound />} path="*" />
        </Routes>
      </LoginContextProvider>
    </BrowserRouter>
  );
};
export default App;
