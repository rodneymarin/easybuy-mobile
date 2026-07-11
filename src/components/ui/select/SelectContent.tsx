import { type StyleProp, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useSelectContext } from './Select';

interface SelectContentProps {
	children: ReactNode;
	title?: string;
	cardStyle?: StyleProp<ViewStyle>;
}

export default function SelectContent({ children, title, cardStyle }: SelectContentProps) {
	const { isOpen, close } = useSelectContext();

	return (
		<Dialog isOpen={isOpen} onClose={close}>
			<DialogContent style={[{ width: '100%' }, cardStyle]}>
				{title && <DialogTitle>{title}</DialogTitle>}
				{children}
			</DialogContent>
		</Dialog>
	);
}
