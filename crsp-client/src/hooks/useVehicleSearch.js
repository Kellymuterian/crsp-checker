import { useState, useEffect, useRef } from 'react';
import { fetchVehicles } from '../services/vehicleApi';

export function useVehicleSearch(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Clear previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setError('');
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        
        const [make = '', ...modelParts] = query.trim().toLowerCase().split(' ');
        const model = modelParts.join(' ');

        const data = await fetchVehicles(make, model, {
          signal: abortControllerRef.current.signal
        });
        
        setSuggestions(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to fetch suggestions. Please try again later.');
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return { suggestions, error, isLoading };
}