const allFormInDOM = document.querySelectorAll('form');
allFormInDOM.forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  form.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

//! ----- Variables -----
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');

// profile image related variables
const profileImage = document.querySelector('.profile-image');
const profileImgModal = document.querySelector('.profile-img-modal');
profileImgModal
  .querySelector('.img-modal-container')
  .addEventListener('click', (e) => {
    e.stopPropagation();
  });
const closeImgBtn = document.querySelector('.close-img-btn');

// menu toggle related variables
const projectMenu = document.querySelector('.project-menu');
const subMenuBtn = document.querySelector('.sub-menu-btn');

// create new project related variables
const formBgLayer = document.querySelector('.form-background-layer');
const cancelBtn = document.querySelector('.cancel-btn');
const createBtn = document.querySelector('.create-btn');
const createOpenBtn = document.querySelector('.create-open-btn');

const createNewBtn = document.querySelector('.create-new-project-btn');

//! main saved projects variable -----
const savedProjects =
  JSON.parse(localStorage.getItem('all-saved-projects')) || [];
//! -----
const projectList = document.querySelector('.project-list');
const projectTitleInput = document.getElementById('project-title');
const projectDescriptionInput = document.getElementById('project-description');

// project delete related variables
const deleteModal = document.querySelector('.delete-confirmation-modal');
const deleteModalContent = document.querySelector('.delete-modal-content');
const deleteCancelBtn = document.querySelector('.dlt-cancel-btn');
const deleteConfirmBtn = document.querySelector('.dlt-confirm-btn');
const dltModCurrTitle = document.querySelector('.delete-messages p span');

//! profile image prgrams -----
const sidebarImgDiv = document.querySelector('.display-profile-img');
const imgInput = document.getElementById('imgInput');
const imgModArr = [profileImgModal, sidebarImgDiv, closeImgBtn];

function toggleImgModal() {
  profileImgModal.classList.toggle('appear');
}
imgModArr.forEach((element) => {
  element.addEventListener('click', toggleImgModal);
});

//! sidebar programs ------
//! sidebar toggle
const sideBarStat = localStorage.getItem('sidebar-stat');

sidebarToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  profileImage.classList.toggle('enlarge');

  if (projectMenu.classList.contains('show')) {
    projectMenu.classList.remove('show');
  }
  if (sidebar.classList.contains('show')) {
    localStorage.setItem('sidebar-stat', 'open');
  } else {
    localStorage.removeItem('sidebar-stat');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (sideBarStat) {
    sidebar.classList.add('show');
    profileImage.classList.add('enlarge');
  }
});

//! sub menu toggle
subMenuBtn.addEventListener('click', () => {
  projectMenu.classList.toggle('show');
  projectTitleInput.focus();
});

//! Create new projects programs
const allCancelMethod = [createNewBtn, formBgLayer, cancelBtn, createBtn];
//! toggle form when needed
allCancelMethod.forEach((btn) =>
  btn.addEventListener('click', () => {
    formBgLayer.classList.toggle('appear');
  })
);

//! delete modal programs
deleteModalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

//! cancel delete
function closeDeleteModal() {
  deleteModal.classList.toggle('appear');
}
deleteCancelBtn.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', closeDeleteModal);

//! delete single project
let currentId = null;
deleteConfirmBtn.addEventListener('click', () => {
  const itemIndex = savedProjects.findIndex((p) => p.id === currentId);
  if (itemIndex !== -1) {
    savedProjects.splice(itemIndex, 1);
    localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
    const allProjectItems = document.querySelectorAll('.project-list-item');
    allProjectItems.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.href.includes(`#${currentId}`)) {
        item.remove();
      }
    });
  }
  closeDeleteModal();
});

//! assigning default behaviors of createnew project form
createNewBtn.addEventListener('click', () => projectTitleInput.focus());

projectTitleInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey & (e.key === 'Enter')) {
    e.preventDefault();
    createBtn.click();
  }
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
//! -------------------------

//! Loads all saved projects
function loadAllSavedProjects() {
  savedProjects.forEach((p) => createNewProject(p.id, p.name));
}
loadAllSavedProjects();

//! Create project list items
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
                  </svg>
                  <div class="sub-menu-options">
                    <button aria-label="rename button" title="Rename project">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                        fill="currentColor">
                        <path
                          d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z">
                        </path>
                      </svg>
                    </button>
                    <button aria-label="delete button" title="Delete project"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                        fill="currentColor">
                        <path
                          d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z">
                        </path>
                      </svg></button>
                  </div>`;
  //! options button functionality
  const options = div.querySelector('.sub-menu-options');
  const optionBtn = div.querySelector('.sub-menu-option-btn');
  optionBtn.addEventListener('click', () => {
    options.classList.toggle('show');
  });
  function removeOptions() {
    setTimeout(() => {
      options.classList.remove('show');
    }, 50);
  }
  options.addEventListener('mouseleave', removeOptions);
  div.addEventListener('mouseleave', removeOptions);

  //! Rename project
  const renameBtn = options.querySelector('button:first-of-type');
  const projectName = div.querySelector('span');
  const link = div.querySelector('a');

  renameBtn.addEventListener('click', () => {
    projectName.setAttribute('contenteditable', 'true');
    projectName.focus();
    projectName.style.outline = '2px solid rgba(124, 124, 124, 0.486)';
    projectName.style.cursor = 'text';
    const prevLink = link.href;
    link.removeAttribute('href');

    projectName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        projectName.blur();
      }
    });

    projectName.addEventListener('blur', () => {
      projectName.removeAttribute('contenteditable');
      projectName.style.outline = 'none';
      projectName.style.cursor = 'inherit';
      link.setAttribute('href', prevLink);

      const itemIndex = savedProjects.findIndex((p) => p.id === id);
      if (itemIndex !== -1) {
        savedProjects[itemIndex].name = projectName.textContent.trim();
        localStorage.setItem(
          'all-saved-projects',
          JSON.stringify(savedProjects)
        );
      }
    });
  });

  //! delete projects
  const deleteBtn = options.querySelector('button:last-of-type');
  deleteBtn.addEventListener('click', () => {
    deleteModal.classList.toggle('appear');
    dltModCurrTitle.textContent = projectName.textContent;
    currentId = id;
  });

  projectList.prepend(div);
}

//! delete projects
// function deleteSingleProject() {
// }

//! save to local storage
function saveToLocalStorage(id, name, des) {
  const newProject = { id, name, des: des };
  savedProjects.push(newProject);
  localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
}
//! click to create and save
createBtn.addEventListener('click', () => {
  const id = Date.now();
  const name = projectTitleInput.value.trim() || 'Untitled';
  const des = projectDescriptionInput.value.trim() || '';
  createNewProject(id, name);
  saveToLocalStorage(id, name, des);
  projectTitleInput.value = '';
  projectDescriptionInput.value = '';
});

//! All pages navigation programs
const allPrimaryLink = document.querySelectorAll('.primary-menu-link');

function pageChangeUpdate() {
  const hash = location.hash.replace('#', '');

  allPrimaryLink.forEach((link) => {
    const hrefHash = link.hash.replace('#', '');
    const isFocused = hash === hrefHash;
    link.classList.toggle('focused', isFocused);
  });

  const page = document.getElementById(hash);
  if (page) {
    page.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    document.getElementById('home-page').scrollIntoView({ behavior: 'smooth' });
    document.querySelector('.primary-menu-link').classList.add('focused');
  }
}

window.addEventListener('hashchange', pageChangeUpdate);
window.addEventListener('DOMContentLoaded', pageChangeUpdate);

//! Profile page updation programs
//profile picture updation
const savedProfileImg = localStorage.getItem('profile-image');
const allProfileImgDisplay = document.querySelectorAll(
  '.all-profile-image-display'
);
const profileImgInput = document.getElementById('profile-img-input');
const profileImg = document.querySelector('.p-image');
const previewImgContainer = document.querySelector('.img-container');
const imgBtnContainer = document.querySelector('.img-buttons');

profileImg.addEventListener('click', () => {
  profileImgModal.classList.toggle('appear');
});
document.querySelector('.change-img-btn').addEventListener('click', () => {
  profileImgInput.click();
});
// select profile picture
profileImgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.addEventListener('load', () => {
    const imgFile = reader.result;
    previewImgContainer.innerHTML = '';
    const image = document.createElement('img');
    image.src = imgFile;

    const button = document.createElement('button');
    button.classList.add('save-img-btn');
    button.textContent = 'Save';

    const oldSaveBtn = imgBtnContainer.querySelector('.save-img-btn');
    if (oldSaveBtn) {
      oldSaveBtn.remove();
    }

    imgBtnContainer.appendChild(button);
    previewImgContainer.appendChild(image);
    saveNewProfileImage(button, imgFile);
  });
});

function saveNewProfileImage(saveBtn, img) {
  saveBtn.addEventListener('click', () => {
    localStorage.removeItem('profile-image');
    localStorage.setItem('profile-image', img);
    saveBtn.remove();
    setTimeout(() => {
      location.reload();
    }, 300);
  });
}

// load profile image in all field
window.addEventListener('DOMContentLoaded', () => {
  if (savedProfileImg) {
    allProfileImgDisplay.forEach((container) => {
      container.innerHTML = '';
      const img = document.createElement('img');
      img.src = savedProfileImg;
      container.appendChild(img);
    });
  } else {
    allProfileImgDisplay.forEach((container) => {
      container.innerHTML = vectorProfileSvg();
    });
  }
});

//all image preview button action programs
const downloadImgBtn = document.querySelector('.download-img-btn');

downloadImgBtn.addEventListener('click', () => {
  const savedImg = localStorage.getItem('profile-image');

  if (savedImg) {
    const a = document.createElement('a');
    a.href = savedImg;
    a.download = 'profile-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

function vectorProfileSvg() {
  return `<svg fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 45.53 45.53" xml:space="preserve" stroke="#1111111">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <path
                  d="M22.766,0.001C10.194,0.001,0,10.193,0,22.766s10.193,22.765,22.766,22.765c12.574,0,22.766-10.192,22.766-22.765 S35.34,0.001,22.766,0.001z M22.766,6.808c4.16,0,7.531,3.372,7.531,7.53c0,4.159-3.371,7.53-7.531,7.53 c-4.158,0-7.529-3.371-7.529-7.53C15.237,10.18,18.608,6.808,22.766,6.808z M22.761,39.579c-4.149,0-7.949-1.511-10.88-4.012 c-0.714-0.609-1.126-1.502-1.126-2.439c0-4.217,3.413-7.592,7.631-7.592h8.762c4.219,0,7.619,3.375,7.619,7.592 c0,0.938-0.41,1.829-1.125,2.438C30.712,38.068,26.911,39.579,22.761,39.579z">
                </path>
              </g>
            </g>
          </svg>`;
}

// Profile data form updation
const profileEditForm = document.querySelector('.profile-edit-form');
const savedProfileAboutInfo =
  JSON.parse(localStorage.getItem('profile-data')) || {};
const profileNameInput = document.getElementById('profile-name');
const profileUsernameInput = document.getElementById('profile-username');
const profileBioInput = document.getElementById('profile-bio');
const profilePronounInput = document.getElementById('pronouns-options');

//Edit related buttons variables
const profileEditBtn = document.querySelector('.profile-edit-button');
const profileCancelBtn = document.querySelector(
  '.profile-edit-info-cancel-btn'
);
const profileSaveBtn = document.querySelector('.profile-edit-info-save-btn');

profileEditBtn.addEventListener('click', () => {
  profileEditForm.classList.add('active');
});

profileCancelBtn.addEventListener('click', () => {
  profileEditForm.classList.remove('active');
});
// save and load data helper function
const showName = document.querySelector('.show-name');
const showUsername = document.querySelector('.show-username');
const showPronoun = document.querySelector('.show-pronoun');
const profileBio = document.querySelector('.p-bio');

function saveAndLoadProfileInfo() {
  showName.textContent = savedProfileAboutInfo.name || 'name';
  showUsername.textContent = savedProfileAboutInfo.username || 'username';
  showPronoun.textContent = savedProfileAboutInfo.pronoun
    ? ' · ' + savedProfileAboutInfo.pronoun
    : '';

  if (savedProfileAboutInfo.bio) {
    profileBio.innerHTML = '';
    profileBio.style.marginBlockStart = '1rem';
    const showBio = document.createElement('span');
    showBio.textContent = savedProfileAboutInfo.bio;
    profileBio.appendChild(showBio);
  } else {
    profileBio.innerHTML = '';
    profileBio.style.marginBlockStart = '0';
  }
}

// save profile info
profileSaveBtn.addEventListener('click', () => {
  const inputId = [
    'profile-name',
    'profile-username',
    'profile-bio',
    'pronouns-options',
  ];
  inputId.forEach((id) => {
    const input = document.getElementById(id);
    const key = input.dataset.key;

    savedProfileAboutInfo[key] = input.value.trim();
    console.log(savedProfileAboutInfo);
  });

  localStorage.setItem('profile-data', JSON.stringify(savedProfileAboutInfo));
  setTimeout(saveAndLoadProfileInfo, 300);
  profileEditForm.classList.remove('active');
});

// Load saved profile data on refresh
window.addEventListener('DOMContentLoaded', () => {
  saveAndLoadProfileInfo();
  profileNameInput.value = savedProfileAboutInfo.name || '';
  profileUsernameInput.value = savedProfileAboutInfo.username || '';
  profileBioInput.value = savedProfileAboutInfo.bio || '';
  profilePronounInput.value = savedProfileAboutInfo.pronoun || '';
});
