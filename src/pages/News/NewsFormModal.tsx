import { useEffect } from 'react';
import { Form, Input, Modal, Switch } from 'antd';
import type { NewsItem } from '@/types';
import type { NewsFormData } from '@/api/news';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';

interface Props {
  open: boolean;
  news: NewsItem | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: NewsFormData) => void | Promise<void>;
}

export const NewsFormModal = ({
  open,
  news,
  loading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<NewsFormData>();
  const isEdit = !!news;

  useEffect(() => {
    if (open) {
      if (news) {
        form.setFieldsValue({
          title: news.title,
          excerpt: news.excerpt,
          content: news.content,
          coverUrl: news.coverUrl,
          isPublished: news.isPublished,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isPublished: true });
      }
    }
  }, [open, news, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактировать новость' : 'Новая новость'}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={loading}
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="Заголовок"
          name="title"
          rules={[{ required: true, min: 3, message: 'Минимум 3 символа' }]}
        >
          <Input placeholder="Обновление Maple Leaf" />
        </Form.Item>

        <Form.Item
          label="Краткое описание"
          name="excerpt"
          rules={[{ required: true, min: 10 }]}
        >
          <Input.TextArea rows={2} placeholder="О чём новость..." />
        </Form.Item>

        <Form.Item
          label="Полный текст"
          name="content"
          rules={[{ required: true, min: 20 }]}
        >
          <Input.TextArea rows={6} placeholder="Полный текст новости..." />
        </Form.Item>

        <Form.Item
          label="Обложка"
          name="coverUrl"
          rules={[{ required: true, message: 'Введите URL или загрузите файл' }]}
        >
          <ImageUploader placeholder="https://picsum.photos/seed/news/800/400" />
        </Form.Item>

        <Form.Item label="Опубликована" name="isPublished" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};