import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 400;

interface SwipeCardProps {
  cardKey: string | number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDrag?: (offsetX: number) => void;
  children: ReactNode;
  className?: string;
}

export default function SwipeCard({
  cardKey,
  onSwipeLeft,
  onSwipeRight,
  onDrag,
  children,
  className = '',
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);
  const leftHintOpacity = useTransform(x, [-160, -40, 0], [0.55, 0.2, 0]);
  const rightHintOpacity = useTransform(x, [0, 40, 160], [0, 0.2, 0.55]);
  const exiting = useRef(false);

  const flyOut = (direction: 'left' | 'right', cb: () => void) => {
    if (exiting.current) return;
    exiting.current = true;
    onDrag?.(0);
    const target = direction === 'left' ? -420 : 420;
    animate(x, target, {
      type: 'spring',
      stiffness: 280,
      damping: 28,
      onComplete: () => {
        cb();
        x.set(0);
        exiting.current = false;
      },
    });
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (exiting.current) return;
    const { offset, velocity } = info;
    const swipeLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
    const swipeRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;

    if (swipeLeft) {
      flyOut('left', onSwipeLeft);
      return;
    }
    if (swipeRight) {
      flyOut('right', onSwipeRight);
      return;
    }
    onDrag?.(0);
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
  };

  return (
    <motion.div
      key={cardKey}
      className={`swipe-card ${className}`}
      style={{ x, rotate, touchAction: 'none' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88}
      onDrag={(_e, info) => onDrag?.(info.offset.x)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
    >
      <motion.div className="swipe-card__shade swipe-card__shade--left" style={{ opacity: leftHintOpacity }} />
      <motion.div className="swipe-card__shade swipe-card__shade--right" style={{ opacity: rightHintOpacity }} />
      {children}
    </motion.div>
  );
}
