import React, { useEffect, useRef, useState } from 'react';
import useOutsideClick from '../hooks/UseOutsideClick';
import SearchResult from './SearchResult';
import SearchResultSkeleton from '../skeletons/SearchResultSkeleton';
import { handleRequest } from '../../utils/helperFunctions';

const SearchResults = () => {
  const searchResultsContainerRef = useRef();
  const [searchResults, setSearchResults] = useState([]);
  const [searchMenu, setSeachMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const alreadyLoaded = useRef(new Set());
  const intervalRef = useRef(null);
  const timeOutRef = useRef(null);
  const signalRef = useRef(null);
  const [noMore, setNoMore] = useState(false);
  const [query, setQuery] = useState('');
  useOutsideClick(searchResultsContainerRef, null, () => {
    setSearchResults([]);
    setSeachMenu(false);
  });

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query]);
  async function search() {
    setSearchResults([]);
    alreadyLoaded.current = new Set();
    setSeachMenu(true);
    if (signalRef.current) signalRef.current?.abort();
    if (timeOutRef.current) clearTimeout(timeOutRef.current);
    timeOutRef.current = setTimeout(() => {
      signalRef.current = new AbortController();
      handleRequest(
        new Request(`/api/posts/search/post?searchQuery=${query}`, { method: 'post', credentials: 'same-origin', signal: signalRef.current.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alreadyLoaded: [...alreadyLoaded.current] }) }),
        intervalRef,
        setIsLoading,
        (data) => {
          if (data.length < 4) setNoMore(true);
          setSearchResults((prev) => [...prev, ...data]);
          data.forEach((post) => {
            alreadyLoaded.current.add(post.post_id);
          });
        },
        (err) => {}
      );
    }, 200);
  }

  return (
    <>
      <div className="search-area-container">
        <input type="text" placeholder="@Explore" className="searchBar" onChange={(e) => setQuery(e.target.value)} />
        {searchMenu && (
          <div className="search-results-container side-block" ref={searchResultsContainerRef}>
            {isLoading && (
              <>
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
                <SearchResultSkeleton />
              </>
            )}

            {!isLoading &&
              searchResults.map((post) => {
                return <SearchResult key={post.post_id} {...post} />;
              })}

            {!noMore && (
              <span className="glowing-link" style={{ marginTop: 'auto' }}>
                Show More
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;
