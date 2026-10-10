(() => {
  const form = document.getElementById('rsvp-form');
  const family = document.getElementById('family');
  family.addEventListener('input', () => family.setCustomValidity(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = family.value.trim();
    family.setCustomValidity(name ? '' : 'Escribe tu nombre o el de tu familia.');
    if (!form.reportValidity()) return;
    const adults = Number(document.getElementById('adults').value);
    const children = Number(document.getElementById('children').value);
    if (!Number.isInteger(adults) || adults < 1 || adults > 30 ||
        !Number.isInteger(children) || children < 0 || children > 30) return;
    const message = `¡Hola! Soy ${name}. Confirmamos nuestra asistencia a la fiesta de Fabi el 14 de octubre de 2026 a las 3:30 p. m. en Carl’s Jr. García Salinas.\n\nAdultos: ${adults}\nNiñas y niños: ${children}\n\n¡Gracias por invitarnos!`;
    window.location.assign(`https://wa.me/524921012644?text=${encodeURIComponent(message)}`);
  });
})();
