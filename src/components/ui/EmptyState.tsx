import { Search, Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'package';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ title, description, icon = 'package', action }: EmptyStateProps) {
  const IconComponent = icon === 'search' ? Search : Package;

  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <IconComponent className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
} 