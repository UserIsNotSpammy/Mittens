import React, { useContext, useEffect, useRef, useState } from 'react';
import Post from './Post';
import CreatePost from './CreatePost';
import Skeleton from '../skeletons/Skeleton';
import { LoginContext } from '../contexts/LoginContext';
import { handleRequest, throwError } from '../../utils/helperFunctions';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
import MessageWindow from '../window/MessageWindow';
const Feed = ({ children }) => {
  const { userData } = useContext(LoginContext);
  const { filter, tag } = useContext(ProfileDataContext) || {};
  const userTag = tag;

  const [posts, setPosts] = useState([]);
  const [noMore, setNoMore] = useState(false);
  const [errorsWindow, setErrorsWindow] = useState(null);

  const [isLoading, setIsloading] = useState(false);
  const loadedPosts = useRef(new Set());

  const postSkeleRef = useRef();
  const isFetchingRef = useRef(false);
  const fetchIntervalRef = useRef();
  const fetchSignlaRef = useRef();
  const joinedRooms = useRef(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && !fetchIntervalRef.current) {
        fetchPosts();
      }
    });

    if (postSkeleRef.current) {
      observer.observe(postSkeleRef.current);
    }

    return () => {
      if (postSkeleRef.current) {
        observer.unobserve(postSkeleRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (isFetchingRef.current) {
        fetchSignlaRef.current.abort();
      }
    };
  }, []);

  async function fetchPosts() {
    fetchSignlaRef.current = new AbortController();
    await handleRequest(
      new Request(`/api/posts/loadPosts?user=${userTag || ''}&filter=${filter || ''}`, {
        method: 'POST',
        credentials: 'include',
        signal: fetchSignlaRef.current.signal,
        body: JSON.stringify({ loadedPosts: [...loadedPosts.current] }),
        headers: { 'Content-Type': 'application/json' },
      }),
      fetchIntervalRef,
      setIsloading,
      (data) => {
        if (data.length) {
          data.forEach((element) => {
            loadedPosts.current.add(element.post_id);
          });
          setPosts((prev) => [...prev, ...data]);
        }

        if (!data.length) {
          setNoMore(true);
        }
      },
      setErrorsWindow
    );
  }

  return (
    <>
      {errorsWindow && <MessageWindow response={errorsWindow} />}

      <div className="feed-container">
        {children}
        {userTag === userData.userTag && !filter && <CreatePost setPosts={setPosts} />}
        {userTag == null && <CreatePost setPosts={setPosts} />}

        {posts.map((post) => (
          <Post JoinedRooms={joinedRooms.current} key={post.post_id} {...post} setPosts={setPosts} posts={posts} />
        ))}

        {!noMore && (
          <>
            <Skeleton Ref={postSkeleRef} type={'post-skeleton'} />
            <Skeleton type={'post-skeleton'} withPciture={true} />
            <Skeleton type={'post-skeleton'} />
          </>
        )}
        {noMore && (
          <h1 className="caught-up-message" style={{ alignSelf: 'center' }}>
            Wow, did you actually scroll that far?
          </h1>
        )}

        <div></div>
      </div>
    </>
  );
};
export default Feed;
