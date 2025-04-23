//! sidebar programs ---------
const sidebar = document.querySelector('.sidebar')
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn')

const profileImage = document.querySelector('.profile-image')

const projectMenu = document.querySelector('.project-menu')
const subMenuBtn = document.querySelector('.sub-menu-btn')

// sidebar toggle ----
sidebarToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show')
  profileImage.classList.toggle('enlarge')

  if(projectMenu.classList.contains('show')) {
    projectMenu.classList.remove('show')
  }
})


// sub menu toggle ----
subMenuBtn.addEventListener('click', () => {
  projectMenu.classList.toggle('show')
})





//! --------------------------

//! Create new projects programs ----------
const createNewBtn = document.querySelector('.create-new-project-btn')

const formBgLayer = document.querySelector('.form-background-layer')
const form = document.querySelector('form')
const saveOpenBtn = document.querySelector('.save-open-btn')
const skipOpenBtn = document.querySelector('.skip-info-btn')
const cancelBtn = document.querySelector('.cancel-btn')

cancelBtn.addEventListener('click', () => {
  formBgLayer.click()
})

createNewBtn.addEventListener('click', () => {
  formBgLayer.style.display = 'grid'
  form.style.display = 'block'
})

formBgLayer.addEventListener('click', () => {
  form.style.display = 'none'
  formBgLayer.style.display = 'none'
})

form.addEventListener('click', (e) => {
  e.stopPropagation()
})
form.addEventListener('submit', e => {
  e.preventDefault()
})


console.log(createNewBtn)