import { ConfirmDialog } from '@metrix/admin/metrix-admin';
import { Dialog } from '@metrix/design-system';

interface RemoveFolderDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
}

export const RemoveFolderDialog = ({ onClose, onConfirm, open }: RemoveFolderDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <ConfirmDialog onConfirm={onConfirm} />
    </Dialog.Root>
  );
};
