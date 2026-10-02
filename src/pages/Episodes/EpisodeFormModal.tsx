import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import type { Episode, Voiceover } from '@/types';
import type { EpisodeFormData } from '@/api/episodes';
import { ImageUploader } from '@/components/ImageUploader/ImageUploader';
import { VideoUploader } from '@/components/VideoUploader/VideoUploader';

interface Props {
  open: boolean;
  episode: Episode | null;
  existingEpisodes: Episode[];
  seasonId?: string;
  cartoonId?: string;
  voiceovers: Voiceover[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: EpisodeFormData) => void | Promise<void>;
}

export const EpisodeFormModal = ({
  open,
  episode,
  existingEpisodes,
  seasonId,
  cartoonId,
  voiceovers,
  loading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<EpisodeFormData>();
  const isEdit = !!episode;

  useEffect(() => {
    if (!open) return;

    if (episode) {
      form.setFieldsValue({
        seasonId: episode.seasonId,
        cartoonId: episode.cartoonId,
        number: episode.number,
        title: episode.title,
        description: episode.description,
        thumbnailUrl: episode.thumbnailUrl,
        videoUrl: episode.videoUrl,
        duration: episode.duration,
        isPublished: episode.isPublished,
        voiceoverIds: episode.voiceoverIds.map((v) => v.id),
      });
    } else {
      const used = new Set(existingEpisodes.map((e) => e.number));
      let next = 1;
      while (used.has(next)) next++;

      form.resetFields();
      form.setFieldsValue({
        seasonId,
        cartoonId,
        number: next,
        title: `Серия ${next}`,
        duration: 22 * 60,
        isPublished: true,
        voiceoverIds: voiceovers.map((v) => v.id),
      });
    }
  }, [open, episode, seasonId, cartoonId, voiceovers, existingEpisodes, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактировать серию' : 'Новая серия'}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={loading}
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item name="seasonId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="cartoonId" hidden>
          <Input />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <Form.Item
            label="Номер"
            name="number"
            rules={[{ required: true, type: 'number', min: 1 }]}
            extra="Уникален внутри сезона"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Название"
            name="title"
            rules={[{ required: true, min: 2, message: 'Минимум 2 символа' }]}
          >
            <Input placeholder="Серия 1: Кленовое приключение" />
          </Form.Item>
        </div>

        <Form.Item label="Описание" name="description">
          <Input.TextArea rows={2} placeholder="Описание серии..." />
        </Form.Item>

        <Form.Item
          label="Превью"
          name="thumbnailUrl"
          rules={[{ required: true, message: 'Введите URL или загрузите файл' }]}
        >
          <ImageUploader placeholder="https://picsum.photos/seed/ep/320/180" />
        </Form.Item>

        <Form.Item
          label="Видео"
          name="videoUrl"
          rules={[{ required: true, message: 'Введите URL или загрузите файл' }]}
          extra="MP4/WebM, до 500 МБ. Или вставьте ссылку на внешнее видео"
        >
          <VideoUploader placeholder="https://...mp4" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Длительность (сек)"
            name="duration"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Опубликована" name="isPublished" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Form.Item label="Озвучки" name="voiceoverIds">
          <Select
            mode="multiple"
            placeholder="Выберите озвучки"
            options={voiceovers.map((v) => ({ label: v.name, value: v.id }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};