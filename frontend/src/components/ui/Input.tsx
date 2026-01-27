import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    inputSize?: 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, inputSize = 'md', className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="input-label">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${inputSize === 'lg' ? 'input-lg' : 'input'} ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
                {hint && !error && (
                    <p className="input-hint">{hint}</p>
                )}
                {error && (
                    <p className="input-error-message">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    selectSize?: 'md' | 'lg';
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, selectSize = 'md', options, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="input-label">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`${selectSize === 'lg' ? 'select-lg' : 'select'} ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="input-error-message">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="input-label">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`input min-h-[100px] resize-y ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
                {hint && !error && (
                    <p className="input-hint">{hint}</p>
                )}
                {error && (
                    <p className="input-error-message">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
