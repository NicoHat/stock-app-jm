// Enter en la cantidad: salta a la cantidad del próximo producto en pantalla.
// En el último, cierra el teclado.
export function saltarAlSiguiente(e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const campos = Array.from(document.querySelectorAll('input[data-campo="cantidad"]'));
  const siguiente = campos[campos.indexOf(e.currentTarget) + 1];
  if (siguiente) {
    siguiente.focus({ preventScroll: true });
    // centrado, para que no quede tapado por el botón flotante de guardar
    siguiente.scrollIntoView({ block: "center", behavior: "smooth" });
  } else {
    e.currentTarget.blur();
  }
}
