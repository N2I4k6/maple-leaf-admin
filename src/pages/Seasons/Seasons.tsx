import { useCallback, useEffect, useState } from 'react';
import { Button, Select, Table, message, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { seasonsApi, type SeasonFormData } from '@/api/seasons';
import { cartoonsApi } from '@/api/cartoons';
import { confirmDelete } from '@/components/ConfirmDelete/ConfirmDelete';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/api-error';
import type { Season, Cartoon } from '@/types';
import { SeasonFormModal } from './SeasonFormModal';
import styles from './Seasons.module.scss';

export const Seasons = () => {
  const [cartoons, setCartoons] = useState<Cartoon[]>([]);
  const [selectedCartoon, setSelectedCartoon] = useState<string | undefined>();

  const [items, setItems] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void cartoonsApi
      .getAll({ limit: 100 })
      .then((d) => {
        if (cancelled) return;
        setCartoons(d.items);
        if (d.items[0]) setSelectedCartoon(d.items[0].id);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          void message.error(getApiErrorMessage(error, 'Не удалось загрузить сериалы'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!selectedCartoon) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await seasonsApi.getByCartoon(selectedCartoon);
      setItems(data);
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить сезоны'));
    } finally {
      setLoading(false);
    }
  }, [selectedCartoon]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);
    setModalOpen(true);
  };

  const handleSubmit = async (values: SeasonFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await seasonsApi.update(editing.id, values);
        void message.success('Сезон обновлён');
      } else {
        await seasonsApi.create(values);
        void message.success('Сезон создан');
      }
      setModalOpen(false);
      void load();
    } catch (error) {
      const status = getApiErrorStatus(error);
      const text = getApiErrorMessage(error, 'Не удалось сохранить');

      if (status === 409) {
        void message.error(text || 'Сезон с таким номером уже существует');
      } else {
        void message.error(text);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (season: Season) => {
    confirmDelete({
      title: `Удалить «${season.title}»?`,
      onConfirm: async () => {
        try {
          await seasonsApi.remove(season.id);
          void message.success('Сезон удалён');
          void load();
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Не удалось удалить'));
        }
      },
    });
  };

  const columns: ColumnsType<Season> = [
    { title: '№', dataIndex: 'number', width: 70 },
    {
      title: 'Название',
      dataIndex: 'title',
      render: (v: string) => <span className={styles.title}>{v}</span>,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (v: string) => v || <span style={{ color: 'var(--ml-text-muted)' }}>—</span>,
    },
    {
      title: 'Действия',
      width: 110,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Редактировать">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
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
        <div className={styles.filters}>
          <Select
            style={{ width: '100%' }}
            placeholder="Выберите сериал"
            value={selectedCartoon}
            onChange={setSelectedCartoon}
            showSearch
            optionFilterProp="label"
            options={cartoons.map((c) => ({ label: c.title, value: c.id }))}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          disabled={!selectedCartoon}
        >
          Новый сезон
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table<Season>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={false}
        />
      </div>

      <SeasonFormModal
        open={modalOpen}
        season={editing}
        cartoons={cartoons}
        existingSeasons={items}
        defaultCartoonId={selectedCartoon}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};