import {FC, ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";

interface TransitionProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
}

/**
 * Fade transition component for smooth UI transitions
 */
export const FadeTransition: FC<TransitionProps> = ({
  children,
  show,
  duration = 0.3
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Slide up transition component for smooth UI transitions
 */
export const SlideUpTransition: FC<TransitionProps> = ({
  children,
  show,
  duration = 0.3
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
