interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClose: () => void;
}
interface ToastProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PopUPWithConfirmation: React.FC<InputProps> = ({
  className = "",
  children,
  onClose,
}) => {
  return (
    // <input
    //   className={`w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    //   {...props}
    // />
    <div
      className={`fixed flex min-h-screen bg-[#00000061] items-center w-full`}
    >
      <div
        className={`flex flex-col  w-2/4 sm:max-w-2/5 h-[20%] bg-amber-50 text-blue-500 font-medium text-[14px] rounded-2xl p-6 space-y-4 items-center m-auto justify-center ${className}`}
      >
        <h1
          className="self-end m-[-5] text-black pr-1 cursor-pointer"
          onClick={onClose}
        >
          X
        </h1>
        {children}
      </div>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ children }) => {
  return (
    <div className="fixed min-w-4xs bg-white text-blue-950 font-medium text-[14px] p-2 m-10 transition-all ease-in rounded-[5px]">
      {children}
    </div>
  );
};
