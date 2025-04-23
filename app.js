//! ----- Variables -----
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');

const profileImage = document.querySelector('.profile-image');

const projectMenu = document.querySelector('.project-menu');
const subMenuBtn = document.querySelector('.sub-menu-btn');

const formBgLayer = document.querySelector('.form-background-layer');
const form = document.querySelector('form');
const cancelBtn = document.querySelector('.cancel-btn');
const createBtn = document.querySelector('.create-btn');
const createOpenBtn = document.querySelector('.create-open-btn');

const createNewBtn = document.querySelector('.create-new-project-btn');

const savedProjects =
  JSON.parse(localStorage.getItem('all-saved-projects')) || [];
const projectList = document.querySelector('.project-list');
const projectTitleInput = document.getElementById('project-title');
const projectDescriptionInput = document.getElementById('project-description');

//! sidebar programs ---------
// sidebar toggle ----
sidebarToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  profileImage.classList.toggle('enlarge');

  if (projectMenu.classList.contains('show')) {
    projectMenu.classList.remove('show');
  }
});

// sub menu toggle ----
subMenuBtn.addEventListener('click', () => {
  projectMenu.classList.toggle('show');
  projectTitleInput.focus();
});

//! Create new projects programs ----------
const allCancelMethod = [createNewBtn, formBgLayer, cancelBtn, createBtn];
// toggle form when needed
allCancelMethod.forEach((btn) =>
  btn.addEventListener('click', () => {
    formBgLayer.classList.toggle('appear');
  })
);
// assigning default behaviors
createNewBtn.addEventListener('click', () => projectTitleInput.focus());

projectTitleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    projectDescriptionInput.focus();
  }
});

projectDescriptionInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    createBtn.click();
  }
});

form.addEventListener('click', (e) => {
  e.stopPropagation();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
});
//! -------------------------

// Loads all saved projects
function loadAllSavedProjects() {
  savedProjects.forEach((p) => createNewProject(p.id, p.name));
}
loadAllSavedProjects();

// Create project list items
function createNewProject(id, name) {
  const div = document.createElement('div');
  div.classList.add('project-list-item');
  div.classList.add('created');
  div.innerHTML = `<a href="./editor/user.html#${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                      fill="currentColor">
                      <path
                      d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.4487 2 4.00221 2H14.9968L21 8ZM19 9H14V4H5V20H19V9Z">
                      </path>
                    </svg>
                    <span>${name}</span>
                  </a>
                  <svg class="sub-menu-option-btn" xmlns="http://www.w3.org/2000/svg" height="20px"
                    viewBox="0 -960 960 960" width="20px" fill="currentColor">
                    <path
                      d="M263.79-408Q234-408 213-429.21t-21-51Q192-510 213.21-531t51-21Q294-552 315-530.79t21 51Q336-450 314.79-429t-51 21Zm216 0Q450-408 429-429.21t-21-51Q408-510 429.21-531t51-21Q510-552 531-530.79t21 51Q552-450 530.79-429t-51 21Zm216 0Q666-408 645-429.21t-21-51Q624-510 645.21-531t51-21Q726-552 747-530.79t21 51Q768-450 746.79-429t-51 21Z" />
                  </svg>`;
  const projectName = div.querySelector('span')
  const optionBtn = div.querySelector('.sub-menu-option-btn');
  optionBtn.addEventListener('click', () => {
    
  })

  projectList.prepend(div);
}
// save to local storage
function saveToLocalStorage(id, name, des) {
  const newProject = { id, name, des: des };
  savedProjects.push(newProject);
  localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
}
// click to create and save
createBtn.addEventListener('click', () => {
  const id = Date.now();
  const name = projectTitleInput.value.trim() || 'Untitled';
  const des = projectDescriptionInput.value.trim() || '';
  createNewProject(id, name);
  saveToLocalStorage(id, name, des);
  projectTitleInput.value = '';
  projectDescriptionInput.value = '';
});
