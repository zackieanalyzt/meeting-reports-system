import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RestrictedFeature = ({ roles, children, fallback = null }) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return fallback;
  }

  return children;
};

export default RestrictedFeature;
