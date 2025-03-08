import React, { useContext } from 'react';
import NavBar from '../components/containers/NavBar';
import MyProfile from '../components/Profile/MyProfile';
import PeopleYouMayKnow from '../components/containers/PeopleYouMayKnow';
import Feed from '../components/FeedContent/Feed';
import Trending from '../components/containers/Trending';
import { LoginContext } from '../components/contexts/LoginContext';
import Bg from '../components/Auth/Bg';
const HomePage = () => {
  const { userData } = useContext(LoginContext);
  return (
    <div className="dark home-page-container">
      <NavBar page={'home'} />
      <div className="home-page-content">
        <div className="left-feed-container">
          <MyProfile />
          <PeopleYouMayKnow />
        </div>
        <Feed />

        <Trending />
      </div>
    </div>
  );
};

export default HomePage;
