import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  size?: 'normal' | 'wide';
  multiSelect?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите опцию',
  size = 'normal',
  multiSelect = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Нормализуем value в массив для удобства работы
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));

  const handleOptionClick = (optionValue: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
      // Не закрываем dropdown при множественном выборе
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeSelectedOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect && Array.isArray(value)) {
      const newValues = value.filter(v => v !== optionValue);
      onChange(newValues);
    }
  };

  return (
    <div 
      className={`vk-select-container ${size === 'wide' ? 'wide' : ''}`}
      ref={selectRef}
    >
      <div
        className={`vk-select-custom ${isOpen ? 'open' : ''} ${multiSelect ? 'multi' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="vk-select-display">
          {multiSelect ? (
            <div className="vk-select-multi-display">
              {selectedOptions.length > 0 ? (
                selectedOptions.map(option => (
                  <div key={option.value} className="vk-select-tag">
                    <div className="vk-select-tag-label" title={option.label}>{option.label}</div>
                    <button
                      type="button"
                      className="vk-select-tag-remove"
                      onClick={(e) => removeSelectedOption(option.value, e)}
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <span className="vk-select-placeholder">{placeholder}</span>
              )}
            </div>
          ) : (
            <span title={selectedOptions[0]?.label || placeholder}>
              {selectedOptions[0]?.label || placeholder}
            </span>
          )}
        </div>
        {isOpen && (
          <div className="vk-select-options">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`vk-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(option.value)}
                  title={option.label}
                >
                  <div className="vk-select-option-content">
                    {multiSelect && (
                      <div className="vk-select-checkbox">
                        {isSelected && <span className="vk-select-checkmark">✓</span>}
                      </div>
                    )}
                    <span className="vk-select-option-text">{option.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
