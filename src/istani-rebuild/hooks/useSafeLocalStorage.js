import { useEffect, useRef, useState } from 'react';

const defaultSerialize = value => {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const defaultDeserialize = value => {
  if (value === null || value === undefined) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const resolveDefault = defaultValue =>
  typeof defaultValue === 'function' ? defaultValue() : defaultValue;

export const useSafeLocalStorage = (key, defaultValue, options = {}) => {
  const {
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
    logger = console
  } = options;

  const optionsRef = useRef({ serialize, deserialize, logger });
  optionsRef.current = { serialize, deserialize, logger };

  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return resolveDefault(defaultValue);
    }

    try {
      const stored = window.localStorage.getItem(key);

      if (stored === null) {
        return resolveDefault(defaultValue);
      }

      const parsed = optionsRef.current.deserialize
        ? optionsRef.current.deserialize(stored)
        : stored;

      return parsed === undefined ? resolveDefault(defaultValue) : parsed;
    } catch (error) {
      if (optionsRef.current.logger?.error) {
        optionsRef.current.logger.error(
          `Error reading localStorage key "${key}":`,
          error
        );
      }

      return resolveDefault(defaultValue);
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const { serialize: currentSerialize } = optionsRef.current;
      const serializedValue = currentSerialize
        ? currentSerialize(value)
        : value;

      if (serializedValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      const { logger: currentLogger } = optionsRef.current;
      if (currentLogger?.error) {
        currentLogger.error(
          `Error writing localStorage key "${key}":`,
          error
        );
      }
    }
  }, [key, value]);

  return [value, setValue];
};
