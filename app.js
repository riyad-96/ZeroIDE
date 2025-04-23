//! sidebar programs ---------
const sidebar = document.querySelector('.sidebar')
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn')

const projectMenu = document.querySelector('.project-menu')
const subMenuBtn = document.querySelector('.sub-menu-btn')

// sidebar toggle ----
sidebarToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show')
  if(projectMenu.classList.contains('show')) {
    projectMenu.classList.remove('show')
  }
})

// sub menu toggle ----
subMenuBtn.addEventListener('click', () => {
  projectMenu.classList.toggle('show')
})





//! --------------------------