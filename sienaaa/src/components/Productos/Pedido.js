import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import EmptyCartModal from './EmpyCartModal';
import QuantityModal from '../inicio/QuantityModal';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const Pedido = () => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [emptyCartModalOpen, setEmptyCartModalOpen] = useState(false);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [metodoPago, setMetodoPago] = useState('');
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();

  const validarTelefono = (numero) => {
    const regex = /^3\d{9}$/;
    return regex.test(numero);
  };

  const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setEmptyCartModalOpen(true);
      return;
    }

    if (!nombre || !direccion || !telefono || !correo || !metodoPago) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    if (!validarTelefono(telefono)) {
      setError('El número de teléfono debe comenzar con 3 y tener 10 dígitos.');
      return;
    }

    if (!validarCorreo(correo)) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    setError('');

    const newOrder = {
      nombre,
      direccion,
      telefono,
      correo,
      metodoPago,
      cart,
      total: calcularTotal(),
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        await fetch('http://localhost:5000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre,
            direccion,
            telefono,
            correo,
            metodoPago,
            cart,
            total: calcularTotal(),
          }),
        });

        setPedidoExitoso(true);
        setNombre('');
        setDireccion('');
        setTelefono('');
        setCorreo('');
        setMetodoPago('');
        clearCart();
      } else {
        setError('Error al realizar el pedido. Intente de nuevo.');
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setError('Error al conectar con la API. Intente de nuevo.');
    }
  };

  const calcularTotal = () => {
    return cart.reduce((total, product) => total + (Number(product.price) * (product.quantity || 1)), 0);
  };

  const formatPrice = (price) => {
    const priceString = String(price).replace('.', '').replace(',', '.'); // Asegúrate de que sea una cadena
    const priceNumber = parseFloat(priceString);
    if (isNaN(priceNumber)) return '0.00'; // Manejo de valores no numéricos
    return priceNumber.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Formato con ceros finales
  };

  const handleQuantityChange = (product, quantity) => {
    updateQuantity(product.id, quantity);
  };

  const handleRemoveProduct = (id) => {
    removeFromCart(id);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', marginTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <h2>Información de Envío</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Tu dirección de envío"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Teléfono</label>
              <input
                type="text"
                placeholder="Tu número de teléfono"
                value={telefono}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 10 && /^[0-9]*$/.test(value)) {
                    setTelefono(value);
                  }
                }}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Selecciona un método de pago</option>
                <option value="contraentrega">Pago contra entrega</option>
                {/* Puedes agregar más opciones aquí */}
              </select>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
            >
              Realizar Pedido
            </button>
          </form>
        </div>

        <div style={{ width: '45%' }}>
          <h2>Resumen del Pedido</h2>
          <div>
            {cart.length > 0 ? (
              cart.map((product) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: '10px' }}>{product.name} × {product.quantity}</span>
                  </span>
                  <span>
                    <button onClick={() => { setSelectedProduct(product); setQuantityModalOpen(true); }} style={{ margin: '0 5px' }}>
                      <AddIcon />
                    </button>
                    <button onClick={() => handleRemoveProduct(product.id)} style={{ margin: '0 5px' }}>
                      <DeleteIcon />
                    </button>
                    <span>${formatPrice(Number(product.price) * (product.quantity || 1))}</span>
                  </span>
                </div>
              ))
            ) : (
              <p>Tu carrito está vacío</p>
            )}
            <hr />
            <h3>Total: <span style={{ float: 'right' }}>${formatPrice(calcularTotal())}</span></h3>
          </div>
        </div>
      </div>

      {pedidoExitoso && (
        <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2>¡Pedido Exitoso!</h2>
            <p>Tu pedido ha sido registrado correctamente.</p>
            <button
              onClick={() => setPedidoExitoso(false)}
              style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <EmptyCartModal open={emptyCartModalOpen} onClose={() => setEmptyCartModalOpen(false)} />
      <QuantityModal
        open={quantityModalOpen}
        onClose={() => setQuantityModalOpen(false)}
        onConfirm={handleQuantityChange}
        product={selectedProduct}
      />
    </div>
  );
};

export default Pedido;
