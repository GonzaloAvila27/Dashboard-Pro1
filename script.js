function toggleAside() {
    const aside = document.querySelector('aside.desplegable');
    aside.classList.toggle('oculto');
    document.body.classList.toggle('aside-oculto');
}
