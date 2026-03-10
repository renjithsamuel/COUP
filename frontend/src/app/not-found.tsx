'use client';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0C1222',
        color: '#E0E7FF',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>404</h1>
      <p style={{ fontSize: '1.125rem' }}>Page not found</p>
      <a
        href="/"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#4F46E5',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
        }}
      >
        Return home
      </a>
    </div>
  );
}
