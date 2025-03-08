import React, { useEffect, useRef, useState } from 'react';
import User from '../User';
import UserSkeleton from '../skeletons/UserSkeleton.jsx';
import { throwError } from '../../utils/helperFunctions';
const PeopleYouMayKnow = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(3);
  const fetchedUsers = useRef(new Set());
  const fetchInterval = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const req = new Request(`/api/users?limit=${limit}`, {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fetchedUsers: Array.from(fetchedUsers.current) }),
    });

    try {
      let res;
      try {
        res = await fetch(req);
      } catch {
        throwError('Internet connection failure', 503);
      }
      if (!res.ok) throwError((await res.text()) || 'Unknown error occurred', res.status || 500);

      try {
        const data = await res.json();
        data.forEach((user) => {
          fetchedUsers.current.add(user.userTag);
        });
        setUsers([...users, ...data]);
        setIsLoading(false);
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
      } catch {
        throwError('Something wrong happened', 500);
      }
    } catch (err) {
      if (err.status === 503) {
        if (!fetchInterval.current) {
          fetchInterval.current = setInterval(() => {
            fetchUsers();
          }, 3000);
        }
      } else {
        clearInterval(fetchInterval.current);
        fetchInterval.current = null;
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="side-block pymk">
      <h1 style={{ color: 'white', opacity: '0.9' }}>
        {' '}
        <span style={{ color: 'var(--text-color-glowng)' }}>People</span> you may know
      </h1>
      {users.map((user) => (
        <User {...user} key={user.userTag} />
      ))}

      {isLoading && (
        <>
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </>
      )}

      <span
        className="glowing-link"
        onClick={() => {
          setLimit(6);
          fetchUsers();
        }}>
        Show more
      </span>
    </div>
  );
};

export default PeopleYouMayKnow;
