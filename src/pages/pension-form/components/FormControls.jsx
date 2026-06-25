import React from 'react';

function RadioOption({
  id,
  name,
  value,
  checked,
  onChange,
  label,
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'block',
        marginTop: '0.5rem',
        cursor: 'pointer',
      }}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.value)}
        style={{ marginRight: '0.5rem' }}
      />
      {label}
    </label>
  );
}

function InputWithLabel({
  id,
  label,
  value,
  onChange,
  placeholder,
  width = '160px',
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>

      <br />

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          width,
        }}
      />
    </div>
  );
}

export {
  RadioOption,
  InputWithLabel,
};
