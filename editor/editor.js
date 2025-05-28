//! Base functions
document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
});

function stopPropagation(el) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function saveLocalStringify(key, value) {
  localStorage.setItem(`${key}`, JSON.stringify(value));
}
function saveLocalRaw(key, value) {
  localStorage.setItem(`${key}`, value);
}

function indexFinder(arr, id) {
  return arr.findIndex((el) => el.id === Number(id));
}

function setDisplay(el, prop) {
  el.style.display = prop;
}

function setCursor(el, cursor) {
  el.style.cursor = cursor;
}

function copyToClipboard(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  console.log('Copied', text);
}

//! ----------------------------------

//! Load saved data programs
const hash = Number(location.hash.replace('#', ''));
const savedProjects = JSON.parse(localStorage.getItem('all-saved-projects')) || [];
const savedSettings = JSON.parse(localStorage.getItem('settings')) || {
  theme: 'default',
  editor: {
    fontFamily: 'firaCode',
    fontSize: '14',
    tabSize: '2',
    semicolon: 'on',
    quotation: 'double',
    printWidth: '80',
    editorWidth: 350,
    theme: 'default',
  },
};

// load project title
const codeNotFound = document.querySelector('.code-not-found-container');
const currentProject = savedProjects[indexFinder(savedProjects, hash)];

const projectTitleContainer = document.querySelector('.project-title');
if (currentProject) {
  projectTitleContainer.textContent = currentProject.name;
  projectTitleContainer.setAttribute('title', 'Description: ' + savedProjects[indexFinder(savedProjects, hash)].des);
} else {
  checkIfCodeExists();
}

// check if the current file isn't deleted
function checkIfCodeExists() {
  const newProjectsList = JSON.parse(localStorage.getItem('all-saved-projects'));
  const code = newProjectsList[indexFinder(newProjectsList, hash)];
  if (!code) {
    setDisplay(codeNotFound, 'grid');
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkIfCodeExists();
});

const closeMainTabBtn = document.querySelector('.close-main-tab-btn');
closeMainTabBtn.addEventListener('click', () => {
  window.close();
});

// title edit program
const titleEditBtn = document.querySelector('.title-container>button');

titleEditBtn.addEventListener('click', () => {
  projectTitleContainer.setAttribute('contenteditable', 'true');
  projectTitleContainer.focus();
  setCursor(projectTitleContainer, 'text');

  const range = document.createRange();
  range.selectNodeContents(projectTitleContainer);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  setDisplay(titleEditBtn, 'none');

  projectTitleContainer.removeEventListener('blur', titleBlurEvent);
  projectTitleContainer.removeEventListener('keydown', enterToBlur);
  projectTitleContainer.addEventListener('blur', titleBlurEvent);
  projectTitleContainer.addEventListener('keydown', enterToBlur);
});

function titleBlurEvent() {
  this.removeAttribute('contenteditable');
  setCursor(this, 'default');
  setDisplay(this.nextElementSibling, 'grid');

  savedProjects[indexFinder(savedProjects, hash)].name = this.textContent.trim();
  saveLocalStringify('all-saved-projects', savedProjects);
  loadSidebarProject();

  this.removeEventListener('blur', titleBlurEvent);
}

function enterToBlur(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    this.blur();
    this.removeEventListener('keydown', enterToBlur);
  }
}

//! Editor Theme programs
const themeTab = document.querySelector('.theme-tab');
const allThemeChangeBtn = document.querySelectorAll('.theme-change-btn');

function applyTheme(theme) {
  allThemeChangeBtn.forEach((btn) => btn.classList.remove('selected'));
  document.querySelector(`[data-theme-info="${theme}"]`).classList.add('selected');

  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
    savedSettings.editor.theme = theme;
    saveLocalStringify('settings', savedSettings);
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
  savedSettings.editor.theme = theme;
  saveLocalStringify('settings', savedSettings);
}

themeTab.addEventListener('click', (e) => {
  const themeBtn = e.target.closest('.theme-change-btn');
  if (themeBtn) {
    const theme = themeBtn.dataset.themeInfo;
    applyTheme(theme);
  }
  document.querySelector('.customization-container').classList.add('transition-off');
  setTimeout(() => {
    document.querySelector('.customization-container').classList.remove('transition-off');
  }, 50);
});

//! Sidebar programs
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
const beneathLayer = document.querySelector('.beneath-layer');

function reloadTitleAttr() {
  if (!sidebar.classList.contains('show')) {
    sidebarToggleBtn.setAttribute('title', 'Click to open sidebar');
  } else {
    sidebarToggleBtn.setAttribute('title', 'Click to close sidebar');
  }
}
reloadTitleAttr();

function toggleSidebar() {
  if (!sidebar.classList.contains('show')) {
    setDisplay(sidebar, 'block');
    setDisplay(beneathLayer, 'block');
    requestAnimationFrame(() => {
      sidebar.classList.add('show');
      sidebarToggleBtn.classList.add('move');
      reloadTitleAttr();
    });
  } else {
    sidebar.classList.remove('show');
    sidebarToggleBtn.classList.remove('move');
    setDisplay(beneathLayer, 'none');
    setTimeout(() => {
      setDisplay(sidebar, 'none');
      reloadTitleAttr();
    }, 600);
  }
}

sidebarToggleBtn.addEventListener('click', toggleSidebar);
beneathLayer.addEventListener('click', toggleSidebar);

// load project in sidebar
const projectListContainer = document.querySelector('.project-list-container');

function fileSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
  <path d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.45531 3.4487 2 4.00221 2H14.9968L21 8ZM19 9H14V4H5V20H19V9Z">
  </path>
  </svg>`;
}

function loadProjectItem(title, des, id) {
  const div = document.createElement('div');
  div.innerHTML = `
  ${fileSvg()}
  <a href="./user.html#${id}" ${id !== hash ? 'target="_blank"' : ''} title="${des}">
  <span></span>
  ${title}
  </a>`;

  if (id === hash) {
    div.classList.add('current');
  }

  projectListContainer.prepend(div);
}

function loadSidebarProject() {
  projectListContainer.innerHTML = '';
  savedProjects.forEach((obj) => {
    loadProjectItem(obj.name, obj.des, obj.id);
  });
}

loadSidebarProject();

//! ------ Editor Programs -------
const headTagsInput = document.getElementById('head-tags-input');
const htmlInput = document.getElementById('html-input');
const cssInput = document.getElementById('css-input');
const jsInput = document.getElementById('js-input');
const iframe = document.querySelector('iframe');

// All savedCode
const allSavedCode = JSON.parse(localStorage.getItem('allSavedCode')) || [];

// setting up CodeMirror
function loadCodeMirror(mode, value) {
  return {
    mode,
    value,
    keyMap: 'sublime',
    lineNumbers: true,
    tabSize: Number(freshSetting().tabSize),
    addModeClass: true,
    showCursorWhenSelecting: true,
    styleActiveLine: true,
    styleSelectedText: true,
    allowMultipleSelections: true,
    extraKeys: {
      'Ctrl-R': run,
      'Ctrl-D': 'selectNextOccurrence',
      'Ctrl-Space': 'autocomplete',
      'Ctrl-/': 'toggleComment',
      'Shift-Alt-Down': copyLineDown,
      'Shift-Alt-Up': copyLineUp,
      'Alt-Up': moveLineUp,
      'Alt-Down': moveLineDown,
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    foldGutter: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    autoCloseTags: true,
    lineWrapping: true,
    cursorBlinkRate: 0,
  };
}

const codeScrolls = [
  {
    html: `<button id="clickMe">Click me!</button>`,
    css: `button {padding: 10px;font-size: 16px;cursor: pointer;}`,
    js: `document.getElementById('clickMe').onclick = () => {alert('You clicked me!');}`,
  },
  {
    html: `<div class="box">Hover me</div>`,
    css: `.box { width: 100px; height: 100px; background: tomato; transition: 0.3s; }
           .box:hover { transform: scale(1.2); background: gold; }`,
    js: `// CSS handles everything here. Magic box!`,
  },
  {
    html: `<input id="nameInput" placeholder="Type your name" autocomplete="off" />
           <p id="greet"></p>`,
    css: `input { padding: 5px; }
          p { font-weight: bold; margin-top: 10px; }`,
    js: `document.getElementById('nameInput').oninput = (e) => {
            document.getElementById('greet').textContent = "Hello, " + e.target.value + "!";
         };`,
  },
  {
    html: `<div id="colorBox">🎨</div>`,
    css: `#colorBox { width: 100px; height: 100px; background: skyblue; text-align: center; line-height: 100px; cursor: pointer; }`,
    js: `document.getElementById('colorBox').onclick = () => {
            colorBox.style.background = '#' + Math.floor(Math.random()*16777215).toString(16);
         };`,
  },
  {
    html: `<button id="darkMode">Toggle Dark Mode</button>`,
    css: `body.dark { background: #121212; color: white; }
          button { margin-top: 10px; }`,
    js: `document.getElementById('darkMode').onclick = () => {
            document.body.classList.toggle('dark');
         };`,
  },
  {
    html: `<div class="pulse">💓</div>`,
    css: `.pulse {
             max-width: fit-content;
             font-size: 30px;
             animation: pulse 1s infinite;
           }
           @keyframes pulse {
             0%, 100% { transform: scale(1); }
             50% { transform: scale(1.3); }
           }`,
    js: `// Just a CSS heartbeat ❤️`,
  },
  {
    html: `<input id="task" placeholder="Enter task" />
           <ul id="todoList"></ul>`,
    css: `input { padding: 5px; } li { margin-top: 5px; }`,
    js: `const task = document.getElementById('task');
         const list = document.getElementById('todoList');
         task.addEventListener('keydown', e => {
           if (e.key === 'Enter') {
             const li = document.createElement('li');
             li.textContent = task.value;
             list.appendChild(li);
             task.value = '';
           }
         });`,
  },
  {
    html: `<div id="clock"></div>`,
    css: `#clock { font-size: 24px; font-family: monospace; margin-top: 10px; }`,
    js: `setInterval(() => {
            document.getElementById('clock').textContent = new Date().toLocaleTimeString();
         }, 1000);`,
  },
  {
    html: `<button id="spinBtn">Spin!</button>
           <div id="spinner">🌀</div>`,
    css: `#spinner { max-width: fit-content; font-size: 40px; transition: transform 0.3s ease; }
          #spinner.spin { transform: rotate(360deg); }`,
    js: `document.getElementById('spinBtn').onclick = () => {
            const spinner = document.getElementById('spinner');
            spinner.classList.add('spin');
            setTimeout(() => spinner.classList.remove('spin'), 300);
         };`,
  },
  {
    html: `<div id="quoteBox">Click for wisdom 💡</div>`,
    css: `#quoteBox { padding: 20px; border: 2px dashed #aaa; cursor: pointer; }
          #quoteBox:hover { background: #f9f9f9; }`,
    js: `const quotes = [
           "Code is like humor. When you have to explain it, it’s bad.",
           "First, solve the problem. Then, write the code.",
           "Simplicity is the soul of efficiency."
         ];
         document.getElementById('quoteBox').onclick = () => {
           quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
         };`,
  },
];

const randomScroll = codeScrolls[Math.floor(Math.random() * codeScrolls.length)];

function fallBack(type) {
  if (!currentProject) return;

  if (type === 'html') {
    return formatCode(randomScroll.html, 'html');
  }
  if (type === 'css') {
    return formatCode(randomScroll.css, 'css');
  }
  if (type === 'js') {
    return formatCode(randomScroll.js, 'babel');
  }
}

function findCodeType(type) {
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    return allSavedCode[index].code[type];
  } else {
    return fallBack(type);
  }
}

const htmlCodeMirror = CodeMirror(htmlInput, loadCodeMirror('htmlmixed', findCodeType('html')));
const cssCodeMirror = CodeMirror(cssInput, loadCodeMirror('css', findCodeType('css')));
const jsCodeMirror = CodeMirror(jsInput, loadCodeMirror('javascript', findCodeType('js')));

function refreshCodeMirror() {
  htmlCodeMirror.refresh();
  cssCodeMirror.refresh();
  jsCodeMirror.refresh();
}

// getting current code always
function code() {
  return {
    headTags: headTagsInput.value,
    html: htmlCodeMirror.getValue(),
    css: cssCodeMirror.getValue(),
    js: jsCodeMirror.getValue(),
  };
}
// run code with one function
function run() {
  setValueOnIframe(code().headTags, code().html, code().css, code().js);
}

// debounce technique
let codeMirrorRuntimeout;

function codeMirrorCodeRunAndSave() {
  clearTimeout(codeMirrorRuntimeout);
  codeMirrorRuntimeout = setTimeout(run, 1200);
  const localCodeObj = {
    id: hash,
    code: {
      headTags: code().headTags,
      html: code().html,
      css: code().css,
      js: code().js,
    },
  };
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    allSavedCode[index].code.headTags = code().headTags;
    allSavedCode[index].code.html = code().html;
    allSavedCode[index].code.css = code().css;
    allSavedCode[index].code.js = code().js;
  } else {
    allSavedCode.push(localCodeObj);
  }
  saveLocalStringify('allSavedCode', allSavedCode);
}

if (allSavedCode) {
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    headTagsInput.value = formatCode(allSavedCode[index].code.headTags, 'html');
  }
} else {
  headTagsInput.value = '';
}

headTagsInput.addEventListener('input', () => {
  codeMirrorCodeRunAndSave();
  saveLocalStringify('allSavedCode', allSavedCode);
});
const allCodeMirrorEditor = [htmlCodeMirror, cssCodeMirror, jsCodeMirror];
allCodeMirrorEditor.forEach((editor) => {
  editor.on('change', codeMirrorCodeRunAndSave);
});

// set code to iframe
function setValueOnIframe(headTags, html, css, js) {
  const fullHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${currentProject?.name}</title>
      ${headTags}
      <style>${css}</style>
    </head>
    <body>
      ${html}
      <script>${js}<\/script>
    </body>
  </html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  iframe.src = blobUrl;
  iframe.onload = () => URL.revokeObjectURL(blobUrl);
}
setValueOnIframe(code().headTags, code().html, code().css, code().js);

//! Code format
function formatCode(code, parser) {
  const perserType = {
    html: 'html',
    css: 'css',
    babel: 'babel',
  };

  return prettier.format(code, {
    parser: perserType[parser],
    plugins: prettierPlugins,
    tabWidth: Number(savedSettings.editor.tabSize),
    semi: freshSetting().editor.semicolon === 'on',
    singleQuote: freshSetting().editor.quotation === 'single',
    printWidth: Number(freshSetting().editor.printWidth),
  });
}

function applyFormatedCode(parser) {
  if (parser === 'html') {
    htmlCodeMirror.setValue(formatCode(code().html, parser));
  }
  if (parser === 'css') {
    cssCodeMirror.setValue(formatCode(code().css, parser));
  }
  if (parser === 'babel') {
    jsCodeMirror.setValue(formatCode(code().js, parser));
  }
}

document.querySelector('.code-inputs').addEventListener('click', (e) => {
  const formatBtn = e.target.closest('.single-file-format-btn');
  if (formatBtn) {
    applyFormatedCode(formatBtn.dataset.parserType);
    // toastPopup(formatBtn);
  }
});

//! Editor collapse and expand program
const allInputs = document.querySelectorAll('.each-editor');
const expandBtn = document.querySelectorAll('.expand-panel-btn');
expandBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    allInputs.forEach((input) => input.classList.toggle('shrink', !input.contains(btn)));
    allInputs.forEach((input) => input.classList.toggle('expand', input.contains(btn)));
    setDisplay(document.querySelector('.expand-reset-btn'), 'block');
    setTimeout(() => {
      refreshCodeMirror();
    }, 400);
  });
});

document.querySelector('.expand-reset-btn').addEventListener('click', () => {
  allInputs.forEach((input) => input.classList.remove('expand', 'shrink'));
  setDisplay(document.querySelector('.expand-reset-btn'), 'none');
  setTimeout(() => {
    refreshCodeMirror();
  }, 400);
});

//! Resizer programs
const resizeBar = document.querySelector('.horizontal-resizer');
const resizableArea = document.querySelector('.code-inputs');

let isResizing = false;
let clickOffset = null;

resizeBar.addEventListener('mousedown', (e) => {
  document.body.style.userSelect = 'none';
  document.querySelector('iframe').style.pointerEvents = 'none';
  document.querySelector('.code-inputs').style.pointerEvents = 'none';
  isResizing = true;
  clickOffset = e.pageX - e.target.getBoundingClientRect().left;
});

document.addEventListener('mouseup', () => {
  document.body.style.userSelect = 'initial';
  document.querySelector('iframe').style.pointerEvents = 'initial';
  document.querySelector('.code-inputs').style.pointerEvents = 'initial';
  isResizing = false;
  savedSettings.editor.editorWidth = resizableArea.getBoundingClientRect().width;
  saveLocalStringify('settings', savedSettings);
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  resizableArea.style.width = e.pageX - clickOffset + 'px';
});

//touch support
resizeBar.addEventListener('touchstart', (e) => {
  document.body.style.userSelect = 'none';
  document.querySelector('iframe').style.pointerEvents = 'none';
  document.querySelector('.code-inputs').style.pointerEvents = 'none';

  isResizing = true;
  const touch = e.touches[0];
  const barLeft = e.target.getBoundingClientRect().left;
  clickOffset = touch.pageX - barLeft;
});

document.addEventListener('touchmove', (e) => {
  if (!isResizing) return;
  e.preventDefault();
  const touch = e.touches[0];
  resizableArea.style.width = touch.pageX - clickOffset + 'px';
});

document.addEventListener('touchend', () => {
  document.body.style.userSelect = 'initial';
  document.querySelector('iframe').style.pointerEvents = 'initial';
  document.querySelector('.code-inputs').style.pointerEvents = 'initial';
  isResizing = false;
  savedSettings.editor.editorWidth = resizableArea.getBoundingClientRect().width;
  saveLocalStringify('settings', savedSettings);
});

const iframeSizeDisplay = document.querySelector('.iframe-size-display');

let resizerDebounce;
const iframeSizeObserver = new ResizeObserver(() => {
  const rect = iframe.getBoundingClientRect();
  iframeSizeDisplay.innerHTML = `<span class="txt">${Math.round(rect.width)}px</span>
  <span class="close-txt">✕</span>
  <span class="txt">${Math.round(rect.height)}px</span>`;
  iframeSizeDisplay.style.opacity = '0.8';

  clearTimeout(resizerDebounce);
  resizerDebounce = setTimeout(() => {
    iframeSizeDisplay.style.opacity = '0';
  }, 900);
});
iframeSizeObserver.observe(iframe);

//! Console vertical resizer program
// const pageConsole = document.querySelector('.console');
// const consoleResizer = document.querySelector('.console-header');
// let consoleResizing = false;
// let startY;
// let initialHeight;

// document.addEventListener('mouseup', () => {
//   consoleResizing = false;
//   iframe.style.pointerEvents = 'initial';
// });

// consoleResizer.addEventListener('mousedown', (e) => {
//   consoleResizing = true;
//   iframe.style.pointerEvents = 'none';
//   startY = e.clientY;
//   initialHeight = pageConsole.offsetHeight;
// });

// document.addEventListener('mousemove', (e) => {
//   if (!consoleResizing) return;
//   const deltaY = startY - e.clientY;
//   const newHeight = deltaY + initialHeight;

//   pageConsole.style.height = `${newHeight}px`;
// });

//! Nav programs
const customizationModal = document.querySelector('.customization-modal');
const customizationContainer = document.querySelector('.customization-container');
const closeCustomizationModalBtn = document.querySelector('.close-modal-btn');

stopPropagation(customizationContainer);

function toggleCustomizationModal() {
  if (!customizationContainer.classList.contains('slide-up')) {
    setDisplay(customizationModal, 'grid');
    requestAnimationFrame(() => {
      customizationModal.style.opacity = '1';
      customizationContainer.classList.toggle('slide-up');
    });
  } else {
    customizationContainer.classList.toggle('slide-up');
    setTimeout(() => {
      customizationModal.style.opacity = '0';
      setTimeout(() => {
        setDisplay(customizationModal, 'none');
      }, 200);
    }, 100);
  }
}
const customModalBtn = [customizationModal, closeCustomizationModalBtn];
customModalBtn.forEach((btn) => {
  btn.addEventListener('click', toggleCustomizationModal);
});

document.addEventListener('click', (e) => {
  const runBtn = e.target.closest('.run-code-btn');
  const customizeBtn = e.target.closest('.customize-panel-btn');

  if (runBtn) run();
  if (customizeBtn) toggleCustomizationModal();
});

const pickrWrapper = document.querySelector('.pickr-wrapper');
const pickrBtn = document.querySelector('.color-picker-btn');
const pickrActionContainer = document.querySelector('.color-picker-actions');
//! Color picker
const pickr = Pickr.create({
  el: '.pickr-wrapper',
  container: '.color-picker-container',
  theme: 'nano',
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      input: true,
    },
  },
});

function round(v) {
  return Math.round(v);
}

function formattedColor(color) {
  const hexa = color.toHEXA().toString();
  const [h, s, l, a] = color.toHSLA();
  const [r, g, b, A] = color.toRGBA();
  return {
    hexa,
    hsla: `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${a})`,
    rgba: `rgba(${round(r)}, ${round(g)}, ${round(b)}, ${A})`,
  };
}

function colorUpdate(color) {
  document.querySelector('.hexa-color-container').textContent = formattedColor(color).hexa;
  document.querySelector('.hsla-color-container').textContent = formattedColor(color).hsla;
  document.querySelector('.rgba-color-container').textContent = formattedColor(color).rgba;
}

pickrBtn.addEventListener('click', () => {
  pickr.show();
});

pickr.on('show', (color) => {
  pickrActionContainer.style.display = 'grid';
  requestAnimationFrame(() => {
    pickrActionContainer.style.opacity = '1';
  });
  colorUpdate(color);
});

pickr.on('hide', () => {
  pickrActionContainer.style.opacity = '0';
  setTimeout(() => {
    pickrActionContainer.style.display = 'none';
  }, 300);
});

pickr.on('change', (color) => {
  colorUpdate(color);
});

pickrActionContainer.addEventListener('click', (e) => {
  const clrCopyBtn = e.target.closest('.copy-color-btn');
  if (clrCopyBtn) {
    const color = clrCopyBtn.previousElementSibling.textContent;
    copyToClipboard(color);
  }
});

//! Customization panel programs
const infoIcon = document.querySelector('.info-icon');
const infoContainer = document.querySelector('.info-container');

infoIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  setDisplay(infoContainer, 'block');
  setTimeout(() => {
    infoContainer.classList.add('show');
  }, 10);
});
infoIcon.addEventListener('mouseleave', () => {
  setTimeout(() => {
    infoContainer.classList.remove('show');
    setTimeout(() => {
      setDisplay(infoContainer, 'none');
    }, 300);
  }, 300);
});

// tab change buttons
const tabSwitchBtns = document.querySelectorAll('.tab-switch-btn');
const tabs = document.querySelectorAll('.each-tab');

tabSwitchBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((tab) => tab.classList.toggle('show', btn.dataset.tab === tab.dataset.tab));
    tabSwitchBtns.forEach((btn) => btn.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

//! setting programs
const allEditorInput = document.querySelectorAll('.editor-setting-input');
const body = document.body;
// get fresh settings always
function freshSetting() {
  return JSON.parse(localStorage.getItem('settings')) || savedSettings;
}

function refreshEditorContent(type) {
  if (type === 'fontFamily') {
    body.style.setProperty('--user-font', freshSetting().editor[type]);
  }
  if (type === 'fontSize') {
    body.style.setProperty('--user-font-size', `${Number(freshSetting().editor[type]) / 16}rem`);
  }
  if (type === 'tabSize') {
    const newTabSize = Number(freshSetting().editor[type]);
    htmlCodeMirror.setOption('tabSize', newTabSize);
    cssCodeMirror.setOption('tabSize', newTabSize);
    jsCodeMirror.setOption('tabSize', newTabSize);
  }
}

const editorTab = document.querySelector('.editor-tab');
editorTab.addEventListener('change', (e) => {
  const input = e.target.closest('.editor-setting-input');
  if (input) {
    savedSettings.editor[input.id] = input.value;
    saveLocalStringify('settings', savedSettings);
    refreshEditorContent(input.id);
    refreshCodeMirror();
  }
});

allEditorInput.forEach((input) => {
  document.getElementById(input.id).value = savedSettings.editor[input.id];
});

document.addEventListener('DOMContentLoaded', () => {
  allEditorInput.forEach((input) => {
    refreshEditorContent(input.id);
  });
  const isFine = window.matchMedia('(pointer: fine)').matches;
  const editorWidth = freshSetting().editor.editorWidth;

  resizableArea.style.width = `${isFine && editorWidth <= 300 ? 300 : editorWidth}px`;
  applyTheme(freshSetting().editor.theme);
});

//! Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // toggle sidebar
  if (e.ctrlKey && e.key === 'b') {
    sidebarToggleBtn.click();
  }
  // prevent page saving & print
  if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key)) {
    e.preventDefault();
  }
});

// copy lines up/down
function copyLineDown(cm) {
  const pos = cm.getCursor();
  const line = pos.line;
  const content = cm.getLine(line);

  cm.operation(() => {
    cm.replaceRange(content + '\n', { line: line + 1, ch: 0 });
    cm.setCursor({ line: line + 1, ch: pos.ch });
  });
}

function copyLineUp(cm) {
  const pos = cm.getCursor();
  const line = pos.line;
  const content = cm.getLine(line);

  cm.operation(() => {
    cm.replaceRange(content + '\n', { line: line, ch: 0 });
    cm.setCursor({ line: line, ch: pos.ch });
  });
}

// Line move up/down
function moveLineDown(cm) {
  const pos = cm.getCursor();
  const line = pos.line;
  if (line === cm.lineCount() - 1) return;
  const currentLine = cm.getLine(line);
  const belowLine = cm.getLine(line + 1);

  cm.operation(() => {
    cm.replaceRange(belowLine, { line: line, ch: 0 }, { line: line, ch: currentLine.length });
    cm.replaceRange(currentLine, { line: line + 1, ch: 0 }, { line: line + 1, ch: belowLine.length });
    cm.setCursor({ line: line + 1, ch: pos.ch });
  });
}

function moveLineUp(cm) {
  const pos = cm.getCursor();
  const line = pos.line;
  if (line === 0) return;
  const currentLine = cm.getLine(line);
  const aboveLine = cm.getLine(line - 1);

  cm.operation(() => {
    cm.replaceRange(currentLine, { line: line - 1, ch: 0 }, { line: line - 1, ch: aboveLine.length });
    cm.replaceRange(aboveLine, { line: line, ch: 0 }, { line: line, ch: currentLine.length });
    cm.setCursor({ line: line - 1, ch: pos.ch });
  });
}

// Toast message program
const toastMessageContainer = document.querySelector('.toast-message-container');

function toastPopup(btn) {
  const div = document.createElement('div');
  div.innerHTML = `<span class="toast-message">${btn.dataset.toastMessage}</span>`;
  toastMessageContainer.prepend(div);

  requestAnimationFrame(() => {
    div.classList.add('show');
  });

  setTimeout(() => {
    div.classList.remove('show');
  }, 2800);

  setTimeout(() => {
    toastMessageContainer.removeChild(div);
  }, 3200);
}

document.addEventListener('click', (e) => {
  const toastBtn = e.target.closest('[data-toast-message]');
  if (toastBtn) {
    toastPopup(toastBtn);
  }
});
