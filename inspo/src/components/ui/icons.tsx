import type React from "react";

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>Google</title>
    <path
      d="M44.5 20H24v8.5h11.9C34.8 32.9 30 36 24 36c-7 0-12.8-5.8-12.8-13S17 10 24 10c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C36 4.3 30.4 2 24 2 12 2 2 12 2 24s10 22 22 22c11 0 20-8 21.5-19H44.5z"
      fill="#FFC107"
    />
    <path
      d="M6.3 14.7l7.1 5.2C15.3 16 19.3 13 24 13c3.4 0 6.4 1.3 8.7 3.4l6.1-6.1C36 4.3 30.4 2 24 2 16.2 2 9.2 6.9 6.3 14.7z"
      fill="#FF3D00"
    />
    <path
      d="M24 46c6.4 0 12-2.3 16.7-6.2l-8-6.6C29.9 35.9 27 36.9 24 36.9c-6 0-10.6-3.1-13-7.7l-8.1 6.3C6 40.9 14 46 24 46z"
      fill="#4CAF50"
    />
    <path
      d="M44.5 20H24v8.5h11.9C35 32 30 36 24 36c-6 0-11-3.1-13.3-7.3l-7.1 5.2C8 39.6 15.5 46 24 46c11 0 20-8 21.5-19H44.5z"
      fill="#1976D2"
    />
  </svg>
);

export const MicrosoftIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>Microsoft</title>
    <rect x="1" y="1" width="10" height="10" fill="#F05022" />
    <rect x="13" y="1" width="10" height="10" fill="#7CB342" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
    <rect x="13" y="13" width="10" height="10" fill="#FFD400" />
  </svg>
);

export const OutlookIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <title>Outlook</title>
    <path
      d="M4 4h9a3 3 0 0 1 3 3v1h4v9a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
      fill="#0078D4"
    />
    <path d="M7 9h10v6H7z" fill="#fff" opacity="0.9" />
  </svg>
);
