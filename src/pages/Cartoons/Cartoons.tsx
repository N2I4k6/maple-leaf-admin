import { useCallback, useEffect, useState } from 'react';
import { Button, Input, Table, Tag, message, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { cartoonsApi, type CartoonFormData } from '@/api/cartoons';
import { confirmDelete } from '@/components/ConfirmDelete/ConfirmDelete';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import type { Cartoon } from '@/types';
import { CartoonFormModal } from './CartoonFormModal';
import styles from './Cartoons.module.scss';

const PAGE_SIZE = 10;

export const Cartoons = () => {
  const [items, setItems] = useState<Cartoon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cartoon | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartoonsApi.getAll({ page, limit: PAGE_SIZE, search });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить сериалы'));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (cartoon: Cartoon) => {
    setEditing(cartoon);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CartoonFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await cartoonsApi.update(editing.id, values);
        void message.success('Сериал обновлён');
      } else {
        await cartoonsApi.create(values);
        void message.success('Сериал создан');
      }
      setModalOpen(false);
      void load();
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cartoon: Cartoon) => {
    confirmDelete({
      title: `Удалить «${cartoon.title}»?`,
      content:
        'Все связанные сезоны и серии тоже будут удалены вручную (если понадобится).',
      onConfirm: async () => {
        try {
          await cartoonsApi.remove(cartoon.id);
          void message.success('Сериал удалён');
          void load();
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Не удалось удалить'));
        }
      },
    });
  };

  const columns: ColumnsType<Cartoon> = [
    {
      title: '',
      dataIndex: 'posterUrl',
      width: 60,
      render: (url: string, row) => (
        <img src={url} alt={row.title} className={styles.poster} />
      ),
    },
    {
      title: 'Название',
      dataIndex: 'title',
      render: (_: string, row) => (
        <div>
          <div className={styles.title}>{row.title}</div>
          <div className={styles.slug}>/{row.slug}</div>
        </div>
      ),
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      width: 90,
      render: (v: number) => <Tag color="red">⭐ {v.toFixed(1)}</Tag>,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Год',
      dataIndex: 'year',
      width: 80,
    },
    {
      title: 'Жанры',
      dataIndex: 'genres',
      width: 220,
      render: (genres: string[]) => (
        <div className={styles.genres}>
          {genres.map((g) => (
            <span key={g} className={styles.genre}>
              {g}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isPublished',
      width: 120,
      render: (v: boolean) =>
        v ? <Tag color="green">Опубликован</Tag> : <Tag>Черновик</Tag>,
    },
    {
      title: 'Действия',
      width: 110,
      fixed: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Редактировать">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(row)}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(row)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <Input.Search
          className={styles.search}
          placeholder="Поиск по названию..."
          allowClear
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Новый сериал
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table<Cartoon>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: setPage,
            showSizeChanger: false,
          }}
        />
      </div>

      <CartoonFormModal
        open={modalOpen}
        cartoon={editing}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};