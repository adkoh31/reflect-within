import React from 'react';
import { LimelightNav } from './limelight-nav';

// Custom icons for our app
const HomeIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChatIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const JournalIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const InsightsIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LimelightNavDemo = () => {
  const navItems = [
    {
      id: 'home',
      icon: <HomeIcon />,
      label: 'Home',
      onClick: () => console.log('Home clicked!')
    },
    {
      id: 'chat',
      icon: <ChatIcon />,
      label: 'AI Chat',
      onClick: () => console.log('Chat clicked!')
    },
    {
      id: 'journal',
      icon: <JournalIcon />,
      label: 'Journal',
      onClick: () => console.log('Journal clicked!')
    },
    {
      id: 'insights',
      icon: <InsightsIcon />,
      label: 'Insights',
      onClick: () => console.log('Insights clicked!')
    },
    {
      id: 'profile',
      icon: <ProfileIcon />,
      label: 'Profile',
      onClick: () => console.log('Profile clicked!')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-slate-50 text-xl font-semibold mb-8 text-center">
          ReflectWithin Navigation
        </h2>
        <LimelightNav
          items={navItems}
          defaultActiveIndex={0}
          onTabChange={(index) => console.log('Tab changed to:', index)}
          className="w-full bg-slate-800/95 backdrop-blur-md border-slate-700/50 rounded-xl shadow-2xl"
          limelightClassName="bg-cyan-400 shadow-[0_50px_15px_rgba(34,211,238,0.3)]"
          iconContainerClassName="text-slate-300 hover:text-white transition-colors"
          iconClassName="text-slate-300"
        />
      </div>
    </div>
  );
};

export default LimelightNavDemo; 