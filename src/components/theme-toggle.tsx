'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-lg ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative h-9 w-9 rounded-lg border flex items-center justify-center overflow-hidden hover:bg-accent transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4" style={{ color: '#FCD116' }} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Larger switch-style toggle for settings pages
export function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-16 rounded-full bg-muted" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative h-8 w-16 rounded-full transition-colors flex items-center px-1"
      style={{ backgroundColor: isDark ? '#006B3F' : '#e5e7eb' }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" style={{ color: '#006B3F' }} />
        ) : (
          <Sun className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
        )}
      </motion.div>
    </button>
  );
}
