// import React from 'react';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../components/contexts/LoginContext.jsx';

import LoadingScreen from '../components/Auth/LoadingScreen';
import Bg from '../components/Auth/Bg';
import { handleRequest } from '../utils/helperFunctions.js';

const Login = () => {
  const { setUserData, setIsLoggedIn, isLoading, isLoggedIn } = useContext(LoginContext);
  const nav = useNavigate();
  const fetchIntervalRef = useRef(null);

  const [loadState, setLoadState] = useState(false);
  const credsRef = useRef({ userTag: null, password: null });

  function login(e) {
    e.preventDefault();
    handleRequest(
      new Request('/api/auth/login', { method: 'post', credentials: 'same-origin', body: JSON.stringify({ ...credsRef.current }), headers: { 'Content-Type': 'application/json' } }),
      fetchIntervalRef,
      setLoadState,
      (data) => {
        setIsLoggedIn(true);
        setUserData(data);
      },
      null
    );
  }
  useEffect(() => {
    if (isLoggedIn) {
      nav('/');
    }
  }, [isLoggedIn]);
  if (!isLoggedIn && !isLoading)
    return (
      <>
        <LoadingScreen state={loadState} />
        <Bg />

        <form action="" id="loginForm" onSubmit={login}>
          <div className="login-form-wrapper">
            <div className="logo-side-container">
              <figure className="logo"></figure>
              <h1 className="wlcm-msg">
                Unleash your inner <span>kitten</span>
              </h1>
              <div className="ultimate-bg2"></div>
            </div>
            <div className="form-block">
              <div className="input-field">
                <label style={{ fontSize: '1rem' }}>
                  User tag <span></span>
                </label>
                <input
                  autocomplete="new-password"
                  type="text"
                  name="userTag"
                  onChange={(e) => {
                    credsRef.current.userTag = e.target.value;
                  }}
                />
              </div>
              <div className="input-field">
                <label style={{ fontSize: '1rem' }}>
                  Password <span></span>
                </label>
                <input
                  autocomplete="new-password"
                  type="password"
                  name="password"
                  onChange={(e) => {
                    credsRef.current.password = e.target.value;
                  }}
                />
              </div>
              <div className="form-btnZ-container">
                <div className="btnz" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <input type="submit" value="Login" className="form-btn" form="loginForm" style={{ padding: '0.4em', width: '100%' }} />
                </div>
              </div>
              <div className="form-links">
                <Link to="/register">Create an account</Link>
                <Link to="/">Forgot password?</Link>
              </div>
            </div>
          </div>
        </form>
      </>
    );
};
export default Login;
