import Image from 'next/image';

const NotificationIconsPreview = () => {
  const icons = [
    { src: '/icons/notification-icon.png', label: 'Notification' },
    { src: '/icons/badge-icon.png', label: 'Badge' },
    { src: '/icons/insights-icon.png', label: 'Insights' },
    { src: '/icons/feature-icon.png', label: 'Feature' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Notification Icons Preview
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {icons.map((icon) => (
          <div
            key={icon.label}
            className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative w-20 h-20">
              <Image
                src={icon.src}
                alt={icon.label}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {icon.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationIconsPreview; 