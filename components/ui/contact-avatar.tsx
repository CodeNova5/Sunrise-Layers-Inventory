import React, { FC } from 'react';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = () => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getContrastColor = (hexColor: string) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black or white based on brightness
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

interface AvatarProps {
  name?: string;
  size: number;
  icon?: React.ElementType;
}
const ContactAvatar: FC<AvatarProps> = ({ name, size = 50, icon: Icon }) => {
  const initials = name ? getInitials(name): '';
  const backgroundColor = getRandomColor();
  const textColor = getContrastColor(backgroundColor);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: size * 0.4,
        color: textColor,
        fontFamily: "Rambla",
      }}
    >
      {Icon ? <Icon size={24} strokeWidth={1.5} /> : initials}
    </div>
  );
};

export default ContactAvatar;
