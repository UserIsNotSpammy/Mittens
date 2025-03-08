import React, { useState } from 'react';

// const ShowMoreText = ({ text }) => {
//   const [showMore, setShowMore] = useState(false);
//   const [isOverflowing, setIsOverflowing] = useState(false);
//   const textRef = useRef(null);

//   useEffect(() => {
//     if (textRef.current) {
//       setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
//     }
//   }, [text]);

//   const handleToggle = () => setShowMore(!showMore);

//   const parseTextWithLinks = (text) => {
//     const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
//     const parts = text.split(linkRegex);
//     return parts.map((part, index) =>
//       linkRegex.test(part) ? (
//         <a className="text-links" key={index} href={part.startsWith('http') ? part : `https://${part}`} target="_blank" rel="noopener noreferrer">
//           {part}
//         </a>
//       ) : (
//         part
//       )
//     );
//   };

//   if (!text) return null;

//   return (
//     <div>
//       <p
//         ref={textRef}
//         className="post-caption"
//         style={{
//           maxHeight: showMore ? 'none' : '4.42em',
//           overflow: 'hidden',
//           lineHeight: '1.45em',
//         }}>
//         {text.split('\n').map((line, index) => (
//           <span key={index}>
//             {parseTextWithLinks(line)}
//             <br />
//           </span>
//         ))}
//       </p>
//       {isOverflowing && (
//         <button style={{ marginLeft: 'auto' }} className="glowing-link show-more-btn" onClick={handleToggle}>
//           {showMore ? 'Show Less' : 'Show More'}
//         </button>
//       )}
//     </div>
//   );
// };

// export default ShowMoreText;

const ShowMoreText = ({ text, charLimit = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const shouldTruncate = text.length > charLimit;
  const displayedText = isExpanded || !shouldTruncate ? text : text.slice(0, charLimit) + '...';

  return (
    <p className="post-caption">
      <span>
        {displayedText.split('\n').map((line, index, array) => (
          <span key={index}>
            {line.split(urlRegex).map((part, i) =>
              urlRegex.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-links">
                  {part}
                </a>
              ) : (
                part
              )
            )}
            {index !== array.length - 1 && <br />}
          </span>
        ))}
      </span>
      {shouldTruncate && (
        <button className="glowing-link show-more-btn" onClick={() => setIsExpanded(!isExpanded)} style={{ display: 'inline' }}>
          {isExpanded ? 'See less' : 'See more'}
        </button>
      )}
    </p>
  );
};

export default ShowMoreText;
