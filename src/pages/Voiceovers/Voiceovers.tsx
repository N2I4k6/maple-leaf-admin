import { useCallback, useEffect, useState } from 'react';
import { Button, Table, Tag, message, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { voiceoversApi, type VoiceoverFormData } from '@/api/voiceovers';
import { confirmDelete } from '@/components/ConfirmDelete/ConfirmDelete';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import type { Voiceover } from '@/types';
import { VoiceoverFormModal } from './VoiceoverFormModal';
import styles from './Voiceovers.module.scss';

export const Voiceovers = () => {
  const [items, setItems] = useState<Voiceover[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await voiceoversApi.getAll());
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (values: VoiceoverFormData) => {
    setSaving(true);
    try {
      await voiceoversApi.create(values);
      void message.success('Озвучка создана');
      setModalOpen(false);
      void load();
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (v: Voiceover) => {
    confirmDelete({
      title: `Удалить «${v.name}»?`,
      onConfirm: async () => {
        try {
          await voiceoversApi.remove(v.id);
          void message.success('Озвучка удалена');
          void load();
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Не удалось удалить'));
        }
      },
    });
  };

  const columns: ColumnsType<Voiceover> = [
    {
      title: 'Название',
      dataIndex: 'name',
      render: (v: string) => <span className={styles.name}>{v}</span>,
    },
    {
      title: 'Язык',
      dataIndex: 'language',
      width: 140,
      render: (v: string) => <Tag color="blue">{v.toUpperCase()}</Tag>,
    },
    {
      title: 'Студия',
      dataIndex: 'studio',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Действия',
      width: 80,
      render: (_, row) => (
        <Tooltip title="Удалить">
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Новая озвучка
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table<Voiceover>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={false}
        />
      </div>

      <VoiceoverFormModal
        open={modalOpen}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};