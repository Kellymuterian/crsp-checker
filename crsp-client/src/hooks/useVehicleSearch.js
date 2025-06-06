import { useState, useEffect } from 'react';
import { fetchVehicles } from '../services/vehicleApi';

export function useVehicleSearch(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const [make = '', model = ''] = query.toLowerCase().split(' ');

      // Call fetchVehicles with only make if model is empty
      if (model) {
        fetchVehicles(make, model)
          .then(data => {
            setSuggestions(data);
            setError('');
          })
          .catch(() => {
            setError('Failed to fetch suggestions. Please try again later.');
            setSuggestions([]);
          });
      } else {
        fetchVehicles(make)
          .then(data => {
            setSuggestions(data);
            setError('');
          })
          .catch(() => {
            setError('Failed to fetch suggestions. Please try again later.');
            setSuggestions([]);
          });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return { suggestions, error };
}
