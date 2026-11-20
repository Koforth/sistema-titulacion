import { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  name?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  name,
  value,
  options,
  onChange,
  placeholder = '-- Seleccionar o buscar --',
  disabled = false,
  required = false,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filtrado en vivo de las opciones
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      <input type="hidden" name={name} value={value} required={required} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder={disabled ? 'NO DEFINIDO' : placeholder}
          value={isOpen ? searchTerm : value || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchTerm('');
              setHighlightedIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            minHeight: 'var(--control-h, 34px)',
            height: 'var(--control-h, 34px)',
            padding: '0 1.8rem 0 0.65rem',
            fontSize: '0.85rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #dfe3e8)',
            background: disabled ? '#f3f4f6' : '#fff',
            color: disabled ? '#6b7280' : 'var(--text-main, #1f2937)',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          autoComplete="off"
        />

        {/* Botón desplegable integrado */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              if (isOpen) {
                setIsOpen(false);
                setSearchTerm('');
              } else {
                setIsOpen(true);
                setSearchTerm('');
                inputRef.current?.focus();
              }
            }
          }}
          style={{
            position: 'absolute',
            right: '1px',
            top: '1px',
            bottom: '1px',
            width: '28px',
            background: 'transparent',
            border: 'none',
            color: disabled ? '#9ca3af' : 'var(--text-muted, #5b6472)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            padding: 0,
            minHeight: 'auto',
          }}
          aria-label="Abrir opciones"
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* Lista desplegable flotante con scroll */}
      {isOpen && !disabled && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            right: 0,
            maxHeight: '210px',
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid var(--border-color, #cfd5dc)',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)',
            zIndex: 1100,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
          }}
        >
          {filteredOptions.length === 0 ? (
            <li
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted, #6b7280)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              No se encontraron coincidencias
            </li>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <li
                  key={opt || idx}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevenir que el input pierda foco antes del click
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: isHighlighted
                      ? 'var(--primary-soft, #f8ecec)'
                      : isSelected
                      ? 'var(--gold-soft, #fdf6dc)'
                      : 'transparent',
                    color: isHighlighted
                      ? 'var(--primary, #7a1c1c)'
                      : isSelected
                      ? 'var(--gold-text, #7a5a05)'
                      : '#1f2937',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--primary, #7a1c1c)' }}>✓</span>}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
