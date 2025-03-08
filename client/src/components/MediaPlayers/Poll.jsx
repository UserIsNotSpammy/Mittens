import React, { useEffect, useState, useContext, useRef } from 'react';

import { LoginContext } from '../contexts/LoginContext';
const Poll = ({ poll, id, postId = null, rooms = new Set() }) => {
  const { userData, domain, socket } = useContext(LoginContext);
  const [votes, setVotes] = useState({
    totalVotes: Object.keys(poll?.voters || {}).length,
    voters: poll?.voters || {},
    optionsData: [...(poll?.options || [])],
  });
  const joinedRooms = useRef(rooms);
  const socketRef = useRef(socket.current);
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);

  useEffect(() => {
    if (selectedPollOption) {
      vote();
    }
  }, [selectedPollOption]);

  useEffect(() => {
    if (!socketRef.current) return;

    if (poll) {
      // Prevent duplicate joins
      if (!joinedRooms.current.has(id)) {
        socketRef.current.emit('joinPostRoom', id);
        joinedRooms.current.add(id); // Add the room to the joinedRooms set
      }

      // Handle poll updates
      const handlePollUpdate = (data) => {
        if (data.id === id) {
          console.log(data);
          const totalVotes = Object.keys(data.voters).length;
          setVotes({ totalVotes: totalVotes, optionsData: data.options, voters: data.voters });
        }
      };

      socketRef.current.on('poll', handlePollUpdate);

      return () => {
        if (socketRef.current && postId === id) {
          socketRef.current.emit('leavePostRoom', id);
          joinedRooms.current.delete(id); // Remove the room from the joinedRooms set
          socketRef.current.off('poll', handlePollUpdate);
        }
      };
    }
  }, [id, socketRef, poll]);

  async function vote() {
    setIsLoadingPolls(true);
    const option = { ...selectedPollOption };
    const request = new Request(`/api/posts/${id}/poll/vote`, {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ option: option }),
    });

    const res = await fetch(request);
    const data = await res.text();

    setIsLoadingPolls(false);
  }
  return (
    <div className="polls-create-post-container">
      {poll.options.map((value, i) => (
        <label className="poll-option poll-option-posted" key={i} style={{ cursor: 'pointer', pointerEvents: isLoadingPolls ? 'none' : 'all', opacity: isLoadingPolls ? '0.5' : '1', border: votes.voters.hasOwnProperty('2') ? (votes.voters['2'] == i ? '1px solid rgba(119, 133, 145, 0.7)' : '1px solid rgba(225, 225, 225, 0.1)') : '1px solid rgba(225, 225, 225, 0.1)' }}>
          <div className="poll-option-header">
            <input
              checked={votes.voters.hasOwnProperty(userData.user_id) ? (votes.voters[userData.user_id] == i ? true : false) : false}
              type="radio"
              name={`poll-option-${id}`}
              onChange={() => {
                // if (selectedPollOption.index === i) {
                // }
                setSelectedPollOption({ value: value.option, index: i });
              }}
              style={{ display: 'none' }} // Hide original radio input
            />
            <span className="custom-radio-checkmark"></span> {/* Custom checkmark */}
            <h2>{value.option}</h2>
            <h3>{`${Math.floor((votes.optionsData[i].votes / votes.totalVotes) * 100) || 0}%`}</h3>
          </div>

          <div className="vote-precentage-container">
            <div className="vote-precentage" style={{ width: `${Math.floor((votes.optionsData[i].votes / votes.totalVotes) * 100) || 0}%` }}></div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default Poll;
