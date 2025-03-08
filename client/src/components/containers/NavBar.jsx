import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoginContext } from '../contexts/LoginContext';
import Notifications from './Notifications';
import Notification from './Notification';
import UseOutsideClick from '../hooks/UseOutsideClick';
import SearchWindow from '../window/SearchWindow';
import Trending from './Trending';
import PeopleYouMayKnow from './PeopleYouMayKnow';
import LogoutWindow from '../window/LogoutWindow';
import SearchResults from './SearchResults';

const NavBar = ({ page }) => {
  const [notificationMenu, setNotificationMenu] = useState(false);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(JSON.parse(localStorage.getItem('isNotificationsMuted')) || false);
  const [searchWindow, setSearchWindow] = useState(false);
  const [trendingWindow, setTrendingWindow] = useState(false);
  const [peopleYouMayKnowWindow, setPeopleYouMayKnowWindow] = useState(false);
  const { userData, domain, socket, unReadNotificationsCount, setUnReadNotificationsCount } = useContext(LoginContext);
  const { tag } = useParams();

  const [popUpNotification, setPopUpNotification] = useState(null);
  const [isNavBarExpanded, setIsNavBarExpanded] = useState(false);
  const lastPopUps = useRef(new Set());
  useEffect(() => {
    const handleNotification = (data) => {
      if (notificationMenu) return;

      setPopUpNotification(data);
      setUnReadNotificationsCount((prev) => prev + 1);
    };

    if (socket.current) {
      socket.current.on('notification', handleNotification);
    }

    return () => {
      if (socket.current) {
        socket.current.off('notification', handleNotification);
      }
    };
  }, [notificationMenu, setUnReadNotificationsCount]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     lastPopUps.current.add(popUpNotification._id);
  //   }, 500);
  // }, [popUpNotification]);

  useEffect(() => {
    localStorage.setItem('isNotificationsMuted', JSON.stringify(isNotificationsMuted));
  }, [isNotificationsMuted]);

  const notificationsMenuRef = useRef();
  const notificationsBtnRef = useRef();
  UseOutsideClick(notificationsMenuRef, notificationsBtnRef, () => {
    setNotificationMenu(false);
  });

  UseOutsideClick(notificationsMenuRef, notificationsBtnRef, () => {
    setNotificationMenu(false);
  });
  const trendingMenuRef = useRef();
  const trendingbtnRef = useRef();
  UseOutsideClick(trendingMenuRef, trendingbtnRef, () => {
    setTrendingWindow(false);
  });

  const pymkMenuRef = useRef();
  const pymkBtnRef = useRef();

  UseOutsideClick(pymkMenuRef, pymkBtnRef, () => {
    setPeopleYouMayKnowWindow(false);
  });

  const [logoutMenu, setLogoutMenu] = useState(false);
  const [logoutWindow, setLogoutWindow] = useState(false);
  return (
    <>
      {logoutWindow && <LogoutWindow onClose={() => setLogoutWindow(false)} />}
      {/* <SearchWindow
        isVisible={searchWindow}
        onClose={() => {
          setSearchWindow;
        }}
      /> */}
      <nav className="navbar">
        <Link to={'/'} className="logo-nav-icon">
          <img src="/images/icons/logo.png" className="logo-img" />{' '}
        </Link>
        {/* <div
          type="text"
          className="searchBar"
          onClick={() => {
            setSearchWindow(true);
          }}>
          <span>@Explore</span>
        </div> */}
        <SearchResults />

        <div className="nav-links-container">
          <Link to={'/'} className={page === 'home' ? 'active-link' : ''}>
            <img src="/images/icons/homepage.png" className="nav-icon-button" />

            <span>Home</span>
          </Link>
          <Link to={`/Mewtopia/${userData.userTag}`} className={page === 'MyMewtopia' && tag == userData.userTag ? 'active-link' : ''} style={page === 'MyMewtopia' && tag == userData.userTag ? { width: '115px' } : {}}>
            <img src="/images/icons/apps.png" className="nav-icon-button" style={{ rotate: '45deg' }} />

            <span>Mewtopia</span>
          </Link>
          <Link to={'/chats'} className={page === 'Chats' ? 'active-link' : ''}>
            <img src="/images/icons/messages.png" className="nav-icon-button" />

            <span>Chats</span>
          </Link>
          <div className="nav-icon in-expanded-nav-icon trending-icon" ref={trendingbtnRef}>
            {trendingWindow && (
              <div className="hanged-trending-wrapper" ref={trendingMenuRef}>
                <Trending navBar={true} />
              </div>
            )}
            {/* <svg onClick={() => setTrendingWindow(!trendingWindow)} width={24} height={24} xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
              <path d="M8.625 0c.61 7.189-5.625 9.664-5.625 15.996 0 4.301 3.069 7.972 9 8.004 5.931.032 9-4.414 9-8.956 0-4.141-2.062-8.046-5.952-10.474.924 2.607-.306 4.988-1.501 5.808.07-3.337-1.125-8.289-4.922-10.378zm4.711 13c3.755 3.989 1.449 9-1.567 9-1.835 0-2.779-1.265-2.769-2.577.019-2.433 2.737-2.435 4.336-6.423z" />
            </svg> */}

            <svg className="svg-icon-button" onClick={() => setTrendingWindow(!trendingWindow)} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
              <path d="M12,24c-5.514,0-10-4.486-10-10h0c0-3.358,1.505-5.459,3.765-7.58l2.448-2.299-.792,3.263c-.275,1.136-.347,4.606,1.112,6.461,.611,.777,1.418,1.155,2.467,1.155,1.107,0,1.986-.884,2-2.013,.014-1.117-.458-2.042-.958-3.02-.512-1.002-1.042-2.037-1.042-3.295,0-2.711,1.412-5.168,1.472-5.271L13.3-.021l.881,1.391c.849,1.339,1.994,2.587,3.103,3.794,2.319,2.524,4.717,5.136,4.717,8.837,0,5.514-4.486,10-10,10Z" />
            </svg>
          </div>
          <div className="nav-icon in-expanded-nav-icon" ref={pymkBtnRef}>
            <svg
              className="svg-icon-button"
              onClick={() => {
                setPeopleYouMayKnowWindow((prev) => !prev);
              }}
              width={22}
              height={22}
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 512.047 512.047"
              xmlSpace="preserve">
              <g>
                <circle cx={192} cy="128.024" r={128} />
                <path d="M192,298.69C86.015,298.82,0.129,384.705,0,490.69c0,11.782,9.551,21.333,21.333,21.333h341.333   c11.782,0,21.333-9.551,21.333-21.333C383.871,384.705,297.985,298.82,192,298.69z" />
                <path d="M469.333,168.024c-24.717,1.231-43.79,22.211-42.667,46.933c1.123-24.722-17.949-45.702-42.667-46.933   c-24.717,1.231-43.79,22.211-42.667,46.933c0,36.907,48.128,80.149,72.107,99.392c7.731,6.19,18.722,6.19,26.453,0   c23.979-19.2,72.107-62.485,72.107-99.392C513.123,190.234,494.051,169.255,469.333,168.024z" />
              </g>
            </svg>
            <div className="hanged-pymk-wrapper" ref={pymkMenuRef}>
              {peopleYouMayKnowWindow && <PeopleYouMayKnow navBar={true} />}
            </div>
          </div>
          <div className="nav-icon notification" ref={notificationsBtnRef}>
            <img
              className="nav-icon-button"
              onClick={() => {
                setNotificationMenu((prev) => !prev);
              }}
              src="/images/icons/bell.png"
              alt=""
            />
            {/* 
          {!!unReadnotificationsCount && <span className="notifications-circle">{unReadnotificationsCount}</span>} */}

            <span className="notifications-circle" style={{ display: unReadNotificationsCount ? 'flex' : 'none' }}>
              {unReadNotificationsCount > 9 && <span style={{ fontSize: '0.45rem' }}>+</span>}
              {unReadNotificationsCount > 9 && '9'}
              {unReadNotificationsCount <= 9 && unReadNotificationsCount}
            </span>

            {notificationMenu && <Notifications menuRef={notificationsMenuRef} setunReadNotificationCount={setUnReadNotificationsCount} isNotificationsMuted={isNotificationsMuted} setIsNotificationsMuted={setIsNotificationsMuted} />}

            {popUpNotification && !isNotificationsMuted && !lastPopUps.current.has(popUpNotification._id) && (
              <div className="pop-up-notification" key={popUpNotification._id}>
                <Notification {...popUpNotification} />
              </div>
            )}
          </div>

          <div className="nav-icon expand-navbar-icon" onClick={() => setIsNavBarExpanded(true)}>
            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m11 16.745c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-9-5c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm4-5c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fillRule="nonzero" />
            </svg>
          </div>

          <div className="users">
            <figure className="users-pfp" style={{ backgroundImage: `url(${domain}/loadImage/pfp/${userData.userTag})` }}></figure>
            <h2>{userData.firstName}</h2>
            <figure className="expand-icon" onClick={() => setLogoutMenu((prev) => !prev)}></figure>

            <div className={logoutMenu ? 'log-out-menu visible-button' : 'log-out-menu'} style={{ transition: logoutMenu ? '0.35s' : '0.35s 0.2s' }}>
              <button
                className="log-out-container-btn"
                onClick={() => {
                  setLogoutWindow(true);
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" version="1.1">
                  <path
                    d="M 419.500 1.222 C 409.187 4.878, 403.153 16.427, 406.011 27.040 C 407.563 32.804, 414.916 40.336, 420.500 41.882 C 422.700 42.491, 430.110 42.991, 436.967 42.994 L 449.434 43 429.770 62.754 C 407.545 85.081, 405.706 87.850, 405.706 99 C 405.706 110.128, 411.440 119.554, 421.410 124.814 L 426.500 127.500 460 127.817 C 482.784 128.032, 494.719 127.773, 497.312 127.008 C 502.527 125.468, 508.538 119.778, 510.571 114.454 C 513.717 106.215, 510.915 95.325, 504.361 90.326 C 498.728 86.029, 494.499 85.091, 480.552 85.044 L 467.604 85 488.195 64.250 C 507.186 45.111, 508.910 43.078, 510.392 38.068 C 513.793 26.578, 511.483 17.422, 503.040 8.926 C 494.289 0.120, 493.558 -0.014, 455.072 0.079 C 434.813 0.128, 421.366 0.560, 419.500 1.222 M 202.951 34.314 C 196.915 36.006, 191.798 39.265, 188.604 43.453 C 187.168 45.335, 181.562 56.641, 176.147 68.577 L 166.300 90.280 158.358 92.572 C 149.015 95.270, 141.948 97.980, 134.730 101.634 C 122.006 108.076, 104.336 122.058, 96.500 131.884 L 92.500 136.900 63.928 136.950 C 30.247 137.009, 28.521 137.349, 20.341 145.528 C 12.777 153.092, 10.362 162.240, 13.327 172.093 C 14.096 174.645, 24.897 191.877, 38.971 213.001 C 84.100 280.737, 93.868 294.691, 101.881 302.871 C 126.417 327.917, 157.510 341, 192.500 341 C 219.052 341, 240.675 334.411, 263.088 319.490 C 281.773 307.051, 296.719 289.732, 307.055 268.540 C 315.355 251.525, 319.987 232.873, 319.996 216.429 C 320.003 204.360, 325.730 195.959, 336.059 192.864 C 346.769 189.655, 359.344 197.308, 361.755 208.500 C 363.881 218.374, 359.271 250.060, 353.033 268.438 C 351.365 273.353, 350 277.439, 350 277.516 C 350 277.594, 358.887 277.622, 369.750 277.579 L 389.500 277.500 394.272 280.305 C 406.891 287.723, 408.755 305.062, 397.929 314.329 C 392.220 319.216, 388.331 320, 369.810 320 C 350.864 320, 338.904 321.675, 325.500 326.205 C 283.488 340.403, 249.272 376.181, 237.834 417.874 C 235.402 426.737, 234.997 426.113, 248.502 434.287 C 267.493 445.780, 290.627 456.253, 315.411 464.578 L 328.500 468.974 311 468.972 C 236.511 468.961, 188.914 455.455, 151.074 423.594 C 136.769 411.549, 121.947 393.194, 112.382 375.681 C 109.733 370.830, 105.076 364.110, 102.033 360.747 C 82.204 338.836, 50.769 335.033, 25.935 351.543 C 8.647 363.036, -1.021 382.747, 0.260 403.887 C 1.224 419.795, 6.944 430.229, 25.384 449.720 C 55.720 481.785, 97.443 500.355, 155 507.413 C 184.476 511.028, 196.897 511.452, 274 511.476 C 344.366 511.498, 351.299 511.351, 360.460 509.642 C 388.978 504.324, 412.833 494.365, 436.226 478.013 C 448.184 469.655, 469.546 448.284, 478.222 436 C 490.490 418.629, 500.546 397.151, 505.951 376.774 C 529.757 287.019, 481.067 193.229, 393.728 160.601 C 372.264 152.583, 356.611 149.989, 324.547 149.137 L 300.595 148.500 276.047 111.857 C 262.546 91.703, 247.125 68.289, 241.778 59.825 C 236.430 51.361, 230.580 42.919, 228.778 41.063 C 222.584 34.689, 211.730 31.853, 202.951 34.314"
                    stroke="none"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="logout-btn">Logout</span>
              </button>
            </div>

            <div className={logoutMenu ? 'logout-white-bg  visible-button' : 'logout-white-bg'} style={{ transition: logoutMenu ? '0.35s 0.2s' : '0.35s' }}></div>
          </div>
        </div>
      </nav>
      <div className={isNavBarExpanded ? 'epandable-navbar-menu visible-menu' : 'epandable-navbar-menu'} style={{ transition: isNavBarExpanded ? '0.35s 0.2s' : '0.35s' }}>
        <button
          className="close-window-icon"
          onClick={() => {
            setIsNavBarExpanded(false);
          }}>
          <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
          </svg>
        </button>

        <div className="expandable-navbar-menu-content">
          {/* <div className="user-info-container">
            <div className="pfp-container">
              <img className="pfp" src="" alt="" />
            </div>
            <div>
              <h2>
                {userData.firstName} {userData.lastName}
              </h2>
              <h3>{userData.userTag}</h3>
            </div>
          </div> */}
          <div className="nav-links-container">
            <Link to={'/'} className={page === 'home' ? 'active-link' : ''}>
              <img src="/images/icons/homepage.png" className="nav-icon-button" />

              <span>Home</span>
            </Link>
            <Link to={`/Mewtopia/${userData.userTag}`} className={page === 'MyMewtopia' && tag == userData.userTag ? 'active-link' : ''} style={page === 'MyMewtopia' && tag == userData.userTag ? { width: '115px' } : {}}>
              <img src="/images/icons/apps.png" className="nav-icon-button" style={{ rotate: '45deg' }} />

              <span>Mewtopia</span>
            </Link>
            <Link to={'/chats'} className={page === 'Chats' ? 'active-link' : ''}>
              <img src="/images/icons/messages.png" className="nav-icon-button" />

              <span>Chats</span>
            </Link>

            <a
              onClick={() => {
                setLogoutWindow(true);
              }}>
              <svg className="nav-icon-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" version="1.1">
                <path
                  d="M 419.500 1.222 C 409.187 4.878, 403.153 16.427, 406.011 27.040 C 407.563 32.804, 414.916 40.336, 420.500 41.882 C 422.700 42.491, 430.110 42.991, 436.967 42.994 L 449.434 43 429.770 62.754 C 407.545 85.081, 405.706 87.850, 405.706 99 C 405.706 110.128, 411.440 119.554, 421.410 124.814 L 426.500 127.500 460 127.817 C 482.784 128.032, 494.719 127.773, 497.312 127.008 C 502.527 125.468, 508.538 119.778, 510.571 114.454 C 513.717 106.215, 510.915 95.325, 504.361 90.326 C 498.728 86.029, 494.499 85.091, 480.552 85.044 L 467.604 85 488.195 64.250 C 507.186 45.111, 508.910 43.078, 510.392 38.068 C 513.793 26.578, 511.483 17.422, 503.040 8.926 C 494.289 0.120, 493.558 -0.014, 455.072 0.079 C 434.813 0.128, 421.366 0.560, 419.500 1.222 M 202.951 34.314 C 196.915 36.006, 191.798 39.265, 188.604 43.453 C 187.168 45.335, 181.562 56.641, 176.147 68.577 L 166.300 90.280 158.358 92.572 C 149.015 95.270, 141.948 97.980, 134.730 101.634 C 122.006 108.076, 104.336 122.058, 96.500 131.884 L 92.500 136.900 63.928 136.950 C 30.247 137.009, 28.521 137.349, 20.341 145.528 C 12.777 153.092, 10.362 162.240, 13.327 172.093 C 14.096 174.645, 24.897 191.877, 38.971 213.001 C 84.100 280.737, 93.868 294.691, 101.881 302.871 C 126.417 327.917, 157.510 341, 192.500 341 C 219.052 341, 240.675 334.411, 263.088 319.490 C 281.773 307.051, 296.719 289.732, 307.055 268.540 C 315.355 251.525, 319.987 232.873, 319.996 216.429 C 320.003 204.360, 325.730 195.959, 336.059 192.864 C 346.769 189.655, 359.344 197.308, 361.755 208.500 C 363.881 218.374, 359.271 250.060, 353.033 268.438 C 351.365 273.353, 350 277.439, 350 277.516 C 350 277.594, 358.887 277.622, 369.750 277.579 L 389.500 277.500 394.272 280.305 C 406.891 287.723, 408.755 305.062, 397.929 314.329 C 392.220 319.216, 388.331 320, 369.810 320 C 350.864 320, 338.904 321.675, 325.500 326.205 C 283.488 340.403, 249.272 376.181, 237.834 417.874 C 235.402 426.737, 234.997 426.113, 248.502 434.287 C 267.493 445.780, 290.627 456.253, 315.411 464.578 L 328.500 468.974 311 468.972 C 236.511 468.961, 188.914 455.455, 151.074 423.594 C 136.769 411.549, 121.947 393.194, 112.382 375.681 C 109.733 370.830, 105.076 364.110, 102.033 360.747 C 82.204 338.836, 50.769 335.033, 25.935 351.543 C 8.647 363.036, -1.021 382.747, 0.260 403.887 C 1.224 419.795, 6.944 430.229, 25.384 449.720 C 55.720 481.785, 97.443 500.355, 155 507.413 C 184.476 511.028, 196.897 511.452, 274 511.476 C 344.366 511.498, 351.299 511.351, 360.460 509.642 C 388.978 504.324, 412.833 494.365, 436.226 478.013 C 448.184 469.655, 469.546 448.284, 478.222 436 C 490.490 418.629, 500.546 397.151, 505.951 376.774 C 529.757 287.019, 481.067 193.229, 393.728 160.601 C 372.264 152.583, 356.611 149.989, 324.547 149.137 L 300.595 148.500 276.047 111.857 C 262.546 91.703, 247.125 68.289, 241.778 59.825 C 236.430 51.361, 230.580 42.919, 228.778 41.063 C 222.584 34.689, 211.730 31.853, 202.951 34.314"
                  stroke="none"
                  fillRule="evenodd"
                />
              </svg>
              <span className="logout-btn">Logout</span>
            </a>
          </div>
        </div>
      </div>

      <div className={isNavBarExpanded ? 'epandable-navbar-menu-white-bg visible-menu' : 'epandable-navbar-menu-white-bg'} style={{ transition: isNavBarExpanded ? '0.35s' : '0.35s 0.2s' }}></div>
    </>
  );
};

export default NavBar;
