import React from 'react';
import { useApp } from '../../store/AppContext';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast-global ${toast.show ? 'show' : ''}`}>
      {toast.msg}
    </div>
  );
}
