import { useCallback, useEffect, useState } from 'react';
import { Button, Table, Tag, message, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { newsApi, type NewsFormData } from '@/api/news';
import { confirmDelete } from '@/components/ConfirmDelete/ConfirmDelete';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import type { NewsItem } from '@/types';
import { NewsFormModal } from './NewsFormModal';
import styles from './News.module.scss';

const PAGE_SIZE = 10;

export const News = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsApi.getAll({ page, limit: PAGE_SIZE });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить новости'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (n: NewsItem) => {
    setEditing(n);
    setModalOpen(true);
  };

  const handleSubmit = async (values: NewsFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await newsApi.update(editing.id, values);
        void message.success('Новость обновлена');
      } else {
        await newsApi.create(values);
        void message.success('Новость создана');
      }
      setModalOpen(false);
      void load();
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (n: NewsItem) => {
    confirmDelete({
      title: `Удалить «${n.title}»?`,
      onConfirm: async () => {
        try {
          await newsApi.remove(n.id);
          void message.success('Новость удалена');
          void load();
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Не удалось удалить'));
        }
      },
    });
  };

  const columns: ColumnsType<NewsItem> = [
    {
      title: '',
      dataIndex: 'coverUrl',
      width: 100,
      render: (url: string) => <img src={url} alt="" className={styles.cover} />,
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      render: (_: string, row) => (
        <div>
          <div className={styles.title}>{row.title}</div>
          <div className={styles.excerpt}>{row.excerpt}</div>
        </div>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'publishedAt',
      width: 130,
      render: (v: string | undefined, row) => {
        if (v) return new Date(v).toLocaleDateString('ru-RU');
        if (row?.createdAt) return new Date(row.createdAt).toLocaleDateString('ru-RU');
        return '—';
      },
    },
    {
      title: 'Статус',
      dataIndex: 'isPublished',
      width: 120,
      render: (v: boolean) =>
        v ? <Tag color="green">Опубликована</Tag> : <Tag>Черновик</Tag>,
    },
    {
      title: 'Действия',
      width: 110,
      fixed: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Редактировать">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Новая новость
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table<NewsItem>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: setPage,
            showSizeChanger: false,
          }}
        />
      </div>

      <NewsFormModal
        open={modalOpen}
        news={editing}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};