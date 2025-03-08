import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { LoginContext } from '../contexts/LoginContext';
import Slider from '../MediaPlayers/Slider';
import VideoPlayer from '../MediaPlayers/VideoPlayer';
import { timeDifference } from '../../utils/helperFunctions';
import Image from '../MediaPlayers/Image';

const Message = React.memo(({ sender, recipient, messageBody, createdAt, _id, isSeen }) => {
  const [isPfpImageLoading, setIsPfpImageLoading] = useState(true);

  const parseTextWithLinks = (text) => {
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(linkRegex);
    return parts.map((part, index) =>
      linkRegex.test(part) ? (
        <a className="text-links" key={index} href={part.startsWith('http') ? part : `https://${part}`} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      ) : (
        part
      )
    );
  };
  const { userData, domain } = useContext(LoginContext);

  return (
    <div className={sender.userTag === userData.userTag ? 'chat-message sent-msg' : 'chat-message'}>
      <div className="pfp-container">
        <img
          src={`${domain}/loadImage/pfp/${sender.userTag}`}
          className="pfp"
          alt=""
          style={{ display: isPfpImageLoading ? 'none' : 'block' }}
          onLoad={() => {
            setIsPfpImageLoading(false);
          }}
        />
        {isPfpImageLoading && <div className="skeleton-picture" style={{ width: '100%', height: '100%', borderRadius: '50%', opacity: '1' }}></div>}
      </div>
      <div className="message-body" style={messageBody.image || messageBody.video ? { minWidth: '50%' } : {}}>
        {messageBody.text && (
          <p
            className="message-text"
            style={
              {
                // maxHeight: 'none',
                // overflow: 'hidden',
                // lineHeight: '1.45em',
              }
            }>
            {messageBody.text.split('\n').map((line, index) => (
              <span key={index}>
                {parseTextWithLinks(line)}
                <br />
              </span>
            ))}
          </p>
        )}
        {messageBody.image && messageBody.image.length > 1 && <Slider blobs={messageBody.image} endPoint={`loadImage/chat`} />}
        {messageBody.image && messageBody.image.length === 1 && <Image src={`/loadImage/chat/${messageBody.image[0]?.fileName}`} img={messageBody.image[0]} />}
        {messageBody.video && <VideoPlayer src={`${domain}/loadVideo/chat/${messageBody.video?.fileName}`} />}
        <div className="msg-date-container">
          <span className="msg-date"> {timeDifference(createdAt)}</span>
          {isSeen && sender.userTag === userData.userTag && (
            <span className="isSeenMark" title="Seen">
              <svg version={1.0} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                  <path
                    d="M1090 3935 c-67 -21 -122 -73 -156 -147 -25 -57 -28 -73 -27 -163 1
-117 27 -207 87 -298 123 -185 328 -226 462 -92 66 66 88 128 87 245 -2 138
-59 278 -151 373 -77 79 -204 114 -302 82z"
                  />
                  <path
                    d="M2005 3881 c-177 -46 -292 -268 -255 -494 32 -198 135 -311 285 -310
155 1 269 114 310 310 18 85 18 140 1 224 -25 117 -86 207 -168 250 -42 21
-129 32 -173 20z"
                  />
                  <path
                    d="M3823 3235 c-208 -104 -315 -436 -202 -633 70 -124 223 -166 356 -99
64 33 142 117 181 197 33 68 62 178 62 242 0 52 -19 136 -41 179 -24 48 -102
116 -148 129 -67 18 -152 12 -208 -15z"
                  />
                  <path
                    d="M502 3232 c-154 -55 -215 -192 -162 -365 40 -128 136 -239 259 -300
59 -29 74 -32 156 -32 101 0 159 21 216 77 54 54 64 84 64 189 0 90 -2 99 -39
173 -103 208 -318 321 -494 258z"
                  />
                  <path
                    d="M2939 3172 c-209 -109 -239 -508 -52 -695 144 -145 359 -100 447 93
86 188 34 467 -107 574 -82 63 -200 74 -288 28z"
                  />
                  <path
                    d="M1462 2914 c-91 -47 -217 -264 -272 -471 -27 -100 -37 -262 -20 -332
40 -166 210 -280 373 -251 104 19 173 65 233 154 l34 51 112 0 c104 0 117 2
165 27 68 36 120 90 152 158 21 45 26 69 26 135 0 68 -5 89 -29 139 -65 132
-292 297 -516 376 -87 30 -212 37 -258 14z"
                  />
                  <path
                    d="M4431 2555 c-143 -40 -283 -176 -336 -325 -9 -25 -16 -76 -16 -114 0
-150 101 -259 254 -273 225 -20 479 234 465 464 -5 79 -26 129 -77 178 -75 74
-183 100 -290 70z"
                  />
                  <path
                    d="M3450 2230 c-155 -41 -376 -167 -474 -270 -157 -164 -164 -366 -17
-503 66 -62 133 -82 256 -74 l90 5 35 -55 c67 -106 159 -157 285 -158 93 0
164 27 233 90 115 104 134 304 52 559 -57 178 -172 366 -245 400 -56 27 -130
29 -215 6z"
                  />
                </g>
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Message;
