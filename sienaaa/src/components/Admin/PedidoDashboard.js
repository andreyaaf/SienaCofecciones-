import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Dialog, DialogContent, TextField } from '@mui/material';

const PedidoDashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [editingPedido, setEditingPedido] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch('http://localhost:5000/orders'); // Ajusta la URL según tu configuración
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
      }
    };

    fetchPedidos();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/orders/${id}`, { method: 'DELETE' });
      setPedidos(pedidos.filter(pedido => pedido.id !== id));
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
    }
  };

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setUpdatedStatus(pedido.status); // Suponiendo que el pedido tiene un estado
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await fetch(`http://localhost:5000/orders/${editingPedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingPedido, status: updatedStatus }),
      });
      setPedidos(pedidos.map(pedido => (pedido.id === editingPedido.id ? { ...pedido, status: updatedStatus } : pedido)));
      setOpenEditModal(false);
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Pedidos
      </Typography>
      <List>
        {pedidos.map((pedido) => (
          <ListItem key={pedido.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText
              primary={`Pedido ID: ${pedido.id} - Total: $${pedido.total.toFixed(2)}`}
              secondary={`Nombre: ${pedido.nombre} - Fecha: ${new Date(pedido.date).toLocaleDateString()} - Estado: ${pedido.status}`}
            />
            <div>
              <Button variant="outlined" color="primary" onClick={() => handleEdit(pedido)} sx={{ mr: 1 }}>
                Editar
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleDelete(pedido.id)}>
                Eliminar
              </Button>
            </div>
          </ListItem>
        ))}
      </List>

      {/* Modal para editar pedido */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogContent>
          <Typography variant="h6">Editar Estado del Pedido</Typography>
          <TextField
            label="Estado"
            variant="outlined"
            fullWidth
            value={updatedStatus}
            onChange={(e) => setUpdatedStatus(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>
            Actualizar
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PedidoDashboard;
