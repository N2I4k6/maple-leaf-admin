import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface Options {
  title?: string;
  content?: string;
  onConfirm: () => void | Promise<void>;
}

export const confirmDelete = ({
  title = 'Удалить запись?',
  content = 'Это действие нельзя отменить.',
  onConfirm,
}: Options) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleFilled style={{ color: '#C8102E' }} />,
    content,
    okText: 'Удалить',
    okType: 'danger',
    cancelText: 'Отмена',
    async onOk() {
      await onConfirm();
    },
  });
};