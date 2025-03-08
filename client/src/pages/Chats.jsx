import React, { useState, useContext } from 'react';
import NavBar from '../components/containers/NavBar';
import Bg from '../components/Auth/Bg';
import SidePanel from '../components/Chat/SidePanel';
import Chat from '../components/Chat/Chat';
import { ActiveChatContext } from '../components/contexts/ActiveChatContext';
const Chats = () => {
  const { activeChat } = useContext(ActiveChatContext);
  return (
    <div className="dark chats-page" style={{ backgroundColor: 'transparent' }}>
      {/* <Bg /> */}
      <NavBar page="Chats" />
      <div className="chats-outer-wrapper">
        <SidePanel />
        <Chat key={activeChat?.userTag} />
      </div>
    </div>
  );
};

export default Chats;
