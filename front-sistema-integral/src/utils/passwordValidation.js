// src/utils/passwordValidation.js

export const passwordConditions = [
  {
    key: 'length',
    label: 'Al menos 8 caracteres',
    test: (pw) => pw.length >= 8,
  },
  {
    key: 'uppercase',
    label: 'Una mayúscula',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    key: 'lowercase',
    label: 'Una minúscula',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    key: 'number',
    label: 'Un número',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    key: 'symbol',
    label: 'Un símbolo',
    test: (pw) => /[!@#$%^&*()_\-+=.,:;{}[\]<>/?~]/.test(pw),
  },
];

export function getPasswordFails(password) {
  return passwordConditions.filter(cond => !cond.test(password));
}

export function isPasswordValid(password) {
  return getPasswordFails(password).length === 0;
}
