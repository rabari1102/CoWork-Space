import { useEffect, useId, useRef, useState } from 'react';

/**
 * Dropdown built from a button and a listbox.
 *
 * A native select would be simpler, but its open option list is drawn by the
 * operating system and cannot be reached by CSS, so it arrives with square
 * corners, a system blue highlight and the wrong typeface. Rendering the list
 * in the page is the only way to make it match the rest of the UI.
 *
 * Follows the ARIA combobox pattern: focus stays on the button and the
 * highlighted option is announced through aria-activedescendant.
 */
export default function Select({
  value,
  onChange,
  options,
  id,
  ariaLabel,
  placeholder = 'Select...',
  variant = 'field',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const generatedId = useId();
  const listId = `${id || generatedId}-listbox`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // Keep the highlighted row in view when arrowing through a long list.
  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (index) => {
    onChange(options[index].value);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) return openList();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((current) => (current + step + options.length) % options.length);
        return undefined;
      }
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return undefined;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        return undefined;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) choose(activeIndex);
        else openList();
        return undefined;
      case 'Escape':
        setOpen(false);
        return undefined;
      case 'Tab':
        setOpen(false);
        return undefined;
      default:
        return undefined;
    }
  };

  const triggerClass =
    variant === 'bare'
      ? 'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 focus:outline-none transition-colors'
      : 'field flex items-center justify-between gap-2 text-left';


  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={triggerClass}
      >
        <span className={selected ? 'truncate' : 'truncate text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <i
          className={`ph ph-caret-down shrink-0 text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full min-w-[12rem] animate-scale-in overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200/90"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                data-active={isActive}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                } ${isSelected ? 'font-bold text-brand-700 bg-brand-50/60' : ''}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <i className="ph ph-check shrink-0 text-brand-600 font-bold" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
