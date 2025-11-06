const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
