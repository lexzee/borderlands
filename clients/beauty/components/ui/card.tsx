export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`bg-gray-950 rounded-2xl shadow p-4 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);
