import React, { useEffect, useRef, useState } from 'react';
import { refetch, stopRefetching, throwError } from '../../utils/helperFunctions';
import ViraBlock from './ViralBlock';
import useOutsideClick from '../hooks/UseOutsideClick';
const Trending = () => {
  const skeleArr = Array(7).fill(0);
  const fetchIntervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [virals, setVirals] = useState(null);

  useEffect(() => {
    if (!fetchIntervalRef.current) fetchVirals();
  }, []);

  async function fetchVirals() {
    setIsLoading(true);
    const req = new Request('/api/posts/getVirals', {
      method: 'post',
      credentials: 'same-origin',
    });
    try {
      let res;
      try {
        res = await fetch(req);
      } catch {
        throwError('INTERNET_ERROR', 503);
      }

      if (!res.ok) throwError('Server Respone with', res.status);
      const data = await res.json();
      setVirals(data);
      stopRefetching(fetchIntervalRef);
      setIsLoading(false);
    } catch (err) {
      if (err.status === 503 && err.message === 'INTERNET_ERROR') {
        refetch(fetchIntervalRef, fetchVirals);
      } else {
        setIsLoading(false);
        stopRefetching(fetchIntervalRef);
      }
      // } finally {
      //   setIsLoading(false);
      // }
    }
  }

  return (
    <div className="trending side-block">
      <h3 className="trending-header">
        <span>#</span> Going Viral <span>Fur</span> Real
      </h3>
      <div className="hr" style={{ height: '1px', opacity: '0.7', width: '185px', margin: '13px 0' }}></div>
      <img className="trending-cat" src="/images/zzz.png" alt="" />

      <div className="virals-container">
        {!isLoading &&
          virals &&
          virals.map((viral, i) => {
            return <ViraBlock key={viral.post_id} postText={viral.postText} post_id={viral.post_id} createdAt={viral.createdAt} postedBy={viral.postedBy} />;
          })}

        {isLoading &&
          !virals &&
          skeleArr.map((i) => (
            <div className="skeleton-container-group-trending" key={Math.random() + Date.now()}>
              <div className="skeleton-line"></div>
              <div className="skeleton-line" style={{ width: '40%' }}></div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Trending;
