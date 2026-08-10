import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStockSistema() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data: productosData, error: errProd } = await supabase
      .from("productos")
      .select("id, nombre, categoria, unidad, cantidad")
      .order("nombre");

    const { data: sistemaData, error: errSist } = await supabase
      .from("stock_sistema")
      .select("id, producto_id, cantidad");

    if (errProd || errSist) {
      console.error(errProd || errSist);
      setLoading(false);
      return;
    }

    const combinado = productosData.map((p) => {
      const registro = sistemaData.find((s) => s.producto_id === p.id);
      return {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        unidad: p.unidad,
        cantidad_fisico: p.cantidad,
        cantidad_sistema: registro?.cantidad ?? 0,
        stock_sistema_id: registro?.id ?? null,
      };
    });

    setProductos(combinado);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarCantidad = async (productoId, stockSistemaId, cantidad_sistema) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, cantidad_sistema } : p))
    );

    if (stockSistemaId) {
      const { error } = await supabase
        .from("stock_sistema")
        .update({ cantidad: cantidad_sistema, updated_at: new Date().toISOString() })
        .eq("id", stockSistemaId);
      if (error) console.error(error);
    } else {
      const { data, error } = await supabase
        .from("stock_sistema")
        .insert({ producto_id: productoId, cantidad: cantidad_sistema })
        .select()
        .single();
      if (error) {
        console.error(error);
      } else {
        setProductos((prev) =>
          prev.map((p) =>
            p.id === productoId ? { ...p, stock_sistema_id: data.id } : p
          )
        );
      }
    }
  };

  return { productos, loading, actualizarCantidad };
}