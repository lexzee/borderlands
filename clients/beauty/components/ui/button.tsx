import classNames from "classnames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  return (
    <button
      className={classNames(
        "px-4 py-2 rounded-xl  font-medium transition-all cursor-pointer",
        {
          "bg-blue-600 hover:bg-blue-700 text-white": variant === "default",
          "border border-blue-600 text-blue-600 bg-white hover:bg-blue-100 text-blue":
            variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
