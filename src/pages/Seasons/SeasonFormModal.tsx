import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import type { Season, Cartoon } from '@/types';
import type { SeasonFormData } from '@/api/seasons';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';

interface Props {
  open: boolean;
  season: Season | null;
  cartoons: Cartoon[];
  existingSeasons: Season[];
  defaultCartoonId?: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: SeasonFormData) => void | Promise<void>;
}

export const SeasonFormModal = ({
  open,
  season,
  cartoons,
  existingSeasons,
  defaultCartoonId,
  loading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<SeasonFormData>();
  const isEdit = !!season;

  useEffect(() => {
    if (!open) return;

    if (season) {
      form.setFieldsValue({
        cartoonId: season.cartoonId,
        number: season.number,
        title: season.title,
        description: season.description,
        posterUrl: season.posterUrl,
      });
    } else {
      const used = new Set(existingSeasons.map((s) => s.number));
      let next = 1;
      while (used.has(next)) next++;

      form.resetFields();
      form.setFieldsValue({
        cartoonId: defaultCartoonId,
        number: next,
        title: `Сезон ${next}`,
      });
    }
  }, [open, season, defaultCartoonId, existingSeasons, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактировать сезон' : 'Новый сезон'}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={loading}
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="Сериал"
          name="cartoonId"
          rules={[{ required: true, message: 'Выберите сериал' }]}
        >
          <Select
            showSearch
            placeholder="Выберите сериал"
            optionFilterProp="label"
            options={cartoons.map((c) => ({ label: c.title, value: c.id }))}
          />
        </Form.Item>

        <Form.Item
          label="Номер сезона"
          name="number"
          rules={[{ required: true, type: 'number', min: 1 }]}
          extra="Номер должен быть уникальным внутри сериала"
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Название"
          name="title"
          rules={[{ required: true, min: 2, message: 'Минимум 2 символа' }]}
        >
          <Input placeholder="Сезон 1" />
        </Form.Item>

        <Form.Item label="Описание" name="description">
          <Input.TextArea rows={2} placeholder="Краткое описание сезона..." />
        </Form.Item>

        <Form.Item label="Постер" name="posterUrl">
          <ImageUploader placeholder="https://... (необязательно)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};