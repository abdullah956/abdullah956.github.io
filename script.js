function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");

  if (!menu || !icon) return;

  menu.classList.toggle("open");
  icon.classList.toggle("open");
  icon.setAttribute("aria-expanded", icon.classList.contains("open"));
}
