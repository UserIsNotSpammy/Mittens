function timeDifference(pastTime) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(pastTime)) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatNumber(number) {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + 'b';
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + 'm';
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + 'k';
  } else {
    return number.toString();
  }
}
function stopRefetching(ref) {
  if (ref.current) {
    clearInterval(ref.current);
    ref.current = null;
  }
}

const throwError = (message, status, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  throw error;
};
function refetch(ref, cb) {
  if (!ref.current) {
    ref.current = setInterval(cb, 4000);
  }
}
async function handleRequest(req, ref, setIsLoading, cb, onError) {
  setIsLoading(true);
  try {
    let res;
    try {
      const clonedReq = req.clone();
      res = await fetch(clonedReq);
    } catch (err) {
      throwError('INTERNET_ERROR', 503);
    }
    stopRefetching(ref);
    if (!res.ok) {
      if (res.status == 404) throwError('NOT_FOUND', 404);
      const err = await res.json();
      throwError(err?.message, res.status, err?.details);
    }
    const data = await res.json();
    if (cb != null) cb(data);
    setIsLoading(false);
  } catch (error) {
    if (error.status == 503) {
      stopRefetching(ref); // Ensure no duplicate intervals
      refetch(ref, () => handleRequest(req, ref, setIsLoading, cb, onError));
    } else {
      setIsLoading(false);
      stopRefetching(ref);
      if (onError != null) onError({ status: error.status, message: error.message, details: error.details });
      // setErrorsWindow({ status: err.status, message: err.message })
    }
  }
}
export { throwError, timeDifference, formatDate, stopRefetching, refetch, formatNumber, handleRequest };
