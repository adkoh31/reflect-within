import { LimelightNav } from '../ui/limelight-nav.jsx';

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

const AdminIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BottomNav = ({ activeTab, onTabChange }) => {
  // Enhanced tab change with haptic feedback
  const handleTabChange = (tabId) => {
    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onTabChange(tabId);
  };

  const navItems = [
    {
      id: 'home',
      icon: <HomeIcon />,
      label: 'Home',
      onClick: () => {
        console.log('Home tab clicked!');
        handleTabChange('home');
      }
    },
    {
      id: 'chat',
      icon: <ChatIcon />,
      label: 'AI Chat',
      onClick: () => {
        console.log('Chat tab clicked!');
        handleTabChange('chat');
      }
    },
    {
      id: 'journal',
      icon: <JournalIcon />,
      label: 'Journal',
      onClick: () => {
        console.log('Journal tab clicked!');
        handleTabChange('journal');
      }
    },
    {
      id: 'insights',
      icon: <InsightsIcon />,
      label: 'Insights',
      onClick: () => {
        console.log('Insights tab clicked!');
        handleTabChange('insights');
      }
    },
    {
      id: 'profile',
      icon: <ProfileIcon />,
      label: 'Profile',
      onClick: () => {
        console.log('Profile tab clicked!');
        handleTabChange('profile');
      }
    }
  ];

  // Add admin tab only in development mode
  if (process.env.NODE_ENV === 'development') {
    navItems.push({
      id: 'admin',
      icon: <AdminIcon />,
      label: 'Admin',
      onClick: () => {
        console.log('Admin tab clicked!');
        handleTabChange('admin');
      }
    });
  }

  // Find the active index
  const activeIndex = navItems.findIndex(item => item.id === activeTab);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 safe-area-inset-bottom">
      <LimelightNav
        items={navItems}
        defaultActiveIndex={activeIndex >= 0 ? activeIndex : 0}
        onTabChange={(index) => {
          const tabId = navItems[index].id;
          handleTabChange(tabId);
        }}
        className="w-full bg-slate-800/95 backdrop-blur-md border-slate-700/50 rounded-xl shadow-2xl touch-manipulation"
        limelightClassName="bg-transparent shadow-none"
        iconContainerClassName="text-slate-300 hover:text-white transition-colors touch-manipulation"
        iconClassName="text-slate-300"
        style={{ 
          minHeight: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      />
    </div>
  );
};

export default BottomNav; 