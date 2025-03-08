import React, { useState, useRef, useEffect } from 'react';
import { useContext } from 'react';
import { LoginContext } from '../contexts/LoginContext';
import { ActiveChatContext } from '../contexts/ActiveChatContext';
import ChatLink from './ChatLink';
import { handleRequest, stopRefetching } from '../../utils/helperFunctions';
import ChatLinkSkeleton from '../skeletons/ChatLinkSkeleton.jsx';
const SidePanel = () => {
  const { domain, userData } = useContext(LoginContext);
  const { chatLinks, setChatLinks, filter, setFilter } = useContext(ActiveChatContext);

  const fetchIntervalRef = useRef();
  const loadedChatsRef = useRef(new Set());
  const [noMore, setNoMore] = useState(false);
  const skeletonRef = useRef();
  const [isLoading, setIsloading] = useState(false);
  const fetchSignlaRef = useRef();
  const skeletonCount = Array(3).fill(0);
  const observerRef = useRef();

  const timeOut = useRef();

  async function fetchChatLinks() {
    fetchSignlaRef.current = new AbortController();

    await handleRequest(
      new Request(`/api/chats?filter=${filter}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ loadedChats: [...loadedChatsRef.current] }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: fetchSignlaRef.current.signal,
      }),
      fetchIntervalRef,
      setIsloading,
      (data) => {
        data.forEach((element) => {
          loadedChatsRef.current.add(element._id);
        });
        setChatLinks((prev) => [...prev, ...data]);
        if (data.length < 10) setNoMore(true);
      },
      (err) => {}
    );
  }

  useEffect(() => {
    if (fetchIntervalRef) {
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && !fetchIntervalRef.current) {
        fetchChatLinks();
      }
    });

    if (skeletonRef.current) {
      observerRef.current.observe(skeletonRef.current);
    }

    return () => {
      if (skeletonRef.current) {
        observerRef.current.unobserve(skeletonRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (isLoading) {
        fetchSignlaRef.current?.abort();
      }
    };
  }, [filter]);

  function resetAndSearch(e) {
    const newFilterValue = e.target.value;

    if (fetchSignlaRef.current) {
      fetchSignlaRef.current.abort();

      setIsloading(false);
    }

    if (timeOut.current) {
      clearTimeout(timeOut.current);
    }

    timeOut.current = setTimeout(() => {
      setFilter(newFilterValue);
      setChatLinks([]);
      loadedChatsRef.current = new Set();
      setNoMore(false);
    }, 200);
  }
  return (
    <div className="chats-side-panel">
      <header className="side-panel-header">
        <h1 className="wlcm-msg">
          {/* <span>Hello</span>, {userData.firstName} {userData.lastName} */}
          <span>Welcome</span> To Kitty Land
        </h1>

        <div className="chats-search-bar">
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007z" fillRule="nonzero" />
          </svg>
          <input placeholder="Search for other fellow kitties" type="text" onChange={(e) => resetAndSearch(e)} />
        </div>
        <div className="hr" style={{ margin: '0' }}></div>
      </header>

      <div className="chat-links-container">
        {chatLinks.map((chatLink) => (
          <ChatLink {...chatLink} key={chatLink._id} />
        ))}
        {!noMore && <ChatLinkSkeleton skeletonRef={skeletonRef} />}
        {!noMore && skeletonCount.map((_, index) => <ChatLinkSkeleton key={index} />)}
      </div>

      <div className="side-panel-nav">
        {/* <div className="side-panel-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24">
            <path d="M15,10.278c0-.787-.5-1.778-2-2.778,0,0,0-.008,0-.009,1.132-.044,2-.559,2-1.991,0-1.5-3.222-5.5-4.462-5.5-.916,0-1.52,.371-2.431,1.046-.199-.019-.392-.046-.608-.046s-.409,.027-.608,.046c-.911-.675-1.515-1.046-2.431-1.046C3.222,0,0,4,0,5.5c0,1.432,.868,1.947,2,1.991,0,0,0,.009,0,.009-1.5,1-2,1.991-2,2.778,0,3.5,3.624,4.722,7.125,4.722h.751c3.5,0,7.124-1.222,7.124-4.722ZM3.5,6.5c0-.828,.672-1.5,1.5-1.5s1.5,.672,1.5,1.5-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5Zm4,4.5c-.966,0-1.5-.771-1.5-1.208s.534-.792,1.5-.792,1.5,.354,1.5,.792-.534,1.208-1.5,1.208Zm2.5-3c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5,.672,1.5,1.5-.672,1.5-1.5,1.5Zm13.404,2.803l-.414-2.276-2.938,2.01c-.95-.55-1.985-.858-3.06-.934,.001,.039,.008,.08,.008,.118,0,.017-.024,.052-.033,.076,.02,.168,.033,.33,.033,.48,0,1.73-.649,3.197-1.811,4.317,.192,.252,.311,.563,.311,.905,0,.828-.672,1.5-1.5,1.5-.585,0-1.087-.339-1.334-.828-1.062,.421-2.289,.692-3.662,.787-.001,.132-.004,.263-.004,.399,0,3.663,2.98,6.643,6.643,6.643h1.714c3.663,0,6.643-2.979,6.643-6.643,0-3.241-.571-6.421-.596-6.554Zm-6.904,9.197c-.966,0-1.5-.771-1.5-1.208s.534-.792,1.5-.792,1.5,.354,1.5,.792-.534,1.208-1.5,1.208Zm2.5-3c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5,.672,1.5,1.5-.672,1.5-1.5,1.5Z" />
          </svg>
        </div>
        <div className="side-panel-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" dataname="Layer 1" viewBox="0 0 24 24">
            <path d="m23.447.105c-.34-.17-.746-.133-1.047.095l-1.69,1.267c-.677-.299-1.424-.467-2.21-.467s-1.533.169-2.21.467l-1.69-1.267c-.303-.228-.709-.265-1.047-.095-.339.169-.553.516-.553.895v5.5c0,3.033,2.467,5.5,5.5,5.5s5.5-2.467,5.5-5.5V1c0-.379-.214-.725-.553-.895Zm.553,22.894h0c0,.553-.448,1-1,1h-5v-2c0-2.915-2.089-5.351-4.848-5.889-.601-.117-1.152.378-1.152.991v.004c0,.485.353.88.828.981,1.809.383,3.172,1.992,3.172,3.914v2H6.558c-3.224,0-6.558-2.058-6.558-5.5,0-2.135.945-3.659,1.779-5.004.655-1.056,1.221-1.969,1.221-2.996,0-1.135-.277-2.195-2.107-2.445-.504-.069-.893-.482-.893-.99,0-.593.519-1.074,1.107-.997,3.357.44,3.893,2.905,3.893,4.432,0,1.597-.773,2.844-1.521,4.051-.76,1.226-1.479,2.384-1.479,3.949,0,1.791,1.467,2.851,2.997,3.279.007-1.299.364-7.986,6.719-11.077.159-.07.307-.131.456-.193,1.332,2.094,3.667,3.491,6.328,3.491,1.264,0,2.454-.317,3.5-.872v8.872h1c.552,0,1,.448,1,1Z" />
          </svg>
        </div> */}
        <div className="side-panel-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={70} height={70} viewBox="0 0 512 512" version="1.1">
            <path
              d="M 247.018 199.077 C 244.553 200.195, 241.781 201.794, 240.857 202.629 C 239.934 203.465, 234.600 205.206, 229.005 206.499 C 222.539 207.993, 218.294 209.515, 217.360 210.675 C 211.487 217.967, 210.288 229.172, 214.481 237.586 C 217.763 244.173, 239.880 266.139, 246.046 268.936 C 251.994 271.634, 261.011 271.632, 266.963 268.931 C 269.828 267.632, 275.814 262.519, 283.675 254.659 C 298.370 239.963, 301.585 234.387, 300.739 225.058 C 300.151 218.575, 297.039 211.706, 293.737 209.607 C 292.507 208.824, 287.900 207.420, 283.500 206.485 C 279.036 205.537, 273.866 203.685, 271.802 202.293 C 263.598 196.762, 254.674 195.604, 247.018 199.077 M 39.009 213.239 C 36.164 214.736, 35.294 217.445, 36.999 219.499 C 38.344 221.119, 41.035 221.503, 61.500 222.992 C 94.667 225.406, 130.585 232.595, 166.592 244.029 C 173.560 246.242, 180.090 247.789, 181.104 247.467 C 184.092 246.518, 187 242.007, 187 238.320 C 187 233.122, 183.679 230.575, 172.358 227.092 C 150.801 220.460, 127.811 216.815, 93.500 214.591 C 54.667 212.074, 41.828 211.756, 39.009 213.239 M 450 212.693 C 429.453 213.501, 393.961 216.301, 381.500 218.096 C 355.674 221.816, 331.704 228.205, 327.392 232.517 C 323.159 236.750, 325.251 245.675, 330.896 247.467 C 331.910 247.789, 338.535 246.211, 345.620 243.960 C 379.133 233.314, 411.095 226.657, 443.911 223.488 C 452.386 222.670, 461.836 221.993, 464.911 221.985 C 471.919 221.967, 475.500 220.281, 475.500 217 C 475.500 212.271, 472.708 211.799, 450 212.693 M 138.197 253.099 C 111.224 255.041, 78.358 260.065, 37 268.570 C 6.618 274.817, 1.347 276.331, 0.482 279.056 C -0.365 281.726, 0.515 282.772, 4.544 283.885 C 7.256 284.633, 11.025 284.220, 21.758 281.996 C 59.481 274.182, 106.871 270, 157.712 270 C 180.420 270, 182.989 269.641, 185.718 266.087 C 187.929 263.207, 187.257 257.530, 184.364 254.636 L 181.727 252 165.614 252.143 C 156.751 252.221, 144.414 252.652, 138.197 253.099 M 327.750 254.498 C 324.745 257.530, 324.032 263.156, 326.282 266.087 C 329.011 269.641, 331.580 270, 354.288 270 C 405.129 270, 452.519 274.182, 490.242 281.996 C 500.975 284.220, 504.744 284.633, 507.456 283.885 C 511.485 282.772, 512.365 281.726, 511.518 279.056 C 510.689 276.446, 505.572 274.905, 480 269.564 C 424.169 257.902, 390.780 253.374, 353 252.340 L 330.500 251.724 327.750 254.498 M 166 276.419 C 154.853 279.354, 134.024 286.280, 121.500 291.216 C 106.771 297.022, 86.757 306.048, 84.750 307.791 C 81.048 311.004, 83.676 315, 89.491 315 C 90.933 315, 95.800 313.487, 100.307 311.637 C 118.334 304.238, 125.022 302.433, 158.269 295.999 C 171.892 293.362, 184.148 290.478, 185.503 289.590 C 188.626 287.544, 189.581 283.817, 187.975 279.941 C 185.290 273.457, 180.292 272.656, 166 276.419 M 326.495 276.414 C 321.509 281.400, 322.308 287.857, 328.232 290.440 C 330.029 291.224, 342.525 293.968, 356 296.539 C 381.700 301.442, 397.314 305.656, 411.430 311.499 C 416.081 313.425, 421.067 315, 422.509 315 C 428.324 315, 430.952 311.004, 427.250 307.791 C 425.412 306.195, 406.116 297.402, 392.500 291.955 C 380.350 287.095, 356.664 279.238, 345.819 276.470 C 333.400 273.301, 329.619 273.290, 326.495 276.414"
              stroke="none"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
