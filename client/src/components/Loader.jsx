const Loader = ({ status, stroke }) => {
  return (
    <div className="my-post-image-loading" style={{ display: status ? 'flex' : 'none' }}>
      <svg width="130" height="130" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" className="background-circle"></circle>
        <circle cx="60" cy="60" r="54" className="loading-circle" strokeLinecap="butt" style={status ? { strokeDashoffset: stroke } : { strokeDashoffset: 0 }}></circle>
      </svg>
    </div>
  );
};

export default Loader;
