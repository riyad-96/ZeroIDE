//! Clean localStorage control
const cleanTag = 'clean-v-0.1';
const savedCleanTag = localStorage.getItem('clean-tag');
if (!savedCleanTag || savedCleanTag !== cleanTag) {
  localStorage.clear();
  localStorage.setItem('clean-tag', cleanTag);
}
// Migration system will be added if needed.

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
profileImgModal.querySelector('.img-modal-container').addEventListener('click', (e) => {
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

//! current page finder
function currentPage() {
  const currentPageHash = location.hash.replace('#', '');
  if (currentPageHash) {
    return document.getElementById(currentPageHash);
  } else {
    return document.getElementById('home-page');
  }
}
//! tabindex helper function
function tabIndex(elements, { value, remove = false }) {
  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements);
  } else if (elements instanceof Element) {
    elements = [elements];
  } else if (!elements || typeof elements.forEach !== 'function') {
    console.warn('tabIndex(): Invalid "elements" parameter');
    return;
  }

  const focusableSelectors = 'a, button, input, textarea, [contenteditable="true"], select';

  elements.forEach((el) => {
    const target = [];

    if (el.matches(focusableSelectors)) {
      target.push(el);
    }
    el.querySelectorAll(focusableSelectors).forEach((nested) => target.push(nested));

    target.forEach((node) => {
      if (remove) {
        node.removeAttribute('tabindex');
        console.log('tabindex removed from : ', node);
      } else {
        node.setAttribute('tabindex', value);
        console.log('tabindex added to : ', node);
      }
    });
  });
}

function focusTrap() {
  tabIndex(currentPage(), {
    value: -1,
  });
  tabIndex('.sidebar', {
    value: -1,
  });
  document.body.setAttribute('data-modal-stat', 'active');
}

function focusRelease() {
  tabIndex('.sidebar', {
    remove: true,
  });

  if (sidebarStat() === 'closed') {
    tabIndex('.grid-smooth-height', {
      value: -1,
    });
    tabIndex(subMenuBtn, {
      value: -1,
    });
    tabIndex(currentPage(), {
      remove: true,
    });
  }

  if (!smallScreen()) {
    tabIndex('.sidebar', {
      remove: true,
    });
    tabIndex(currentPage(), {
      remove: true,
    });

    if (sidebarStat() === 'closed') {
      tabIndex('.grid-smooth-height', {
        value: -1,
      });
      tabIndex(subMenuBtn, {
        value: -1,
      });
    }
  }
  document.body.removeAttribute('data-modal-stat');
}

document.addEventListener('click', (e) => {
  const focusTrapBtn = e.target.closest('.focus-trap-activate');
  if (focusTrapBtn) {
    focusTrap();
  }

  const focusTrapReleaseBtn = e.target.closest('.focus-trap-release');
  if (focusTrapReleaseBtn) {
    focusRelease();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.hasAttribute('data-modal-stat')) {
    document.querySelectorAll('.universal-modal-control').forEach((modal) => modal.classList.remove('appear'));
    focusRelease();
  }
});

//! first load welcome note
const firstLoadNote = document.querySelector('.first-load-welcome-note');
const firstLoad = localStorage.getItem('firstLoad');

if (!firstLoad) {
  gsap.from('.note-content>*', {
    opacity: 0,
    x: 500,
    delay: 1,
    stagger: 0.2,
    ease: 'power1.out',
    duration: 1,
  });
}

const mainContainer = document.querySelector('main');
if (!firstLoad) {
  mainContainer.style.opacity = '0';
  mainContainer.style.scale = '0.9';
}

firstLoadNote.style.display = firstLoad ? 'none' : 'grid';

const initiateBtn = document.querySelector('.note-content>button');

initiateBtn.addEventListener('click', () => {
  localStorage.setItem('firstLoad', 'loaded');
  const timeline = gsap.timeline();

  timeline.to('.note-content>*', {
    opacity: 0,
    x: -500,
    delay: 0.1,
    stagger: -0.2,
    duration: 1,
    ease: 'power1.in',
  });
  timeline.to('.first-load-welcome-note', {
    x: '-110%',
    duration: 3,
    ease: 'expo.out',
  });
  setTimeout(() => {
    firstLoadNote.style.display = 'none';
  }, 3000);

  setTimeout(() => {
    mainContainer.style.opacity = '1';
    mainContainer.style.scale = '1';
  }, 1200);

  const date = new Date();
  loadJoinDate(getDateFunc(date));
  localStorage.setItem('join-date', getDateFunc(date));
});

//! main saved projects variable -----
let savedProjects = JSON.parse(localStorage.getItem('all-saved-projects')) || [];
function freshProjectList() {
  return JSON.parse(localStorage.getItem('all-saved-projects')) || [];
}
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
const sidebarBgLayer = document.querySelector('.sidebar-bg-layer');

function smallScreen() {
  return window.matchMedia('(width <= 1000px)').matches;
}
function sidebarStat() {
  return localStorage.getItem('sidebar-stat');
}
if (!sidebarStat()) {
  localStorage.setItem('sidebar-stat', 'closed');
}

function sidebarToggleFunc() {
  const stat = sidebarStat();

  if (stat === 'closed') {
    sidebar.classList.add('show');
    sidebarBgLayer.classList.add('show');
    profileImage.classList.add('enlarge');
    projectMenu.classList.remove('show');
    localStorage.setItem('sidebar-stat', 'open');
    if (smallScreen()) {
      tabIndex(currentPage(), {
        value: -1,
      });
    }
    tabIndex('.grid-smooth-height', {
      remove: true,
    });
    tabIndex(subMenuBtn, {
      remove: true,
    });
  }

  if (stat === 'open') {
    sidebar.classList.remove('show');
    sidebarBgLayer.classList.remove('show');
    profileImage.classList.remove('enlarge');
    projectMenu.classList.remove('show');
    localStorage.setItem('sidebar-stat', 'closed');

    tabIndex(currentPage(), {
      remove: true,
    });
    tabIndex('.grid-smooth-height', {
      value: -1,
    });
    tabIndex(subMenuBtn, {
      value: -1,
    });
  }
}

sidebarToggleBtn.addEventListener('click', sidebarToggleFunc);
sidebarBgLayer.addEventListener('click', sidebarToggleFunc);

// load sidebar stat
window.addEventListener('DOMContentLoaded', () => {
  if (sidebarStat() === 'open') {
    sidebar.classList.add('show');
    sidebarBgLayer.classList.add('show');
    profileImage.classList.add('enlarge');

    if (smallScreen()) {
      requestAnimationFrame(() => {
        tabIndex(currentPage(), {
          value: -1,
        });
        console.log(smallScreen());
      });
    }
  } else {
    tabIndex(subMenuBtn, {
      value: -1,
    });

    tabIndex('.grid-smooth-height', {
      value: -1,
    });
  }
});

// debounce check sidebar state and tabindex.
let debounce;
window.addEventListener('resize', () => {
  clearTimeout(debounce);

  debounce = setTimeout(() => {
    if (document.body.hasAttribute('data-modal-stat')) {
      console.log('handel');
      return;
    }

    if (sidebarStat() === 'open' && smallScreen()) {
      tabIndex(currentPage(), {
        value: -1,
      });
    } else {
      tabIndex(currentPage(), {
        remove: true,
      });
    }
  }, 300);
});

//! sub menu toggle
subMenuBtn.addEventListener('click', () => {
  projectMenu.classList.toggle('show');
});

//! Create new projects programs --------
const allCancelMethod = [formBgLayer, cancelBtn, createBtn, createOpenBtn];
//! toggle form when needed
createNewBtn.addEventListener('click', () => {
  formBgLayer.classList.add('appear');
});

allCancelMethod.forEach((btn) =>
  btn.addEventListener('click', () => {
    formBgLayer.classList.toggle('appear');
    focusRelease();
  })
);

//! delete modal programs
deleteModalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

//! cancel delete
function closeDeleteModal() {
  deleteModal.classList.remove('appear');
  focusRelease();
}
deleteCancelBtn.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', closeDeleteModal);
document.getElementById('dlt-mes-setting-page-link').addEventListener('click', closeDeleteModal);
//! delete single project
let currentId = null;

deleteConfirmBtn.addEventListener('click', () => {
  const itemIndex = savedProjects.findIndex((p) => p.id === Number(currentId));

  if (itemIndex !== -1) {
    savedProjects.splice(itemIndex, 1);
    localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));

    const savedAllCode = JSON.parse(localStorage.getItem('allSavedCode'));
    if (savedAllCode) {
      savedAllCode.splice(itemIndex, 1);
      localStorage.setItem('allSavedCode', JSON.stringify(savedAllCode));
    }

    const allProjectItems = document.querySelectorAll('.project-list-item');

    allProjectItems.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.href.includes(`#${currentId}`)) {
        item.remove();
      }
    });
    closeDeleteModal();
    toastMessagePopup(deleteConfirmBtn);
    loadLastFourProject(savedProjects);
    projectPageProjects();
  }
});

//! assigning default behaviors of createnew project form
createNewBtn.addEventListener('click', () => projectTitleInput.focus());

projectTitleInput.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
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
function loadAllSavedProjects(savedProjects) {
  projectList.innerHTML = '';
  savedProjects.forEach((p) => createNewProject(p.id, p.name));
}
loadAllSavedProjects(savedProjects);

//! Create project list items
function createNewProject(id, name) {
  const div = document.createElement('div');
  div.classList.add('project-list-item');
  div.classList.add('created');
  div.innerHTML = `<a href="./editor/user.html#${id}" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
        fill="currentColor">
        <path
        d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.4487 2 4.00221 2H14.9968L21 8ZM19 9H14V4H5V20H19V9Z">
        </path>
      </svg>
      <span>${name}</span>
    </a>
    <button class="sub-menu-option-btn">
    <svg xmlns="http://www.w3.org/2000/svg" height="20px"
      viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path
        d="M263.79-408Q234-408 213-429.21t-21-51Q192-510 213.21-531t51-21Q294-552 315-530.79t21 51Q336-450 314.79-429t-51 21Zm216 0Q450-408 429-429.21t-21-51Q408-510 429.21-531t51-21Q510-552 531-530.79t21 51Q552-450 530.79-429t-51 21Zm216 0Q666-408 645-429.21t-21-51Q624-510 645.21-531t51-21Q726-552 747-530.79t21 51Q768-450 746.79-429t-51 21Z" />
    </svg>
    </button>
    <div class="sub-menu-options">
      <button aria-label="rename button" title="Rename project">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="currentColor">
          <path
            d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z">
          </path>
        </svg>
      </button>
      <button class="focus-trap-activate" aria-label="delete button" title="Delete project"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
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

    const range = document.createRange();
    range.selectNodeContents(projectName);
    range.collapse(false);
    const select = window.getSelection();
    select.removeAllRanges();
    select.addRange(range);

    projectName.style.outline = '2px solid hsla(0, 0%, 50%, 0.5)';
    projectName.style.cursor = 'text';
    const prevLink = link.href;
    link.removeAttribute('href');
    link.style.cursor = 'default';

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

      const itemIndex = savedProjects.findIndex((p) => p.id === id);
      if (itemIndex !== -1) {
        savedProjects[itemIndex].name = projectName.textContent.trim();
        localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
      }

      setTimeout(() => {
        link.setAttribute('href', prevLink);
        link.style.cursor = 'pointer';
        loadLastFourProject(savedProjects);
        projectPageProjects();
      }, 400);
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

//! save to local storage
function saveToLocalStorage(id, name, des, date, favorite) {
  const newProject = { id, name, des, date, favorite };
  savedProjects.push(newProject);
  localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
}

//! click to create and save || create open and save
function handleProjectCreate(isOpening = false) {
  const id = Date.now();
  const name = projectTitleInput.value.trim() || 'Untitled';
  const des = projectDescriptionInput.value.trim() || 'Empty description';

  createNewProject(id, name);
  saveToLocalStorage(id, name, des, new Date(), false);

  projectTitleInput.value = '';
  projectDescriptionInput.value = '';

  toastMessagePopup(!isOpening ? createBtn : createOpenBtn);
  loadLastFourProject(savedProjects);
  projectPageProjects();

  if (isOpening) {
    document.querySelector('.disable-interactivity-layer').style.display = 'block';
    setTimeout(() => {
      window.open(`./editor/user.html#${id}`, '_blank');
      document.querySelector('.disable-interactivity-layer').style.display = 'none';
    }, 1400);
  }
}

createBtn.addEventListener('click', () => handleProjectCreate(false));
createOpenBtn.addEventListener('click', () => handleProjectCreate(true));

//! All pages navigation programs
const allPrimaryLink = document.querySelectorAll('.primary-menu-link');

function pageChangeUpdate() {
  const pageId = location.hash.replace('#', '');

  // add focused primary link state
  allPrimaryLink.forEach((link) => {
    const hrefHash = link.hash.replace('#', '');
    const isFocused = pageId === hrefHash;
    link.classList.toggle('focused', isFocused);
  });

  // set/remove tabindex
  document.querySelectorAll('.each-page').forEach((page) => {
    if (document.body.hasAttribute('data-modal-stat')) return;
    if (page.id !== pageId) {
      tabIndex(page, {
        value: -1,
      });
    } else if (page.id === pageId && sidebarStat() === 'closed') {
      tabIndex(page, {
        remove: true,
      });
    }
  });

  const page = document.getElementById(pageId);
  if (page) {
    page.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    document.getElementById('home-page').scrollIntoView({ behavior: 'smooth' });
    document.querySelector('.primary-menu-link').classList.add('focused');
  }
}

window.addEventListener('hashchange', pageChangeUpdate);
window.addEventListener('DOMContentLoaded', pageChangeUpdate);

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(pageChangeUpdate, 200);
});

//! ----------- Home page programs -------------
const particleContainer = document.getElementById('particle-container');
const particleCount = 50;

for (let i = 0; i < particleCount; i++) {
  const p = document.createElement('div');
  p.classList.add('particle');

  const size = Math.random() * 5 + 3;

  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.left = `${Math.random() * 100}%`;
  p.style.top = `${Math.random() * 100}%`;
  p.style.opacity = Math.random() * 0.3 + 0.1;
  p.style.animationDuration = `${Math.random() * 15 + 10}s`;
  p.style.animationDelay = `${Math.random() * 10}s`;
  p.style.background = 'var(--particle-bg)';

  particleContainer.appendChild(p);
}

setTimeout(() => {
  particleContainer.style.opacity = '1';
}, 1000);

// Quick launch program
document.querySelector('.quick-launch-btn').addEventListener('click', () => {
  handleProjectCreate(true);
  document.querySelector('.disable-interactivity-layer').style.display = 'block';
  setTimeout(() => {
    document.querySelector('.disable-interactivity-layer').style.display = 'none';
  }, 1400);
});

//! ----------- Profile page programs -------------
//profile picture updation
const savedProfileImg = localStorage.getItem('profile-image');
const allProfileImgDisplay = document.querySelectorAll('.all-profile-image-display');
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

  if (file.size > 2 * 1024 * 1024) {
    alert('Please keep the image file size limited around 2MB(Mega Byte)');
    profileImgInput.value = '';
    return;
  }

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
    toastMessagePopup(downloadImgBtn);
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

// Load page first load date
const firstJoinDate = localStorage.getItem('join-date');
const joinDateContainer = document.querySelector('.first-join-date');

function loadJoinDate(date) {
  joinDateContainer.textContent = date;
}

loadJoinDate(firstJoinDate || 'Date intentionally removed');

// Profile data form updation
const profileEditForm = document.querySelector('.profile-edit-form');
profileEditForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();

    profileEditForm.querySelector('.profile-edit-info-save-btn').click();
  }
});

const savedProfileAboutInfo = JSON.parse(localStorage.getItem('profile-data')) || {};
const profileNameInput = document.getElementById('profile-name');
const profileUsernameInput = document.getElementById('profile-username');
const profileBioInput = document.getElementById('profile-bio');
const profilePronounInput = document.getElementById('pronouns-options');

//Edit related buttons variables
const profileEditBtn = document.querySelector('.profile-edit-button');
const profileCancelBtn = document.querySelector('.profile-edit-info-cancel-btn');
const profileSaveBtn = document.querySelector('.profile-edit-info-save-btn');

//!------------------------------
function styleDisplay(el, value) {
  return (el.style.display = `${value}`);
}
function styleTimeoutDisplay(el, value, time) {
  return setTimeout(() => {
    el.style.display = `${value}`;
  }, time);
}
//!------------------------------

profileEditBtn.addEventListener('click', () => {
  const linkForm = document.querySelector('.social-links-edit-form-container');
  // profileEditForm.style.display = 'unset';
  styleDisplay(profileEditForm, 'unset');
  requestAnimationFrame(() => {
    profileEditForm.classList.add('active');
  });
  if (linkForm.classList.contains('active')) {
    linkForm.classList.remove('active');
    styleTimeoutDisplay(linkForm, 'none', 600);
  }
});

profileCancelBtn.addEventListener('click', () => {
  profileEditForm.classList.remove('active');
  styleTimeoutDisplay(profileEditForm, 'none', 600);
});

// save and load data helper function
const showName = document.querySelector('.show-name');
const showUsername = document.querySelector('.show-username');
const showPronoun = document.querySelector('.show-pronoun');
const profileBio = document.querySelector('.p-bio');

function saveAndLoadProfileInfo() {
  showName.textContent = savedProfileAboutInfo.name || 'name';
  showUsername.textContent = savedProfileAboutInfo.username || 'username';
  showPronoun.textContent = savedProfileAboutInfo.pronoun ? ' · ' + savedProfileAboutInfo.pronoun : '';

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
  const inputId = ['profile-name', 'profile-username', 'profile-bio', 'pronouns-options'];
  inputId.forEach((id) => {
    const input = document.getElementById(id);
    const key = input.dataset.key;

    savedProfileAboutInfo[key] = input.value.trim();
  });

  localStorage.setItem('profile-data', JSON.stringify(savedProfileAboutInfo));
  setTimeout(saveAndLoadProfileInfo, 300);
  profileEditForm.classList.remove('active');
  toastMessagePopup(profileSaveBtn);
  styleTimeoutDisplay(profileEditForm, 'none', 600);
});

// Social links programs
const profileSocialLinkForm = document.querySelector('.social-links-edit-form-container');
document.querySelector('.add-social-link-btn').addEventListener('click', () => {
  styleDisplay(profileSocialLinkForm, 'unset');
  requestAnimationFrame(() => {
    profileSocialLinkForm.classList.add('active');
  });
});

profileSocialLinkForm.addEventListener('click', (e) => {
  if (e.target.classList.contains('link-form-cancel')) {
    profileSocialLinkForm.classList.remove('active');
    styleTimeoutDisplay(profileSocialLinkForm, 'none', 600);
  }
  if (e.target.classList.contains('link-form-save')) {
    saveSocialFormLinks();
    profileSocialLinkForm.classList.remove('active');
    toastMessagePopup(e.target);
    setTimeout(() => {
      showSocialLinks();
    }, 500);
    styleTimeoutDisplay(profileSocialLinkForm, 'none', 600);
  }
});

profileSocialLinkForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    profileSocialLinkForm.querySelector('.link-form-save').click();
  }
});

// All pratforms
const socialPlatforms = [
  {
    name: 'github',
    id: 'github-username',
    label: 'Github username',
    icon: '<i class="fa-brands fa-github"></i>',
    baseUrl: 'https://github.com/',
  },
  {
    name: 'linkedin',
    id: 'linkedin-username',
    label: 'LinkedIn username',
    icon: '<i class="fa-brands fa-linkedin"></i>',
    baseUrl: 'https://linkedin.com/',
  },
  {
    name: 'codepen',
    id: 'codepen-username',
    label: 'Codepen username',
    icon: '<i class="fa-brands fa-codepen"></i>',
    baseUrl: 'https://codepen.io/',
  },
  {
    name: 'instagram',
    id: 'instagram-username',
    label: 'Instagram username',
    icon: '<i class="fa-brands fa-instagram"></i>',
    baseUrl: 'https://instagram.com/',
  },
  {
    name: 'x',
    id: 'x-username',
    label: 'X(Twitter) username',
    icon: '<i class="fa-brands fa-x-twitter"></i>',
    baseUrl: 'https://x.com/',
  },
  {
    name: 'facebook',
    id: 'facebook-username',
    label: 'Facebook username',
    icon: '<i class="fa-brands fa-facebook"></i>',
    baseUrl: 'https://facebook.com/',
  },
];

// generate social input field
const socialLinkForm = document.getElementById('social-links-input-container');

function createSocialInput() {
  socialPlatforms.forEach((platform) => {
    const inputWrapper = document.createElement('div');
    inputWrapper.innerHTML = `
      <label for="${platform.id}">${platform.label}</label>
      <div class="social-link-inputs">
        <div>
          <span>${platform.icon}</span>
          <span>${platform.baseUrl.replace('https://', '')}</span>
        </div>
        <input id="${platform.id}" placeholder="e.g. user-71" autocomplete="off" maxlength="30">
      </div>
    `;
    const usernameData = savedProfileAboutInfo.socialUsernameData || {};
    inputWrapper.querySelector('input').value = usernameData[platform.name] || '';
    socialLinkForm.appendChild(inputWrapper);
  });
}
createSocialInput();

// showing the social links
const socialLinkContainer = document.querySelector('.social-link-display');

function showSocialLinks() {
  socialLinkContainer.innerHTML = '';
  const { socialUsernameData = {} } = savedProfileAboutInfo;

  socialPlatforms.forEach((platform) => {
    const username = socialUsernameData[platform.name] || '';
    if (username) {
      const fullUrl = platform.baseUrl + username;
      const icon = platform.icon;
      const title = platform.label.replace('username', 'profile link');

      const div = document.createElement('div');
      div.classList.add('each-username-link-container');
      div.innerHTML = `
        <a href="${fullUrl}" title="${title}" target="_blank">
          ${icon} <span>${username}</span><span class="profile-url"> - ${fullUrl}</span>
        </a>
        <button data-toast-message="Link Copied !" class="url-copy-btn" title="Copy ${title}" aria-label="Copy link button" data-social-profile-url="${fullUrl}">
          ${clipboardIcon()}
        </button>`;

      socialLinkContainer.appendChild(div);
    }
  });
}
showSocialLinks();

// copy profile link function
function clipboardIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>`;
}

function checkIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path></svg>`;
}

document.querySelector('.social-links').addEventListener('click', (e) => {
  const btn = e.target.closest('.url-copy-btn');
  if (btn && !btn.dataset.copied) {
    const url = btn.dataset.socialProfileUrl;
    const tempInput = document.createElement('textarea');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    btn.innerHTML = checkIcon();
    btn.dataset.copied = 'true';
    setTimeout(() => {
      // btn.innerHTML = `<i class="fa-regular fa-clone"></i>`;
      btn.innerHTML = clipboardIcon();
      delete btn.dataset.copied;
    }, 1500);
  }
});

// save social links to localStorage
function saveSocialFormLinks() {
  const data = {};

  socialPlatforms.forEach((platform) => {
    const input = document.getElementById(`${platform.id}`);
    data[platform.name] = input.value.trim();
  });
  savedProfileAboutInfo.socialUsernameData = data;
  localStorage.setItem('profile-data', JSON.stringify(savedProfileAboutInfo));
}

// Load saved profile data on refresh
window.addEventListener('DOMContentLoaded', () => {
  saveAndLoadProfileInfo();
  profileNameInput.value = savedProfileAboutInfo.name || '';
  profileUsernameInput.value = savedProfileAboutInfo.username || '';
  profileBioInput.value = savedProfileAboutInfo.bio || '';
  profilePronounInput.value = savedProfileAboutInfo.pronoun || '';
});

// ! -------- all confirmation dialogue programs ---------
const toastContainer = document.querySelector('.toast-container');

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-toast-message]');
  if (btn) {
    toastMessagePopup(btn);
  }
});

function toastMessagePopup(btn) {
  const message = btn.dataset.toastMessage;
  const div = document.createElement('div');
  div.innerHTML = `
      <span>${message}</span>
    `;
  toastContainer.prepend(div);

  requestAnimationFrame(() => {
    div.classList.add('active');
  });

  setTimeout(() => {
    div.classList.remove('active');
  }, 2000);

  setTimeout(() => {
    toastContainer.removeChild(div);
  }, 2200);
}

//! Load last 4 project data in profile page.
const recentProjectsContainer = document.querySelector('.recent-projects-container');

function loadLastFourProject(projects) {
  const lastFourProjects = projects.slice(-4) || [];
  recentProjectsContainer.innerHTML = '';

  lastFourProjects.forEach((p) => {
    if (p) {
      const date = getDateFunc(p.date);
      const div = document.createElement('div');
      div.classList.add('each-recent-project');
      div.innerHTML = `
        <div>
          ${bookmarkSvg()}
          <a href="./editor/user.html#${p.id}" target="_blank">${p.name}</a>
        </div>
        <span>${p.des}</span>
        <div>
          <span>created on ${date}</span>
        </div>`;
      recentProjectsContainer.prepend(div);
    }
  });
}
loadLastFourProject(savedProjects);

function bookmarkSvg() {
  return `<svg aria-hidden="true" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z">
            </path>
          </svg>`;
}

function getDateFunc(date) {
  const savedDate = new Date(date);
  return savedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

//! ----------- Settings page programs -------------
// All saved settings
const savedSettings = JSON.parse(localStorage.getItem('settings')) || {
  theme: 'default',
  editor: {
    fontFamily: 'firaCode',
    fontWeight: '400',
    fontSize: '14',
    fontLigatures: 'on',
    tabSize: '2',
    semicolon: 'on',
    quotation: 'double',
    printWidth: '80',
    editorWidth: 350,
    theme: 'default',
  },
};

// Theme programs
const themeBtns = document.querySelectorAll('.themes-btn');
const themeContainer = document.querySelector('.theme-container');
const html = document.documentElement;

function applyTheme(theme) {
  themeBtns.forEach((btn) => {
    btn.classList.remove('active');
    if (btn.dataset.themeInfo === theme) btn.classList.add('active');
  });

  if (theme === 'default') {
    html.removeAttribute('data-theme');
    return;
  }
  html.setAttribute('data-theme', theme);
}

themeContainer.addEventListener('click', (e) => {
  const themeBtn = e.target.closest('.themes-btn');
  if (themeBtn) {
    const theme = themeBtn.dataset.themeInfo;

    setTimeout(() => {
      applyTheme(theme);
      document.body.classList.add('no-transitions');
      setTimeout(() => {
        document.body.classList.remove('no-transitions');
      }, 50);
    }, 50);

    savedSettings.theme = theme;
    localStorage.setItem('settings', JSON.stringify(savedSettings));
  }
});

applyTheme(savedSettings.theme || 'default');

// Setting programs
const editorSettingInputs = document.querySelectorAll('.editor-setting-input');
const editorInputContainer = document.querySelector('.editor-settings-list');

editorInputContainer.addEventListener('change', (e) => {
  const input = e.target.closest('.editor-setting-input');
  if (input) {
    savedSettings.editor[input.id] = input.value;
    localStorage.setItem('settings', JSON.stringify(savedSettings));
  }
});

editorSettingInputs.forEach((input) => {
  document.getElementById(input.id).value = savedSettings.editor[input.id];
});

// All project deletion program
const deleteAllProjectModal = document.querySelector('.delete-all-project-modal');
const deleteAllProjectForm = deleteAllProjectModal.querySelector('form');
const deleteAllProjectInput = document.getElementById('delete-all-project-input');
const deleteAllProjectBtn = document.querySelector('.project-setting button');
const deleteAllProjectErrorMessage = deleteAllProjectModal.querySelector('.error-message');

deleteAllProjectBtn.addEventListener('click', () => {
  deleteAllProjectModal.classList.add('appear');
  setTimeout(() => {
    deleteAllProjectInput.focus();
  }, 100);
});

function removeDeleteAllProjectErrState() {
  deleteAllProjectModal.classList.remove('appear');
  deleteAllProjectInput.classList.remove('error');
  deleteAllProjectInput.removeEventListener('input', checkDltAllProjectInput);
  deleteAllProjectInput.value = '';
  deleteAllProjectErrorMessage.innerHTML = '';
}

deleteAllProjectModal.addEventListener('click', () => {
  removeDeleteAllProjectErrState();
});

function errSvg() {
  return `<svg height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16">
  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
    d="M5.30761 1.5L1.5 5.30761L1.5 10.6924L5.30761 14.5H10.6924L14.5 10.6924V5.30761L10.6924 1.5H5.30761ZM5.10051 0C4.83529 0 4.58094 0.105357 4.3934 0.292893L0.292893 4.3934C0.105357 4.58094 0 4.83529 0 5.10051V10.8995C0 11.1647 0.105357 11.4191 0.292894 11.6066L4.3934 15.7071C4.58094 15.8946 4.83529 16 5.10051 16H10.8995C11.1647 16 11.4191 15.8946 11.6066 15.7071L15.7071 11.6066C15.8946 11.4191 16 11.1647 16 10.8995V5.10051C16 4.83529 15.8946 4.58093 15.7071 4.3934L11.6066 0.292893C11.4191 0.105357 11.1647 0 10.8995 0H5.10051ZM8.75 3.75V4.5V8L8.75 8.75H7.25V8V4.5V3.75H8.75ZM8 12C8.55229 12 9 11.5523 9 11C9 10.4477 8.55229 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z"></path>
</svg>`;
}

function showErrMessage(message) {
  deleteAllProjectErrorMessage.innerHTML = `${errSvg()} <span>${message}</span>`;
}

function checkDltAllProjectInput() {
  if (deleteAllProjectInput.value.trim() === '') {
    deleteAllProjectInput.classList.add('error');
    showErrMessage('The verification text is required');
    return;
  }
  if (deleteAllProjectInput.value.trim() !== 'delete all projects') {
    deleteAllProjectInput.classList.add('error');
    showErrMessage('The verification text does not match');
  } else {
    deleteAllProjectInput.classList.remove('error');
    deleteAllProjectErrorMessage.innerHTML = '';
  }
}

deleteAllProjectForm.addEventListener('click', (e) => {
  const cancelBtn = e.target.closest('.cancel-all-project-delete-btn');
  if (cancelBtn) {
    removeDeleteAllProjectErrState();
  }

  const confirmBtn = e.target.closest('.confirm-all-project-delete-btn');
  if (confirmBtn) {
    if (deleteAllProjectInput.value.trim() !== 'delete all projects') {
      deleteAllProjectInput.addEventListener('input', checkDltAllProjectInput);
      checkDltAllProjectInput();
      deleteAllProjectInput.focus();
    } else {
      localStorage.removeItem('all-saved-projects');
      document.querySelector('.disable-interactivity-layer').style.display = 'block';
      toastMessagePopup(confirmBtn);
      deleteAllProjectModal.click();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
});

//! ----------- Project page programs -----------
const projectPageHeader = document.querySelector('.project-page-header');

// project page header button programs
projectPageHeader.addEventListener('click', (e) => {
  const startNewBtn = e.target.closest('.start-new-project-btn');
  if (startNewBtn) {
    formBgLayer.classList.add('appear');
    formBgLayer.querySelector('input').focus();
  }
});

function heartLineSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853ZM18.827 6.1701C17.3279 4.66794 14.9076 4.60701 13.337 6.01687L12.0019 7.21524L10.6661 6.01781C9.09098 4.60597 6.67506 4.66808 5.17157 6.17157C3.68183 7.66131 3.60704 10.0473 4.97993 11.6232L11.9999 18.6543L19.0201 11.6232C20.3935 10.0467 20.319 7.66525 18.827 6.1701Z"></path></svg>`;
}
function heartFillSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#e62037"><path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z"></path></svg>`;
}
function moreOptSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5.32943 3.27158C6.56252 2.8332 7.9923 3.10749 8.97927 4.09446C10.1002 5.21537 10.3019 6.90741 9.5843 8.23385L20.293 18.9437L18.8788 20.3579L8.16982 9.64875C6.84325 10.3669 5.15069 10.1654 4.02952 9.04421C3.04227 8.05696 2.7681 6.62665 3.20701 5.39332L5.44373 7.63C6.02952 8.21578 6.97927 8.21578 7.56505 7.63C8.15084 7.04421 8.15084 6.09446 7.56505 5.50868L5.32943 3.27158ZM15.6968 5.15512L18.8788 3.38736L20.293 4.80157L18.5252 7.98355L16.7574 8.3371L14.6361 10.4584L13.2219 9.04421L15.3432 6.92289L15.6968 5.15512ZM8.97927 13.2868L10.3935 14.7011L5.09018 20.0044C4.69966 20.3949 4.06649 20.3949 3.67597 20.0044C3.31334 19.6417 3.28744 19.0699 3.59826 18.6774L3.67597 18.5902L8.97927 13.2868Z"></path></svg>`;
}

function indexFinder(arr, id) {
  return arr.findIndex((el) => el.id === Number(id));
}

const projectPageProjectContainer = document.querySelector('.project-page-project-container');
const projectEditFormModal = document.querySelector('.edit-project-form-modal');
const title = projectEditFormModal.querySelector('form input');
const description = projectEditFormModal.querySelector('form textarea');

const inputArr = [title, description];
inputArr.forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      projectEditFormModal.querySelector('form button:last-of-type').click();
    }
  });
});

//! load projects in projects page

function createProjectPageProjects(arr) {
  arr.forEach((p) => {
    const div = document.createElement('div');
    div.classList.add('each-project');
    div.innerHTML = `
      <header class="project-header">
        <a href="./editor/user.html#${p.id}" target="_blank">${p.name}</a>
        <button title="Click to edit project" data-project-id="${p.id}" class="edit-projects-button focus-trap-activate">${moreOptSvg()}</button>
      </header>
      <span class="project-page-project-description">
        ${p.des}
      </span>
      <footer>
        <button data-project-id="${p.id}" class="add-favorite-btn" title="click to add/remove favorite">${p.favorite ? heartFillSvg() : heartLineSvg()}</button>
        <span>created on ${getDateFunc(p.date)}</span>
      </footer>
    `;
    projectPageProjectContainer.prepend(div);
  });
}

function projectPageProjects(tab) {
  projectPageProjectContainer.innerHTML = '';
  if (tab === 'favorite') {
    createProjectPageProjects(savedProjects.filter((p) => p.favorite === true));
    return;
  }
  createProjectPageProjects(savedProjects);
}

projectPageProjects();

// tab changing program
const tabChangeProjectBtn = document.querySelectorAll('.tab-change-project-btn');

tabChangeProjectBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    const dataTab = btn.dataset.projectTab;
    projectPageProjects(dataTab);
    tabChangeProjectBtn.forEach((btn) => btn.classList.remove('active-tab'));
    btn.classList.add('active-tab');
  });
});

//! open project settings
projectPageProjectContainer.addEventListener('click', (e) => {
  //setting btn
  const settingBtn = e.target.closest('.edit-projects-button');
  if (settingBtn) {
    const id = settingBtn.dataset.projectId;
    const index = indexFinder(freshProjectList(), id);

    projectEditFormModal.classList.add('appear');
    const titleInput = projectEditFormModal.querySelector('input');
    const desInput = projectEditFormModal.querySelector('textarea');
    titleInput.value = freshProjectList()[index].name === 'Untitled' ? '' : freshProjectList()[index].name;
    desInput.value = freshProjectList()[index].des === 'Empty description' ? '' : freshProjectList()[index].des;
    currentId = id;
    titleInput.focus();
  }

  // favorite btn
  const favoriteBtn = e.target.closest('.add-favorite-btn');
  if (favoriteBtn) {
    const id = favoriteBtn.dataset.projectId;
    const index = indexFinder(freshProjectList(), id);
    if (!freshProjectList()[index].favorite) {
      favoriteBtn.innerHTML = '';
      favoriteBtn.innerHTML = heartFillSvg();
      savedProjects[index].favorite = true;
      localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
    } else {
      favoriteBtn.innerHTML = '';
      favoriteBtn.innerHTML = heartLineSvg();
      savedProjects[index].favorite = false;
      localStorage.setItem('all-saved-projects', JSON.stringify(savedProjects));
    }
  }
});

projectEditFormModal.querySelector('form').addEventListener('click', (e) => {
  // cancel btn program
  const cancelBtn = e.target.closest('.project-edit-form-cancel-btn');
  if (cancelBtn) {
    projectEditFormModal.classList.remove('appear');
    focusRelease();
  }

  //delete btn program
  const deleteBtn = e.target.closest('.project-edit-form-delete-btn');
  if (deleteBtn) {
    projectEditFormModal.classList.remove('appear');
    deleteModal.classList.toggle('appear');
    dltModCurrTitle.textContent = freshProjectList()[indexFinder(savedProjects, currentId)].name;
  }

  // save btn program
  const saveBtn = e.target.closest('.project-edit-form-save-btn');
  if (saveBtn) {
    const freshProject = freshProjectList();
    const index = indexFinder(freshProject, currentId);
    freshProject[index].name = title.value.trim() || 'Untitled';
    freshProject[index].des = description.value.trim() || 'Empty description';
    projectEditFormModal.classList.remove('appear');
    localStorage.setItem('all-saved-projects', JSON.stringify(freshProject));
    setTimeout(() => {
      refreshPageContent(freshProject);
    }, 600);
    focusRelease();
  }
});

projectEditFormModal.addEventListener('click', () => {
  projectEditFormModal.classList.remove('appear');
  focusRelease();
});

//! Page content updation according to changes on editor page.
function refreshPageContent(projects) {
  savedProjects = projects;
  loadAllSavedProjects(projects);
  loadLastFourProject(projects);
  projectPageProjects();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const newProjectList = JSON.parse(localStorage.getItem('all-saved-projects')) || [];
    // if (newProjectList.length !== savedProjects.length) {
    //   window.location.reload();
    // }

    const projectDeleted = newProjectList.length !== savedProjects.length;
    const nameChanged = savedProjects.some((obj, index) => obj.name !== newProjectList[index]?.name);
    if (nameChanged || projectDeleted) {
      refreshPageContent(newProjectList);
    }
  }
});

document.querySelectorAll('div').forEach(div => div.setAttribute('tabindex', '-1'))