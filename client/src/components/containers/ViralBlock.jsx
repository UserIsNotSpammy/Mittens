import React from 'react';
import { formatDate } from '../../utils/helperFunctions';
import { Link } from 'react-router-dom';

const ViraBlock = ({ postedBy, postText, post_id, createdAt }) => {
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <Link className="viral-block" to={`/posts/${post_id}`}>
      <h3>
        #{' '}
        <span>
          {postedBy.firstName} {postedBy.lastName}'s
        </span>{' '}
        post on {formatDate(createdAt)}
        <small>
          {' '}
          {postText ? ' | ' : ' '}
          {truncateText(postText || '', 35)}
        </small>
      </h3>

      <div className="hr" style={{ width: '150px', margin: '5px 0px' }}></div>
    </Link>
  );
};

export default ViraBlock;
