import * as React from "react";
import { cn } from "@repo/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";

/**
 * We combine typical HTML <input> attributes with our custom props.
 *
 * - `React.ComponentPropsWithoutRef<"input">` includes:
 *   - All standard HTML attributes for an <input> element.
 *   - Excludes the ref prop (so we can forward it ourselves).
 */
type EnhancedInputProps = React.ComponentPropsWithoutRef<"input"> & {
	/** Optional content displayed to the left of the input (icon, label, etc.) */
	prefix?: React.ReactNode;
	/** Optional content displayed to the right of the input */
	suffix?: React.ReactNode;
	/** If true and type="password", shows a small icon button to toggle password visibility */
	showPasswordToggle?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
	(
		{
			className,
			type = "text",
			prefix,
			suffix,
			showPasswordToggle = true,
			...props
		},
		ref
	) => {
		/** State for toggling password visibility if requested. */
		const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

		/**
		 * If showPasswordToggle is true and original type is password,
		 * override the actual input type based on isPasswordVisible.
		 */
		const resolvedType =
			showPasswordToggle && type === "password"
				? isPasswordVisible
					? "text"
					: "password"
				: type;

		return (
			<div className="relative inline-flex items-center space-x-2">
				{/* PREFIX */}
				{prefix && (
					<div className="flex items-center text-sm text-muted-foreground">
						{prefix}
					</div>
				)}

				{/* INPUT */}
				<input
					ref={ref}
					type={resolvedType}
					data-slot="input"
					className={cn(
						// Original styles from the snippet
						"border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
						"flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs",
						"transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
						"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
						"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
						className
					)}
					{...props}
				/>

				{/* PASSWORD TOGGLE (if requested and type=password) */}
				{showPasswordToggle && type === "password" && (
					<button
						type="button"
						onClick={() => setIsPasswordVisible((prev) => !prev)}
						className="flex items-center p-1 text-sm text-muted-foreground"
						aria-label={isPasswordVisible ? "Hide password" : "Show password"}
					>
						{isPasswordVisible ? (
							<EyeOff className="w-4 h-4" />
						) : (
							<Eye className="w-4 h-4" />
						)}
					</button>
				)}

				{/* SUFFIX */}
				{suffix && (
					<div className="flex items-center text-sm text-muted-foreground">
						{suffix}
					</div>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";
