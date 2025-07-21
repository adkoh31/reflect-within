import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export const useSlowNetworkFeedback = (threshold = 2000) => {
  const [isSlow, setIsSlow] = useState(false);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  const startOperation = () => {
    startTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      setIsSlow(true);
      toast.info('This operation is taking longer than usual. Please be patient.', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, threshold);
  };

  const endOperation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsSlow(false);
    startTimeRef.current = null;
  };

  const getOperationDuration = () => {
    if (!startTimeRef.current) return 0;
    return Date.now() - startTimeRef.current;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSlow,
    startOperation,
    endOperation,
    getOperationDuration
  };
}; 