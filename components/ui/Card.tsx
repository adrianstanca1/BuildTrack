import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
