import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { cn } from '../common/index.js';
import { useTranslation } from '../i18n/use-translation.js';

import { SearchIcon } from './shell-icons.js';
import { filterCommands, type ShellCommand, type ShellNavSection } from './shell-navigation.js';

interface CommandPaletteProps {
    sections: ShellNavSection[];
    commands: ShellCommand[];
    onClose: () => void;
}

/**
 * Go anywhere by typing.
 *
 * Mounted only while open, so the query and the highlighted row start clean each time with nothing
 * to reset. Focus stays in the input and the arrow keys move the highlight, which is how a palette
 * is driven; the rows are still real buttons for somebody with a pointer.
 */
export function CommandPalette({ sections, commands, onClose }: Readonly<CommandPaletteProps>): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const results = filterCommands(sections, commands, query);
    const highlighted = Math.min(selected, Math.max(0, results.length - 1));

    useEffect(() => {
        listRef.current?.children.item(highlighted)?.scrollIntoView({ block: 'nearest' });
    }, [highlighted]);

    function open(command: ShellCommand): void {
        onClose();
        void navigate(command.to);
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === 'Escape') {
            onClose();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelected(Math.min(highlighted + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected(Math.max(highlighted - 1, 0));
        } else if (event.key === 'Enter') {
            const command = results.at(highlighted);

            if (command !== undefined) open(command);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
            <button
                type="button"
                aria-label={t('shell.close')}
                tabIndex={-1}
                onClick={onClose}
                className="absolute inset-0 animate-fade-in bg-ink/40"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t('shell.search')}
                className="relative flex max-h-[60vh] w-full max-w-xl animate-scale-in flex-col overflow-hidden rounded-panel bg-surface shadow-xl"
            >
                <div className="flex items-center gap-3 border-b border-line px-4">
                    <span className="text-faint">
                        <SearchIcon />
                    </span>
                    <input
                        autoFocus
                        value={query}
                        placeholder={t('shell.search-placeholder')}
                        aria-label={t('shell.search')}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setSelected(0);
                        }}
                        onKeyDown={onKeyDown}
                        className="min-h-14 w-full bg-transparent text-body text-ink outline-hidden placeholder:text-faint"
                    />
                </div>
                {results.length === 0 ? (
                    <p className="px-4 py-10 text-center text-small text-muted">{t('shell.search-empty')}</p>
                ) : (
                    <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
                        {results.map((command, index) => (
                            <li key={`${command.group ?? ''}${command.to}${command.label}`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        open(command);
                                    }}
                                    onPointerMove={() => {
                                        setSelected(index);
                                    }}
                                    className={cn(
                                        'flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-label',
                                        index === highlighted ? 'bg-accent-soft text-accent' : 'text-ink-soft',
                                    )}
                                >
                                    {command.icon !== undefined && <span className="shrink-0">{command.icon}</span>}
                                    <span className="min-w-0 flex-1 truncate">{command.label}</span>
                                    {command.group !== undefined && (
                                        <span className="shrink-0 text-caption text-faint">{command.group}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
