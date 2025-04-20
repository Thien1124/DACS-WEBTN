import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorAlert = ({ message }) => {
  return (
    <Alert variant="danger">
      <Alert.Heading>Error</Alert.Heading>
      <p>{message}</p>
    </Alert>
  );
};

export default ErrorAlert;