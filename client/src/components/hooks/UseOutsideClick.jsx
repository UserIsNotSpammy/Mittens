import { useEffect } from 'react';

function useOutsideClick(menuRef, buttonRef, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef?.current) {
        if (menuRef.current && buttonRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
          callback();
        }
      } else {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          callback();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, buttonRef, callback]);
}

export default useOutsideClick;
