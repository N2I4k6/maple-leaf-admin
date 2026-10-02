import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import type { VoiceoverFormData } from '@/api/voiceovers';

interface Props {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: VoiceoverFormData) => void | Promise<void>;
}

const LANGUAGES = [
  { label: 'Русский', value: 'ru' },
  { label: 'Английский', value: 'en' },
  { label: 'Украинский', value: 'uk' },
  { label: 'Японский', value: 'ja' },
];

export const VoiceoverFormModal = ({ open, loading, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm<VoiceoverFormData>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ language: 'ru' });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title="Новая озвучка"
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText="Создать"
      cancelText="Отмена"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, min: 2 }]}
        >
          <Input placeholder="Дубляж (RU)" />
        </Form.Item>

        <Form.Item
          label="Язык"
          name="language"
          rules={[{ required: true }]}
        >
          <Select options={LANGUAGES} />
        </Form.Item>

        <Form.Item label="Студия" name="studio">
          <Input placeholder="Maple Studio (необязательно)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};