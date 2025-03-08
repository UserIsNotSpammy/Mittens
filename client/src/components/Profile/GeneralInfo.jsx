import React from 'react';
import { formatDate } from '../../utils/helperFunctions';
import Slider from '../MediaPlayers/Slider';
import Image from '../MediaPlayers/Image';
import { useContext } from 'react';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
const GeneralInfo = () => {
  const { isFetching, fetchedUserData } = useContext(ProfileDataContext);
  const searchedUser = fetchedUserData;
  return (
    <div className="side-block side-profile-containers">
      <div className="friends-container">
        <div className="friends-container-header">
          <div className="friends-counter">
            <h1 style={{ fontSize: '17px', color: 'white' }}>
              <span style={{ color: 'var(--text-color-glowing)' }}>Meow</span>Ments
            </h1>
            {!isFetching && <h3 style={{ fontSize: '12px' }}>{searchedUser.meowments.length} MeowMents</h3>}
            {isFetching && <div className="skeleton-line"></div>}
          </div>

          <div className="cat-toy-img" style={{ backgroundImage: 'url(/images/cat-toy.png)' }}></div>
        </div>
        <div className="friends-cards-wrapper">
          {!isFetching && searchedUser.meowments?.length === 1 && <Image src={`/LoadMeowment/${searchedUser.userTag}/${searchedUser.meowments[0].fileName}`} key={searchedUser.meowments[0]?.fileName} />}
          {!isFetching && searchedUser.meowments?.length === 0 && <Image src={`/LoadMeowment/${searchedUser.userTag}/default`} />}
          {isFetching && <div className="skeleton-picture" style={{ height: '230px' }}></div>}
          {!isFetching && searchedUser.meowments.length > 0 && searchedUser.meowments.length != 1 && <Slider blobs={searchedUser.meowments} endPoint={`LoadMeowment/${searchedUser.userTag}`} loop={true} key={searchedUser.meowments[0]?.fileName + searchedUser.meowments[1]?.fileName + searchedUser.meowments.length} />}
        </div>
      </div>
      <div className="general-info-section">
        <h1 style={{ fontSize: '17px', color: 'white' }}>General info</h1>

        <div className="general-info-wrapper">
          {!isFetching && (
            <>
              <div className="general-info-block">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="m13.97,2.971c-.126-.849-.625-1.563-1.369-1.961C9.252-.782,5.196-.181,2.508,2.508-.18,5.196-.782,9.252,1.009,12.601c.398.744,1.113,1.243,1.962,1.369.136.021.272.03.408.03.736,0,1.453-.291,1.978-.815l7.827-7.828c.622-.621.915-1.513.786-2.386Zm-2.2.972l-7.827,7.828c-.175.176-.428.261-.678.221-.127-.019-.36-.087-.492-.334-1.352-2.526-.878-5.707,1.149-7.735,1.255-1.255,2.951-1.914,4.661-1.914,1.053,0,2.111.25,3.075.766.246.132.314.364.333.491.037.249-.046.502-.222.678Zm-7.77,15.558c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm20-5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm-10-2c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm10,10c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5ZM19,3.5c0-.828.672-1.5,1.5-1.5s1.5.672,1.5,1.5-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5Zm4.683,4.732c-1.309,1.223-2.521,1.768-3.933,1.768-2.069,0-3.214-1.086-3.829-1.67l-.104-.098c-.403-.377-.424-1.01-.047-1.413.378-.404,1.011-.425,1.414-.048l.114.107c.526.5,1.181,1.121,2.453,1.121.619,0,1.408-.146,2.567-1.229.404-.378,1.036-.356,1.414.048.377.403.355,1.036-.048,1.413Zm-12.685,10.992c.04,1.583-.623,3.252-1.772,4.464-.197.207-.461.312-.726.312-.247,0-.495-.091-.688-.274-.4-.38-.417-1.014-.037-1.414.782-.823,1.25-1.987,1.225-3.036-.039-1.538-.413-2.2-.775-2.645-.349-.429-.284-1.059.145-1.406.429-.35,1.058-.283,1.407.145.804.988,1.181,2.178,1.222,3.855Zm8.002.756c0,1.396-.383,2.548-1.205,3.626-.197.258-.495.394-.796.394-.211,0-.424-.066-.605-.205-.439-.335-.523-.962-.189-1.401.558-.731.795-1.453.795-2.413,0-1.465-.738-2.24-.77-2.272-.381-.392-.383-1.022.003-1.409.387-.388,1.006-.396,1.399-.017.14.136,1.368,1.394,1.368,3.698Z" />
                </svg>

                <h3>
                  Birth date <span>{formatDate(searchedUser.generalInfo.dateOfBirth)}</span>
                </h3>
              </div>
              <div className="general-info-block">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="M14.5,13A1.5,1.5,0,1,1,16,11.5,1.5,1.5,0,0,1,14.5,13Zm7.351-4.726A9.975,9.975,0,0,0,12,0C5.1,0,3.124,4.674,1.819,7.767A6.372,6.372,0,0,1,.5,10.136a1,1,0,0,0,.379,1.856,15.806,15.806,0,0,0,7.257-1.1,1.5,1.5,0,1,0,1.724-.84,15.09,15.09,0,0,0,4.956-4.467,1,1,0,1,0-1.626-1.162A13.357,13.357,0,0,1,3,10.027c.227-.453.438-.956.662-1.483C4.892,5.628,6.423,2,12,2a7.978,7.978,0,0,1,7.954,7.15,1,1,0,0,0,.816.878A1.5,1.5,0,0,1,20.5,13a1.606,1.606,0,0,1-.252-.027.994.994,0,0,0-1.117.651C18.215,16.221,15.132,19,12,19h0c-2.9,0-5.6-2.283-6.766-4.539a1,1,0,1,0-1.776.92A11.264,11.264,0,0,0,8,19.953V23a1,1,0,0,0,2,0V20.738a7.708,7.708,0,0,0,4,0V23a1,1,0,0,0,2,0V19.954a11.037,11.037,0,0,0,4.732-4.962,3.5,3.5,0,0,0,1.119-6.718Z" />
                </svg>
                <h3>
                  Gender <span>{searchedUser.generalInfo.gender}</span>
                </h3>
              </div>
              <div className="general-info-block">
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24">
                  <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0ZM22,12a9.938,9.938,0,0,1-1.662,5.508l-1.192-1.193A.5.5,0,0,1,19,15.962V15a3,3,0,0,0-3-3H13a1,1,0,0,1-1-1v-.5a.5.5,0,0,1,.5-.5A2.5,2.5,0,0,0,15,7.5v-1a.5.5,0,0,1,.5-.5h1.379a2.516,2.516,0,0,0,1.767-.732l.377-.377A9.969,9.969,0,0,1,22,12Zm-19.951.963,3.158,3.158A2.978,2.978,0,0,0,7.329,17H10a1,1,0,0,1,1,1v3.949A10.016,10.016,0,0,1,2.049,12.963ZM13,21.949V18a3,3,0,0,0-3-3H7.329a1,1,0,0,1-.708-.293L2.163,10.249A9.978,9.978,0,0,1,17.456,3.63l-.224.224A.507.507,0,0,1,16.879,4H15.5A2.5,2.5,0,0,0,13,6.5v1a.5.5,0,0,1-.5.5A2.5,2.5,0,0,0,10,10.5V11a3,3,0,0,0,3,3h3a1,1,0,0,1,1,1v.962a2.516,2.516,0,0,0,.732,1.767l1.337,1.337A9.971,9.971,0,0,1,13,21.949Z" />
                </svg>

                <h3>
                  Lives In <span>{searchedUser.generalInfo.livesIn}</span>
                </h3>
              </div>
              <div className="general-info-block">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="M12,0a12,12,0,1,0,7.092,21.681l-1.184-1.612A10,10,0,1,1,22,12v2a2,2,0,0,1-4,0V12a6.021,6.021,0,1,0-1.48,3.933A3.986,3.986,0,0,0,24,14V12A12.013,12.013,0,0,0,12,0Zm0,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" />
                </svg>

                <h3>
                  Email address <span>{searchedUser.generalInfo.email}</span>
                </h3>
              </div>
              <div className="general-info-block">
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                  <path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12Zm0-22C6.486,2,2,6.486,2,12s4.486,10,10,10,10-4.486,10-10S17.514,2,12,2ZM6,15.827l1.378,1.378c.539,.54,1.249,.795,1.957,.795,3.634,0,8.666-4.752,8.666-8.666,0-.708-.256-1.418-.795-1.957l-1.378-1.378-2.712,2.712,1.775,1.775c-.882,2.195-2.376,3.629-4.403,4.403l-1.775-1.775-2.712,2.712Z" />
                </svg>

                <h3>
                  Phone number <span>{searchedUser.generalInfo.phoneNumber}</span>
                </h3>
              </div>
            </>
          )}

          {isFetching && (
            <>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
              <div className="skeleton-line" style={{ height: '15px' }}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo;
