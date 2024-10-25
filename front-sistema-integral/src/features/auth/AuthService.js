// AuthService.js
let handleAuthError = null;
let getToken = null;

export const setHandleAuthError = (fn) => {
  handleAuthError = fn;
};

export const getHandleAuthError = () => handleAuthError;

export const setGetToken = (fn) => {
  getToken = fn;
};

export const getTokenFunction = () => getToken;
