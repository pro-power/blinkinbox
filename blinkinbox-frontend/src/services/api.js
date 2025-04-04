import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const createEmail = async (username) => {
  try {
    const response = await api.post('/emails', { username });
    return response.data;
  } catch (error) {
    console.error('Error creating email:', error);
    throw error;
  }
};

export const getEmails = async (username) => {
  try {
    const response = await api.get(`/emails/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const getEmailDetails = async (username, emailId) => {
  try {
    const response = await api.get(`/emails/${username}/${emailId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching email details:', error);
    throw error;
  }
};

export const deleteEmail = async (username, emailId) => {
  try {
    const response = await api.delete(`/emails/${username}/${emailId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
};