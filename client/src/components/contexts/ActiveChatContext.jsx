import React, { createContext, useState, useEffect } from 'react';

const ActiveChatContext = createContext();
const ActiveChatContextProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatLinks, setChatLinks] = useState([]);
  const [slideChat, setSlideChat] = useState(false);
  const [filter, setFilter] = useState('');
  useEffect(() => {}, []);

  return <ActiveChatContext.Provider value={{ activeChat, setActiveChat, chatLinks, setChatLinks, slideChat, setSlideChat, filter, setFilter }}>{children}</ActiveChatContext.Provider>;
};

export { ActiveChatContext, ActiveChatContextProvider };
