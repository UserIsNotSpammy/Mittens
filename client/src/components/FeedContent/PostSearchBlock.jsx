import React, { useEffect, useRef } from 'react';
import NavBar from '../containers/NavBar';
import Post from './Post';

import Skeleton from '../skeletons/Skeleton';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { throwError } from '../../utils/helperFunctions';
import { useContext } from 'react';
import { LoginContext } from '../contexts/LoginContext';
import MyProfile from '../Profile/MyProfile';
import PeopleYouMayKnow from '../containers/PeopleYouMayKnow';
import Trending from '../containers/Trending';
const PostSearchBlock = () => {
  const fetchIntervalRef = useRef(null);
  const [isLoading, setIsloading] = useState(true);
  const [post, setPost] = useState(null);
  const { socket } = useContext(LoginContext);
  const { id } = useParams();
  const nav = useNavigate();
  const fetchsinglaRef = useRef();

  useEffect(() => {
    if (fetchsinglaRef.current) {
      fetchsinglaRef.current.abort();
    }

    if (!fetchIntervalRef.current) {
      fetchPost();
    }

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    };
  }, [id]);

  async function fetchPost() {
    const controller = new AbortController();
    fetchsinglaRef.current = controller;
    setIsloading(true);
    const request = new Request(`/api/posts/${id}`, {
      method: 'GET',
      credentials: 'same-origin',
      signal: controller.signal,
    });

    try {
      let res;

      try {
        res = await fetch(request);
      } catch {
        throwError('INTERNAL_ERROR', 503);
      }

      if (!res.ok) throwError(await res.text(), res.status);
      const data = await res.json();
      setPost(data);
      setIsloading(false);
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    } catch (err) {
      if (err.status === 503 && err.messege === 'INTERNAL_ERROR') {
        if (!fetchIntervalRef.current) {
          fetchIntervalRef.current = setInterval(fetchPost, 5000);
        }
      }
      if (err.status === 404) {
        nav('/404');
      }
    }
  }

  return (
    <div className="dark home-page-container">
      <NavBar />
      <div className="home-page-content">
        <div className="left-feed-container">
          <MyProfile />
          <PeopleYouMayKnow />
        </div>

        <div className="feed-container">
          <div className="go-back-block">
            <Link to={'/'} className="go-back-icon">
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m10.978 14.999v3.251c0 .412-.335.75-.752.75-.188 0-.375-.071-.518-.206-1.775-1.685-4.945-4.692-6.396-6.069-.2-.189-.312-.452-.312-.725 0-.274.112-.536.312-.725 1.451-1.377 4.621-4.385 6.396-6.068.143-.136.33-.207.518-.207.417 0 .752.337.752.75v3.251h9.02c.531 0 1.002.47 1.002 1v3.998c0 .53-.471 1-1.002 1z" fillRule="nonzero" />
              </svg>
            </Link>
            <h1 style={{ textAlign: 'center', color: 'var(--text-color)', fontSize: '1.2rem' }}>Go Back To Your Feed</h1>
          </div>

          {!isLoading && post && <Post JoinedRooms={new Set()} socketServer={socket} {...post} />}
          {isLoading && <Skeleton type={'post-skeleton'} withPciture={true} />}

          <div></div>
        </div>

        <Trending />
      </div>
    </div>
  );
};

export default PostSearchBlock;
