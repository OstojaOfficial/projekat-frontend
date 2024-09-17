import React, { useState, useEffect } from 'react';
import './App.scss';
import axios from 'axios';
import { Table, Popconfirm, Space, Button, Modal, ConfigProvider, Input, theme } from "antd";
import type { TableProps } from 'antd';

interface Todo {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });

  /*const [todos, setTodos] = useState<Todo[]>([
    {
      id: 0,
      title: 'Edward King 0',
      description: '32',
      createdAt: '2015-02-08T09:30:26Z',
    },
    {
      id: 1,
      title: 'Edward King 1',
      description: '32',
      createdAt: '2013-02-08T09:30:26Z',
    },
  ]);*/

  // Fetch list on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);

    await addTodo();
    setOpen(false);
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDelete = async (id: React.Key) => {
    setConfirmLoading(true);
    const newData = todos.filter((item) => item.id !== id);
    await deleteTodo(Number(id));
    setTodos(newData);
    setConfirmLoading(false);
  };

  const columns: TableProps<Todo>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created at',
      key: 'createdAt',
      render: (_, record) => (
        <Space size="middle">
          <p>{new Date(record.createdAt).toLocaleString()}</p>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        <Popconfirm title="Sure to delete?"
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handleCancel}
          onConfirm={() => handleDelete(record.id)}>
          <a>Delete</a>
        </Popconfirm>
    },
  ];

  // Fetch the list of tasks
  const fetchTodos = async () => {
    try {
      const response = await axios.get<Todo[]>('http://localhost:8080/api/todo');
      // Sort todo list by datetime in descending order
      const sortedTodoList = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTodos(sortedTodoList);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Add new task
  const addTodo = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/todo', {
        title: newTodo.title,
        description: newTodo.description
      });
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Delete task
  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/todo/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Update
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo({
      ...newTodo,
      [e.target.name]: e.target.value,
    });
  };

  // FILTER BY TITLE
  // FILTER BY DATE AFTER

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <div className="App">
        <h1>Todo List</h1>
        <div>
          <Button type="primary" onClick={showModal}>
            Add task to the list
          </Button>
          <Modal
            title="Add task to the list"
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
          >
          <Input
            type="text"
            name="title"
            placeholder="Title"
            value={newTodo.title}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="description"
            placeholder="Description"
            value={newTodo.description}
            onChange={handleChange}
          />
            <p>Enter title and description of the task.</p>
          </Modal>
        </div>
        <br></br>
        <Table columns={columns} dataSource={todos} pagination={false}></Table>
      </div>
    </ConfigProvider>
  );
};

export default App
