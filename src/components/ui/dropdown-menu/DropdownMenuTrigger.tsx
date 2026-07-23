import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';
import { useDropdownMenuContext } from './DropdownMenu';

type HitSlop = { top?: number; left?: number; bottom?: number; right?: number } | number;

interface DropdownMenuTriggerProps {
  children: ReactNode;
  disabled?: boolean;
  hitSlop?: HitSlop;
  style?: StyleProp<ViewStyle>;
}

export default function DropdownMenuTrigger({ children, disabled, hitSlop, style }: DropdownMenuTriggerProps) {
  const { open, triggerRef } = useDropdownMenuContext();

  return (
    <Pressable ref={triggerRef} onPress={open} disabled={disabled} hitSlop={hitSlop} style={style}>
      {children}
    </Pressable>
  );
}
