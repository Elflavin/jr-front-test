import { useState } from 'react';
import type { StatusEntry } from '../types/status';

export default function useStatusHistory() {
  const [history, setHistory] = useState<StatusEntry[]>([]);

  function addStatus(status: StatusEntry) {
  setHistory(prev => [...prev, status].slice(-10)); // Maintain the last 10 status codes
}

  return {
    history,
    addStatus,
  };
}