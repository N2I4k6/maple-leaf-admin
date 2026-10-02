import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Switch, Select } from 'antd';
import type { Cartoon } from '@/types';
import type { CartoonFormData } from '@/api/cartoons';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';

interface Props {
  open: boolean;
  cartoon: Cartoon | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CartoonFormData) => void | Promise<void>;
}

const GENRE_OPTIONS = [
  'Приключения',
  'Фэнтези',
  'Комедия',
  'Драма',
  'Мистика',
  'Экшн',
  'Семейный',
  'Для детей',
].map((g) => ({ label: g, value: g }));

export const CartoonFormModal = ({
  open,
  cartoon,
  loading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<CartoonFormData>();
  const isEdit = !!cartoon;

  useEffect(() => {
    if (open) {
      if (cartoon) {
        form.setFieldsValue({
          title: cartoon.title,
          description: cartoon.description,
          rating: cartoon.rating,
          posterUrl: cartoon.posterUrl,
          year: cartoon.year,
          genres: cartoon.genres,
          isPublished: cartoon.isPublished,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          rating: 7,
          year: new Date().getFullYear(),
          genres: [],
          isPublished: true,
        });
      }
    }
  }, [open, cartoon, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактировать сериал' : 'Новый сериал'}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="Название"
          name="title"
          rules={[{ required: true, min: 2, message: 'Минимум 2 символа' }]}
        >
          <Input placeholder="Кленовый лес" />
        </Form.Item>

        <Form.Item
          label="Описание"
          name="description"
          rules={[{ required: true, min: 10, message: 'Минимум 10 символов' }]}
        >
          <Input.TextArea rows={3} placeholder="Описание мультсериала..." />
        </Form.Item>

        <Form.Item
          label="Постер"
          name="posterUrl"
          rules={[
            { required: true, message: 'Введите URL или загрузите файл' },
          ]}
        >
          <ImageUploader placeholder="https://picsum.photos/seed/maple/400/560" />
        </Form.Item>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <Form.Item
            label="Рейтинг"
            name="rating"
            rules={[{ required: true, type: 'number', min: 0, max: 10 }]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Год"
            name="year"
            rules={[{ required: true, type: 'number', min: 1950, max: 2100 }]}
          >
            <InputNumber min={1950} max={2100} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item label="Жанры" name="genres">
          <Select
            mode="tags"
            placeholder="Выберите или введите жанры"
            options={GENRE_OPTIONS}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item
          label="Опубликован"
          name="isPublished"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};