import * as React from "react";
import { cn } from "@/lib/utils";

interface InputOTPContextValue {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled: boolean;
}

const InputOTPContext = React.createContext<InputOTPContextValue>({
  value: "",
  onChange: () => {},
  maxLength: 6,
  disabled: false,
});

interface InputOTPProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  className?: string;
  children?: React.ReactNode;
}

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      className,
      value = "",
      onChange = () => {},
      maxLength = 6,
      disabled = false,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <InputOTPContext.Provider
        value={{ value, onChange, maxLength, disabled }}
      >
        <div
          ref={ref}
          className={cn("flex items-center gap-2", className)}
          onKeyDown={onKeyDown}
          {...props}
        >
          {children}
        </div>
      </InputOTPContext.Provider>
    );
  },
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

interface InputOTPSlotProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  index?: number;
}

const InputOTPSlot = React.forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ className, index = 0, ...props }, ref) => {
    const { value, onChange, maxLength, disabled } = React.useContext(InputOTPContext);
    const [digit, setDigit] = React.useState("");

    React.useEffect(() => {
      setDigit(value[index] || "");
    }, [value, index]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, "").slice(-1);
      setDigit(val);

      const chars = (value || "").split("");
      while (chars.length < index + 1) chars.push("");
      chars[index] = val;
      onChange(chars.join("").slice(0, maxLength));

      if (val && e.target.nextElementSibling) {
        (e.target.nextElementSibling as HTMLInputElement).focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Backspace" &&
        !digit &&
        e.currentTarget.previousElementSibling
      ) {
        (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (pasted) {
        onChange(pasted);
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={digit}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        className={cn(
          "h-10 w-10 text-center border-b-2 border-input bg-transparent text-lg focus:outline-none focus:border-ring",
          className,
        )}
        {...props}
      />
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
    </svg>
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
