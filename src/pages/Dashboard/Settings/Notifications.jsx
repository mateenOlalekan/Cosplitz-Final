import { useState } from 'react';

const NOTIFICATIONS = [
  { id: 'all', label: 'Turn off all notifications', defaultChecked: false },
  { id: 'comments', label: 'Turn off all comments', defaultChecked: true },
  { id: 'posts', label: 'Turn off all posts', defaultChecked: true },
  { id: 'news', label: 'News and updates', defaultChecked: false },
  { id: 'reminders', label: 'Reminders', defaultChecked: false },
];

export default function Notifications() {
  const [settings, setSettings] = useState(
    Object.fromEntries(
      NOTIFICATIONS.map(n => [n.id, n.defaultChecked])
    )
  );

  const toggleSetting = id => {
    setSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-3 sm:p-4 w-full bg-gray-100 overflow-y-auto">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Notifications
        </h2>
      </div>

      {/* ===== CARD ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Push Notifications
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Get push notifications in the app to stay updated when you are offline.
          </p>
        </div>

        {/* ===== SETTINGS LIST ===== */}
        <div className="divide-y divide-gray-200">
          {NOTIFICATIONS.map(({ id, label }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="text-sm sm:text-base text-gray-900">
                {label}
              </span>

              {/* Toggle */}
              <button
                onClick={() => toggleSetting(id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition
                  ${settings[id] ? 'bg-green-500' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition
                    ${settings[id] ? 'translate-x-5' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
