import { Pressable, type HitSlop, type ReactNode, type StyleProp, type ViewStyle } from 'react-native';
import { useDropdownMenuContext } from './DropdownMenu';

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
