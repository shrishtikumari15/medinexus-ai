import React, { useEffect, useId, useState } from 'react';
import { getHospitalSuggestions } from '../services/hospitalApi';

export default function HospitalSearchInput({ type, value, onChange, placeholder, className }) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const query = value.trim();
    let active = true;
    setSuggestions([]);

    if (query.length < 2) return () => { active = false; };

    const timer = setTimeout(() => {
      getHospitalSuggestions(type, query)
        .then((items) => { if (active) setSuggestions(items); })
        .catch(() => { if (active) setSuggestions([]); });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [type, value]);

  return (
    <>
      <input
        list={listId}
        autoComplete="off"
        aria-label={placeholder}
        placeholder={placeholder}
        className={className}
        value={value}
        onChange={onChange}
      />
      <datalist id={listId}>
        {suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
      </datalist>
    </>
  );
}