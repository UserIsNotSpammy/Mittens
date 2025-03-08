import React, { useContext } from 'react';
import NavBar from '../components/containers/NavBar.jsx';
import Feed from '../components/FeedContent/Feed.jsx';
import UserProfileHeader from '../components/Profile/UserProfileHeader.jsx';
import PawPrints from '../components/Profile/PawPrints.jsx';
import GeneralInfo from '../components/Profile/GeneralInfo.jsx';
import MessageWindow from '../components/window/MessageWindow.jsx';
import { ProfileDataContext } from '../components/contexts/ProfileDataContext.jsx';
const Profile = () => {
  const { filter, errorsWindow, tag } = useContext(ProfileDataContext);

  return (
    <>
      {errorsWindow && <MessageWindow response={errorsWindow} />}
      <div className="profilePage">
        <NavBar page={'MyMewtopia'} />

        <div className="profile-page-content" key={tag}>
          <UserProfileHeader />
          <div className="hhh">
            <GeneralInfo />
            <Feed key={tag + filter}>
              <GeneralInfo />
              <PawPrints />
            </Feed>
            <PawPrints />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
