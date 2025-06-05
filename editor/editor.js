//! LocalStorage version/Migration control system
// 2 Jun 2025
function migrateTo_v0_0_1() {
  const settingsObj = JSON.parse(localStorage.getItem('settings'));
  if (settingsObj) {
    settingsObj.editor.expandPanel = 'on';
    localStorage.setItem('settings', JSON.stringify(settingsObj));
  }
}
// 5 Jun 2025
function migrateTo_v0_0_2() {
  const savedCode = JSON.parse(localStorage.getItem('allSavedCode'));
  if (savedCode) {
    savedCode.forEach((obj) => {
      obj.code.headTags = [];
    });
    localStorage.setItem('allSavedCode', JSON.stringify(savedCode));
  }
}

// ----------
const previousVersion = 'v0.0.1';
const currentVersion = 'v0.0.2';
const savedVersion = localStorage.getItem('version');

if (!currentVersion || savedVersion !== currentVersion) {
  // Resets
  //2 Jun 2025
  localStorage.removeItem('clean-tag');
  // ----------

  //2 Jun 2025
  migrateTo_v0_0_1();

  // 5 Jun 2025
  if (savedVersion !== currentVersion) {
    migrateTo_v0_0_2();
  }

  localStorage.setItem('version', currentVersion);
}
//! ---------------------------------------------------
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
}

//! ----------------------------------

//! Load saved data programs
const hash = Number(location.hash.replace('#', ''));
let savedProjects = JSON.parse(localStorage.getItem('all-saved-projects')) || [];

function freshProjectList() {
  return JSON.parse(localStorage.getItem('all-saved-projects')) || [];
}

const savedSettings = JSON.parse(localStorage.getItem('settings')) || {
  theme: 'default',
  editor: {
    fontFamily: 'firaCode',
    fontWeight: '400',
    fontSize: '14',
    fontLigatures: 'on',
    tabSize: '2',
    autoRun: 'afterDelay',
    expandPanel: 'off',
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
    setMinusTabIndex(codeNotFound.querySelector('button'));
  }
}

function setMinusTabIndex(...excludeList) {
  document.querySelectorAll('button, input, textarea, select').forEach((el) => el.setAttribute('tabindex', '-1'));
  excludeList.forEach((el) => el.removeAttribute('tabindex'));
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkIfCodeExists();
  const newFreshProjectList = JSON.parse(localStorage.getItem('all-saved-projects'));
  if (newFreshProjectList) {
    const index = indexFinder(newFreshProjectList, hash);
    const newTitle = index !== -1 ? newFreshProjectList[index].name : projectTitleContainer.textContent;
    projectTitleContainer.textContent = newTitle;
    loadSidebarProject(newFreshProjectList);
  }
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

  const freshSavedProjects = JSON.parse(localStorage.getItem('all-saved-projects'));
  freshSavedProjects[indexFinder(freshSavedProjects, hash)].name = this.textContent.trim();
  saveLocalStringify('all-saved-projects', freshSavedProjects);
  loadSidebarProject(freshSavedProjects);

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
  allThemeChangeBtn.forEach((btn) => btn.classList.toggle('selected', btn.dataset.themeInfo === theme));

  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}

function saveTheme(theme) {
  savedSettings.editor.theme = theme;
  saveLocalStringify('settings', savedSettings);
}

themeTab.addEventListener('click', (e) => {
  const themeBtn = e.target.closest('.theme-change-btn');
  if (themeBtn) {
    const theme = themeBtn.dataset.themeInfo;
    applyTheme(theme);
    document.querySelector('.customization-container').classList.add('transition-off');
    setTimeout(() => {
      document.querySelector('.customization-container').classList.remove('transition-off');
    }, 50);
    saveTheme(theme);
  }
});

applyTheme(savedSettings.editor.theme);

//! Sidebar programs
const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
const beneathLayer = document.querySelector('.beneath-layer');

function reloadTitleAttr() {
  if (!sidebar.classList.contains('show')) {
    sidebarToggleBtn.setAttribute('title', 'Open sidebar');
  } else {
    sidebarToggleBtn.setAttribute('title', 'Close sidebar');
  }
}
reloadTitleAttr();

function toggleSidebar() {
  sidebar.classList.toggle('show', !sidebar.classList.contains('show'));
  sidebarToggleBtn.classList.toggle('show', !sidebarToggleBtn.classList.contains('show'));
  beneathLayer.classList.toggle('show', !beneathLayer.classList.contains('show'));
  reloadTitleAttr();
}

document.addEventListener('click', (e) => {
  const sidebarBtn = e.target.closest('.sidebar-toggle-btn');
  const sidebarLayer = e.target.closest('.beneath-layer');
  if (sidebarBtn) {
    toggleSidebar();
  }
  if (sidebarLayer) {
    toggleSidebar();
  }
});

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

function loadSidebarProject(projects) {
  document.querySelector('.project-list-container').innerHTML = '';
  projects.forEach((obj) => {
    loadProjectItem(obj.name, obj.des, obj.id);
  });
}

loadSidebarProject(savedProjects);

//! ------ Editor Programs -------
// const headTagsInput = document.getElementById('head-tags-input');
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
      'Ctrl-S': run,
      'Ctrl-D': 'selectNextOccurrence',
      'Ctrl-Space': 'autocomplete',
      'Ctrl-/': 'toggleComment',
      'Ctrl-J': () => focusOnEditor('html'),
      'Ctrl-K': () => focusOnEditor('css'),
      'Ctrl-L': () => focusOnEditor('js'),
      'Ctrl-1': () => focusOnEditor('html'),
      'Ctrl-2': () => focusOnEditor('css'),
      'Ctrl-3': () => focusOnEditor('js'),
      'Ctrl-Alt-R': () => resetExpandState(),
      'Cmd-R': run,
      'Cmd-S': run,
      'Cmd-D': 'selectNextOccurrence',
      'Cmd-Space': 'autocomplete',
      'Cmd-/': 'toggleComment',
      'Cmd-J': () => focusOnEditor('html'),
      'Cmd-K': () => focusOnEditor('css'),
      'Cmd-L': () => focusOnEditor('js'),
      'Cmd-1': () => focusOnEditor('html'),
      'Cmd-2': () => focusOnEditor('css'),
      'Cmd-3': () => focusOnEditor('js'),
      'Cmd-Alt-R': () => resetExpandState,
      'Shift-Alt-F': () => checkFileTypeAndFormat(),
      'Shift-Alt-Down': copyLinesDown,
      'Shift-Alt-Up': copyLinesUp,
      'Alt-Up': moveLinesUp,
      'Alt-Down': moveLinesDown,
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
    html: '<!-- Centered with Flexbox magic -->',
    css: '/* Flexbox to the rescue! */',
    js: '// Toggle like a ninja',
  },
  {
    html: '<!-- TODO: Add dark mode switch -->',
    css: '/* Needs better contrast in dark mode */',
    js: '// Placeholder logic for now',
  },
  {
    html: '<!-- Button that begs to be clicked -->',
    css: '/* Gently rounded corners for peaceful vibes */',
    js: '// Click event with no regrets',
  },
  {
    html: "<!-- Don't touch this unless you're brave -->",
    css: "/* It works... don't ask how */",
    js: '// If it breaks, blame the cat',
  },
  {
    html: "<!-- Floating nav like it's 1999 -->",
    css: '/* Absolute positioning wizardry */',
    js: '// Smooth scroll powered by scrollIntoView',
  },
  {
    html: '<!-- Could use ARIA for accessibility -->',
    css: '/* Visually hidden, functionally golden */',
    js: '// Announce updates for screen readers',
  },
  {
    html: '<!-- Hero section so epic it needs a cape -->',
    css: '/* Background like a sunrise */',
    js: '// Animate entrance with style',
  },
  {
    html: '<!-- Need better semantic tags -->',
    css: '/* Stop using divs for everything! */',
    js: '// Will replace this with real data later',
  },
  {
    html: '<!-- Modal portal to another dimension -->',
    css: '/* Z-index chaos begins here */',
    js: '// Trap focus like a boss',
  },
  {
    html: '<!-- This is fine -->',
    css: "/* Everything's on fire, but in style */",
    js: "// Don't panic, just debounce",
  },
  {
    html: '<!-- Magic happens below -->',
    css: '/* Sparkles incoming */',
    js: '// Animate like Studio Ghibli',
  },
  {
    html: '<!-- Grid layout dream come true -->',
    css: '/* Grid-template-columns sorcery */',
    js: '// Resize logic pending...',
  },
  {
    html: '<!-- Should probably validate this -->',
    css: '/* No border yet, just vibes */',
    js: '// Validate before you devastate',
  },
  {
    html: '<!-- Footer of destiny -->',
    css: '/* Sticky like grandma’s cookies */',
    js: '// Scroll to bottom behavior here',
  },
  {
    html: '<!-- Form so clean it sparkles -->',
    css: '/* Minimalist input elegance */',
    js: '// Handle form submit like a champ',
  },
  {
    html: '<!-- Carousel of doom -->',
    css: '/* Overflow hidden… for your safety */',
    js: '// Slide left, slide right, now spin',
  },
  {
    html: '<!-- Navigation for the chosen ones -->',
    css: '/* Centered nav with pixel-perfect balance */',
    js: '// Hamburger menu logic inside',
  },
  {
    html: '<!-- This button has seen things -->',
    css: '/* Button deserves a raise */',
    js: '// Add click animation (🧙 style)',
  },
  {
    html: '<!-- Danger zone below -->',
    css: '/* Red means danger, or love? */',
    js: '// Confirm before deleting… always',
  },
  {
    html: '<!-- Content so fresh it squeaks -->',
    css: '/* Ice-cold palette */',
    js: '// Lazy load like a professional napper',
  },
  {
    html: '<!-- Logo placeholder until client decides -->',
    css: '/* Temporarily ugly, permanently functional */',
    js: '// Logo click = homepage (classic)',
  },
  {
    html: '<!-- Hidden Easter egg area -->',
    css: "/* Shhh, don't tell the user */",
    js: '// Konami code? Maybe.',
  },
  {
    html: '<!-- Testimonials section -->',
    css: '/* Italics for fake sincerity */',
    js: '// Cycle testimonials every 5 seconds',
  },
  {
    html: '<!-- Contact form needs reCAPTCHA -->',
    css: '/* Anti-bot force field */',
    js: '// TODO: Add email validation',
  },
  {
    html: '<!-- Scroll-triggered section -->',
    css: '/* Parallax vibes */',
    js: '// onScroll event handler of doom',
  },
  {
    html: '<!-- Div of destiny -->',
    css: '/* Centered with pure intent */',
    js: '// TODO: Clean this logic up',
  },
  {
    html: '<!-- This input is living its best life -->',
    css: '/* Looks clickable. It is. */',
    js: '// Auto-focus FTW',
  },
  {
    html: '<!-- Section not yet responsive -->',
    css: '/* Mobile styles incoming 🚀 */',
    js: '// Window resize listener here',
  },
  {
    html: '<!-- Might break IE11 -->',
    css: '/* Modern-only party */',
    js: '// Polyfill needed? Nah',
  },
  {
    html: '<!-- Icon pending approval -->',
    css: '/* Placeholder color: sadness */',
    js: '// Replace SVG when ready',
  },
  {
    html: '<!-- This div is lying -->',
    css: '/* Pretends to be a button */',
    js: '// Fakes a click event',
  },
  {
    html: '<!-- My favorite div -->',
    css: '/* Treat this with kindness */',
    js: "// Don't break this, please",
  },
  {
    html: '<!-- Hacky but it works -->',
    css: "/* Don't look too closely */",
    js: '// Trust the process',
  },
  {
    html: '<!-- This tag brought to you by StackOverflow -->',
    css: '/* I found this in a deep Reddit thread */',
    js: '// Shoutout to that one helpful comment',
  },
  {
    html: '<!-- This span does heavy lifting -->',
    css: '/* Inline-block hero */',
    js: '// Handles dynamic updates',
  },
  {
    html: '<!-- Footer flexified -->',
    css: '/* Auto margins to center the soul */',
    js: '// Scroll position logic starts here',
  },
  {
    html: '<!-- The sacred wrapper -->',
    css: '/* Contain all the chaos */',
    js: '// Wrap your functions too',
  },
  {
    html: '<!-- Placeholder for AI content -->',
    css: '/* Content-loading shimmer */',
    js: '// Load content via fetchAI()',
  },
  {
    html: '<!-- Built at 3AM -->',
    css: '/* Dark mode energy */',
    js: '// This code is running on caffeine',
  },
  {
    html: '<!-- Insert marketing fluff here -->',
    css: '/* Padding for dramatic effect */',
    js: '// Delay typing animation like a pro',
  },
  {
    html: '<!-- Deprecated but beloved -->',
    css: '/* Old school charm */',
    js: '// Legacy support logic',
  },
  {
    html: "<!-- Don't delete this comment -->",
    css: '/* Actually important, despite looks */',
    js: '// Critical temp workaround',
  },
  {
    html: '<!-- UI placeholder for future dreams -->',
    css: '/* Box-shadow of ambition */',
    js: '// Simulate real-time data',
  },
  {
    html: '<!-- Magic numbers below -->',
    css: '/* Why 42? Don’t ask. */',
    js: '// The answer to everything',
  },
  {
    html: '<!-- This might work... -->',
    css: '/* First try. Probably. */',
    js: '// Feels like a jutsu',
  },
  {
    html: '<!-- Here be dragons -->',
    css: '/* Enter at your own risk */',
    js: '// Refactor someday maybe',
  },
  {
    html: '<!-- Good enough for now -->',
    css: '/* Meh, it works */',
    js: '// Will regret this later',
  },
  {
    html: '<!-- Minimalist masterpiece -->',
    css: '/* Less is more */',
    js: '// Elegant function below',
  },
  {
    html: '<!-- The one and only hero tag -->',
    css: '/* Font size: epic */',
    js: '// Scroll reveal activated',
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

const localCodeObj = {
  id: hash,
  code: {
    headTags: [],
    html: code().html,
    css: code().css,
    js: code().js,
  },
};

// getting current code always
function code() {
  function headTags() {
    const index = indexFinder(allSavedCode, hash);
    if (index !== -1) {
      const headTagsArray = allSavedCode[index].code.headTags.map((obj) => obj.script);
      const headTagsString = headTagsArray.join('\n');
      return headTagsString;
    }
  }
  return {
    headTags: headTags(),
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
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    allSavedCode[index].code.html = code().html;
    allSavedCode[index].code.css = code().css;
    allSavedCode[index].code.js = code().js;
  } else {
    allSavedCode.push(localCodeObj);
  }
  saveLocalStringify('allSavedCode', allSavedCode);

  if (savedSettings.editor.autoRun === 'off') {
    return;
  }
  if (savedSettings.editor.autoRun === 'immediate') {
    run();
    return;
  }
  clearTimeout(codeMirrorRuntimeout);
  if (savedSettings.editor.autoRun === 'afterDelay') {
    codeMirrorRuntimeout = setTimeout(run, 1200);
  }
}

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
      ${headTags || ''}
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

//! Editor clear expand and format button program
const allInputs = document.querySelectorAll('.each-editor');
const expandBtn = document.querySelectorAll('.expand-panel-btn');

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

function clearEditor(editor) {
  if (editor === 'html') {
    htmlCodeMirror.setValue('');
  }
  if (editor === 'css') {
    cssCodeMirror.setValue('');
  }
  if (editor === 'js') {
    jsCodeMirror.setValue('');
  }
}

function expandEditorPanel(fileType) {
  allInputs.forEach((input) => {
    if (input.dataset.expandFile === fileType) {
      input.classList.remove('shrink');
      input.classList.add('expand');
    } else {
      input.classList.remove('expand');
      input.classList.add('shrink');
    }
  });
  setDisplay(document.querySelector('.expand-reset-btn'), 'block');
  setTimeout(() => {
    refreshCodeMirror();
  }, 400);
}

function resetExpandState() {
  allInputs.forEach((input) => input.classList.remove('expand', 'shrink'));
  setDisplay(document.querySelector('.expand-reset-btn'), 'none');
  setTimeout(() => {
    refreshCodeMirror();
  }, 400);
}

document.querySelector('.code-inputs').addEventListener('click', (e) => {
  const formatBtn = e.target.closest('.single-file-format-btn');
  if (formatBtn) {
    applyFormatedCode(formatBtn.dataset.parserType);
  }
  const clearEditorBtn = e.target.closest('.clear-editor-btn');
  if (clearEditorBtn) {
    clearEditor(clearEditorBtn.dataset.clearEditor);
    setTimeout(refreshCodeMirror, 400);
  }
  const expandBtn = e.target.closest('.expand-panel-btn');
  if (expandBtn) expandEditorPanel(expandBtn.dataset.expandFile);
});

document.querySelector('.expand-reset-btn').addEventListener('click', resetExpandState);

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
  if (isResizing) {
    savedSettings.editor.editorWidth = resizableArea.getBoundingClientRect().width;
    saveLocalStringify('settings', savedSettings);
    isResizing = false;
  }
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

document.addEventListener('click', (e) => {
  const runBtn = e.target.closest('.run-code-btn');
  const customizeBtn = e.target.closest('.customize-panel-btn');
  const modal = e.target.closest('.customization-modal');
  const modalContent = e.target.closest('.customization-container');
  const closeModalBtn = e.target.closest('.close-modal-btn');

  if (runBtn) run();
  if (customizeBtn) {
    customizationModal.classList.add('show');
  }
  if (closeModalBtn) {
    customizationModal.classList.remove('show');
  }
  if (modalContent) {
    return;
  }
  if (modal) {
    customizationModal.classList.remove('show');
  }
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

//! HTML head tag programs
// Helpers
function urlSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.3638 15.5355L16.9496 14.1213L18.3638 12.7071C20.3164 10.7545 20.3164 7.58866 18.3638 5.63604C16.4112 3.68341 13.2453 3.68341 11.2927 5.63604L9.87849 7.05025L8.46428 5.63604L9.87849 4.22182C12.6122 1.48815 17.0443 1.48815 19.778 4.22182C22.5117 6.95549 22.5117 11.3876 19.778 14.1213L18.3638 15.5355ZM15.5353 18.364L14.1211 19.7782C11.3875 22.5118 6.95531 22.5118 4.22164 19.7782C1.48797 17.0445 1.48797 12.6123 4.22164 9.87868L5.63585 8.46446L7.05007 9.87868L5.63585 11.2929C3.68323 13.2455 3.68323 16.4113 5.63585 18.364C7.58847 20.3166 10.7543 20.3166 12.7069 18.364L14.1211 16.9497L15.5353 18.364ZM14.8282 7.75736L16.2425 9.17157L9.17139 16.2426L7.75717 14.8284L14.8282 7.75736Z"></path></svg>`;
}
function scriptSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z"></path></svg>`;
}
function addSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>`;
}
function loaderSvg() {
  return `<svg class="loading-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z"></path></svg>`;
}
function closeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>`;
}
function randomCdnPlaceholder() {
  const cdnSearchPlaceholders = [
    'Type something to summon a CDN spell!',
    'Looking for magic? Start typing a library name.',
    'Input a keyword to begin your search.',
    'What do you want to import today?',
    'Type a library name to fetch its tag.',
    'Ready when you are—just type!',
    'Start typing to find your favorite CDN.',
    'Enter a library, change the game.',
    'Your next tool is just a few letters away.',
    'Need Tailwind? Axios? You know what to do.',
    'Search like a ninja—type fast!',
    'Cast your search jutsu now!',
    'Type it and it shall appear!',
    'Drop some letters, unleash some scripts.',
    'Write a name, get the magic.',
    'The CDN oracle awaits your input.',
    'Start typing to reveal possibilities.',
    'What library are you looking for?',
    'Write and I shall fetch!',
    'Still waiting... go ahead, type something!',
    'Tell me what you seek, dev master.',
    'Want Lodash? Just say the word!',
    'Type a name, fuel your project.',
    'Need power? Type your library.',
    'Begin your CDN quest here.',
    'Your script tag journey starts with a word.',
    'Type a tag name and strike gold.',
    'Enter something—surprises await.',
    'Want sweet alerts? Just type it.',
    'What’s your library wish today?',
  ];

  return cdnSearchPlaceholders[Math.floor(Math.random() * cdnSearchPlaceholders.length)];
}
function getSelectedStarterTag(btn) {
  const starterTags = {
    tailwindcss: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
    fontawesomeicon: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
    axios: 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.9.0/axios.min.js',
    lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
    chartjs: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.min.js',
    sweetalert2: 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.16.1/sweetalert2.min.js',
    gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
  };

  const askedTag = btn.dataset.cdnName;
  return starterTags[askedTag];
}
const emptyTagMessages = ['No tags yet.', 'Add a tag to get started.', 'Tag list is empty.', 'Waiting for tags.', 'Start adding tags.', 'Nothing here yet.', 'Tags will show up here.', 'Add something cool.', "It's quiet here.", 'Empty for now.', 'No scripts added yet.'];

//! starter tags program
const tagListContainer = document.querySelector('.head-tag-list-container');
const starterTagDisplayContainer = document.querySelector('.head-tag-list');
const starterTagContainer = document.querySelector('.starter-tags');

function refreshTagListInTagDisplayContainer() {
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    starterTagDisplayContainer.innerHTML = '';
    const tagsArray = allSavedCode[index].code.headTags;
    tagsArray.forEach((tagObj) => {
      const div = document.createElement('div');
      div.innerHTML = `<span>${tagObj.name}</span>
        <button class="remove-tag-btn" data-tag-id="${tagObj.id}" aria-label="Remove tag button">${closeSvg()}</button>`;
      starterTagDisplayContainer.appendChild(div);
    });
    if (!tagsArray || tagsArray.length === 0) {
      starterTagDisplayContainer.innerHTML = `<span class="empty-head-tag-message">${emptyTagMessages[Math.floor(Math.random() * emptyTagMessages.length)]}</span>`;
    }
  }
}

refreshTagListInTagDisplayContainer();

function addStarterTagAndSave(id, name, script) {
  const index = indexFinder(allSavedCode, hash);
  if (index !== -1) {
    const existingTag = allSavedCode[index].code.headTags?.find((tagObj) => tagObj?.id === id);
    if (!existingTag) {
      allSavedCode[index].code.headTags.push({ id, name, script });
      saveLocalStringify('allSavedCode', allSavedCode);
      refreshTagListInTagDisplayContainer();
      toastPopup(`Inserted '${name}' into html head tag.`);
      run();
    } else {
      toastPopup(`'${name}' tag is already added.`);
    }
  } else {
    localCodeObj.code.headTags.push({ id, name, script });
    allSavedCode.push(localCodeObj);
    saveLocalStringify('allSavedCode', allSavedCode);
    refreshTagListInTagDisplayContainer();
    toastPopup(`Inserted '${name}' into html head tag.`);
    run();
  }
}

starterTagContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.started-tag-insert-btn');
  if (btn) {
    const script = getFullTag(getSelectedStarterTag(btn));
    addStarterTagAndSave(btn.dataset.tagId, btn.textContent, script);
  }
});

//! Remove tags
starterTagDisplayContainer.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove-tag-btn');
  if (removeBtn) {
    const eachTagParent = removeBtn.parentNode;
    eachTagParent.remove();
    const index = indexFinder(allSavedCode, hash);
    if (index !== -1) {
      const id = removeBtn.dataset.tagId;
      const allTagArray = allSavedCode[index].code.headTags;
      const tagIndex = allTagArray.findIndex((tagObj) => tagObj?.id === id);
      if (tagIndex !== -1) {
        allTagArray.splice(tagIndex, 1);
        allSavedCode[index].code.headTags = allTagArray;
        saveLocalStringify('allSavedCode', allSavedCode);
        refreshTagListInTagDisplayContainer();
        run();
      }
    }
  }
});

//! Custom head tags program
const customTagTitleInput = document.getElementById('custom-head-tag-title');
const customTagBodyInput = document.getElementById('custom-head-tag-body');
const insertTagBtn = document.querySelector('.insert-custom-tags-btn');
insertTagBtn.addEventListener('click', () => {
  const title = customTagTitleInput.value.trim();
  const script = customTagBodyInput.value.trim();
  const id = `${new Date().getTime()}`;
  if (!title || !script) {
    toastPopup(`Name and tag both should be filled`);
    return;
  }
  customTagTitleInput.value = '';
  customTagBodyInput.value = '';
  addStarterTagAndSave(id, title, script);
  // toastPopup(`Inserted '${title}' into html head tag.`)
});

//! Search cdn and add program
const searchDisplayContainer = document.querySelector('.show-library-result-container');
const searchCdnInput = document.getElementById('library-search-input');

function createEachLibraryContainer(object) {
  const obj = {
    name: object.name,
    version: object.version,
    latest: object.latest,
    des: object.description,
  };
  const { name, version, latest, des } = obj;

  const div = document.createElement('div');
  div.className = 'each-library-container';
  div.innerHTML = `
  <div>
    <div class="library-header">
      <span class="library-name">${name}</span>
      <span class="library-version">@ ${version}</span>
    </div>
    <div class="library-body">
      <span class="library-description">${des}</span>
    </div>
  </div>

  <div class="library-option-button-container">
    <span class="URL-container">${latest}</span>
    <button class="library-url-copy-btn" aria-label="copy url" title="Copy URL">
      ${urlSvg()}
    </button>
    <button class="library-script-tag-copy-btn" aria-label="copy script tag" title="Copy script tag">
      ${scriptSvg()}
    </button>
    <button class="library-script-tag-add-btn" aria-label="Add script tag" title="Add to head">
      ${addSvg()}
    </button>
  </div>`;
  searchDisplayContainer.appendChild(div);
}

function getCdn(query) {
  return fetch(`https://api.cdnjs.com/libraries?search=${query}&fields=filename,description,version`)
    .then((res) => res.json())
    .then((data) => {
      return data.results;
    });
}

let debounceSearch;
searchCdnInput.addEventListener('input', () => {
  clearTimeout(debounceSearch);
  debounceSearch = setTimeout(async () => {
    const query = searchCdnInput.value.trim();
    if (!query) {
      searchDisplayContainer.innerHTML = `<span class="empty-result-message">${randomCdnPlaceholder()}</span>`;
      return;
    }

    searchDisplayContainer.innerHTML = `<span class="loader-container">${loaderSvg()}</span>`;

    const data = await getCdn(query);
    if (data.length === 0) {
      searchDisplayContainer.innerHTML = `<span class="empty-result-message">No matching libraries for '${query}'. Try another keyword.</span>`;
      return;
    }

    searchDisplayContainer.innerHTML = '';
    const searchResult = data.slice(0, 100);
    searchResult.forEach((obj) => {
      createEachLibraryContainer(obj);
    });
  }, 500);
});

function getUrl(btn) {
  return btn.closest('.each-library-container').querySelector('.URL-container').textContent;
}
function getLibraryName(btn) {
  return btn.closest('.each-library-container').querySelector('.library-name').textContent;
}

function getFullTag(url) {
  const cleanUrl = url.split('?')[0].split('#')[0];
  if (cleanUrl.endsWith('.js')) {
    return `<script src="${url}"></script>`;
  }
  if (cleanUrl.endsWith('.css')) {
    return `<link rel="stylesheet" href="${url}" />`;
  }
  return `<script src="${url}"></script>`;
}

searchDisplayContainer.addEventListener('click', (e) => {
  const urlCopyBtn = e.target.closest('.library-url-copy-btn');
  if (urlCopyBtn) {
    copyToClipboard(getUrl(urlCopyBtn));
    toastPopup(`URL of '${getLibraryName(urlCopyBtn)}' copied !`);
    return;
  }
  const scriptCopyBtn = e.target.closest('.library-script-tag-copy-btn');
  if (scriptCopyBtn) {
    copyToClipboard(getFullTag(getUrl(scriptCopyBtn)));
    toastPopup(`Tag of '${getLibraryName(scriptCopyBtn)}' copied !`);
    return;
  }
  const addTagBtn = e.target.closest('.library-script-tag-add-btn');
  if (addTagBtn) {
    const mainLibraryContainer = e.target.closest('.each-library-container');
    const name = mainLibraryContainer.querySelector('.library-name').textContent.trim();
    const version = mainLibraryContainer.querySelector('.library-version').textContent.replace('@', '').trim();
    const id = `${name}@${version}`;
    addStarterTagAndSave(id, name, getFullTag(getUrl(addTagBtn)));
  }
});

//! editor setting programs
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
  if (type === 'fontWeight') {
    body.style.setProperty('--user-font-weight', freshSetting().editor[type]);
  }
  if (type === 'fontSize') {
    body.style.setProperty('--user-font-size', `${Number(freshSetting().editor[type]) / 16}rem`);
  }
  if (type === 'fontLigatures') {
    const ligatureState = freshSetting().editor.fontLigatures === 'on' ? 'calt' : `"calt" off`;
    body.style.setProperty('--user-font-ligatures', ligatureState);
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

//! Keyboard shortcuts
const keyboardShortcutModal = document.querySelector('.keyboard-shortcut-modal');
const keyboardShortcutModalContent = document.querySelector('.keyboard-shortcut-modal-content');
// stopPropagation(keyboardShortcutModalContent);
const shortcutViewerBtn = document.querySelector('.shortcut-viewer-btn');

document.addEventListener('click', (e) => {
  const shortcutViewerBtn = e.target.closest('.shortcut-viewer-btn');
  const shortcutModal = e.target.closest('.keyboard-shortcut-modal');
  const modalContent = e.target.closest('.keyboard-shortcut-modal-content');
  const closeModalBtn = e.target.closest('.close-keyboard-shortcut-modal-btn');

  if (shortcutViewerBtn) {
    keyboardShortcutModal.classList.add('show');
  }

  if (closeModalBtn) {
    keyboardShortcutModal.classList.remove('show');
  }

  if (modalContent) {
    return;
  }

  if (shortcutModal) {
    keyboardShortcutModal.classList.remove('show');
  }
});

function closeSidebar() {
  sidebar.classList.remove('show');
  sidebarToggleBtn.classList.remove('show');
  beneathLayer.classList.remove('show');
  reloadTitleAttr();
}

function closeModalFunc() {
  document.querySelectorAll('.universal-modal').forEach((modal) => {
    if (modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  });
}

function focusOnEditor(type) {
  if (type === 'html') {
    htmlCodeMirror.focus();
    if (freshSetting().editor.expandPanel === 'on') {
      expandEditorPanel('html');
      return;
    }
    resetExpandState();
  }

  if (type === 'css') {
    cssCodeMirror.focus();
    if (freshSetting().editor.expandPanel === 'on') {
      expandEditorPanel('css');
      return;
    }
    resetExpandState();
  }

  if (type === 'js') {
    jsCodeMirror.focus();
    if (freshSetting().editor.expandPanel === 'on') {
      expandEditorPanel('js');
      return;
    }
    resetExpandState();
  }
}

function checkFileTypeAndFormat() {
  if (htmlCodeMirror.hasFocus()) {
    applyFormatedCode('html');
    toastPopup('HTML file formatted');
  }
  if (cssCodeMirror.hasFocus()) {
    applyFormatedCode('css');
    toastPopup('CSS file formatted');
  }
  if (jsCodeMirror.hasFocus()) {
    applyFormatedCode('babel');
    toastPopup('JS file formatted');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModalFunc();
    closeSidebar();
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    toggleSidebar();
    closeModalFunc();
  }
  if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key)) {
    e.preventDefault();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.key === 'j')) {
    e.preventDefault();
    closeModalFunc();
    closeSidebar();
    focusOnEditor('html');
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === '2' || e.key === 'k')) {
    e.preventDefault();
    closeModalFunc();
    closeSidebar();
    focusOnEditor('css');
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === '3' || e.key === 'l')) {
    e.preventDefault();
    closeModalFunc();
    closeSidebar();
    focusOnEditor('js');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === ',' && !customizationContainer.classList.contains('slide-up')) {
    e.preventDefault();
    closeModalFunc();
    closeSidebar();
    document.querySelector('.customize-panel-btn').click();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === ';' && !keyboardShortcutModal.classList.contains('show')) {
    e.preventDefault();
    closeModalFunc();
    closeSidebar();
    keyboardShortcutModal.classList.add('show');
  }
});

// copy lines up/down
function copyLinesUp(cm) {
  const fromLine = cm.getCursor('start').line;
  const toLine = cm.getCursor('end').line;

  const lines = [];
  for (let i = fromLine; i <= toLine; i++) {
    lines.push(cm.getLine(i));
  }
  const blockText = lines.join('\n');

  cm.operation(() => {
    cm.replaceRange(blockText + '\n', { line: fromLine, ch: 0 });
    const newFrom = fromLine;
    const newTo = fromLine + (toLine - fromLine);
    cm.setSelection({ line: newFrom, ch: 0 }, { line: newTo, ch: cm.getLine(newTo).length });
  });
}

function copyLinesDown(cm) {
  const fromLine = cm.getCursor('start').line;
  const toLine = cm.getCursor('end').line;

  const lines = [];
  for (let i = fromLine; i <= toLine; i++) {
    lines.push(cm.getLine(i));
  }
  const blockText = lines.join('\n');

  const insertPos = { line: toLine, ch: cm.getLine(toLine).length };
  cm.operation(() => {
    cm.replaceRange('\n' + blockText, insertPos);

    const newFrom = toLine + 1;
    const newTo = toLine + 1 + (toLine - fromLine);
    cm.setSelection({ line: newFrom, ch: 0 }, { line: newTo, ch: cm.getLine(newTo).length });
  });
}

// Line move up/down
function moveLinesUp(cm) {
  const sel = cm.listSelections()[0];
  let fromLine = sel.from().line;
  let toLine = sel.to().line;
  if (sel.to().ch === 0 && fromLine !== toLine) {
    toLine -= 1;
  }
  if (fromLine === 0) return;
  const lineAboveText = cm.getLine(fromLine - 1);
  const blockText = cm.getRange({ line: fromLine, ch: 0 }, { line: toLine, ch: cm.getLine(toLine).length });

  cm.operation(() => {
    cm.replaceRange(blockText + '\n' + lineAboveText, { line: fromLine - 1, ch: 0 }, { line: toLine, ch: cm.getLine(toLine).length });
    const newAnchor = { line: sel.anchor.line - 1, ch: sel.anchor.ch };
    const newHead = { line: sel.head.line - 1, ch: sel.head.ch };
    cm.setSelection(newAnchor, newHead);
  });
}

function moveLinesDown(cm) {
  const sel = cm.listSelections()[0];
  let fromLine = sel.from().line;
  let toLine = sel.to().line;

  if (sel.to().ch === 0 && fromLine !== toLine) {
    toLine -= 1;
  }
  const lastLine = cm.lineCount() - 1;
  if (toLine === lastLine) return;
  const lineBelowText = cm.getLine(toLine + 1);
  const blockText = cm.getRange({ line: fromLine, ch: 0 }, { line: toLine, ch: cm.getLine(toLine).length });
  cm.operation(() => {
    cm.replaceRange(lineBelowText + '\n' + blockText, { line: fromLine, ch: 0 }, { line: toLine + 1, ch: cm.getLine(toLine + 1).length });
    const newAnchor = { line: sel.anchor.line + 1, ch: sel.anchor.ch };
    const newHead = { line: sel.head.line + 1, ch: sel.head.ch };
    cm.setSelection(newAnchor, newHead);
  });
}

// Toast message program
const toastMessageContainer = document.querySelector('.toast-message-container');

function toastPopup(message) {
  const div = document.createElement('div');
  div.innerHTML = `<span class="toast-message">${message}</span>`;
  toastMessageContainer.prepend(div);

  requestAnimationFrame(() => {
    div.classList.add('show');
  });

  setTimeout(() => {
    div.classList.remove('show');
  }, 5000);

  setTimeout(() => {
    toastMessageContainer.removeChild(div);
  }, 5200);
}

document.addEventListener('click', (e) => {
  const toastBtn = e.target.closest('[data-toast-message]');
  if (toastBtn) {
    toastPopup(toastBtn.dataset.toastMessage);
  }
});

//! Project delete program
const sidebarDltBtn = document.querySelector('.sidebar-dlt-btn');
const dltModal = document.querySelector('.delete-modal');

stopPropagation(document.querySelector('.delete-modal-content'));
dltModal.querySelector('.delete-message-title-container').textContent = currentProject?.name;

sidebarDltBtn.addEventListener('click', () => {
  dltModal.classList.add('show');
  dltModal.querySelector('.delete-message-title-container').textContent = freshProjectList()[indexFinder(freshProjectList(), hash)].name;
  sidebarToggleBtn.click();
});

dltModal.addEventListener('click', () => dltModal.classList.remove('show'));

dltModal.querySelector('.delete-modal-content').addEventListener('click', (e) => {
  const cancelBtn = e.target.closest('.dlt-cancel-btn');
  const confirmBtn = e.target.closest('.dlt-confirm-btn');

  if (cancelBtn) dltModal.classList.remove('show');

  if (confirmBtn) {
    const arr = freshProjectList();
    const indexFromFreshProjectList = indexFinder(arr, hash);
    arr.splice(indexFromFreshProjectList, 1);
    saveLocalStringify('all-saved-projects', arr);

    const freshSavedCodeList = JSON.parse(localStorage.getItem('allSavedCode')) || [];
    const fromSavedCodeIndex = indexFinder(freshSavedCodeList, hash);
    if (fromSavedCodeIndex !== -1) {
      freshSavedCodeList.splice(fromSavedCodeIndex, 1);
      saveLocalStringify('allSavedCode', freshSavedCodeList);
    }
    dltModal.classList.remove('show');
    toastPopup(confirmBtn.dataset.toastMessage);
    document.querySelector('.disable-interaction').classList.add('show');
    document.querySelector('.main-diversion').style.scale = '0.9';
    document.querySelector('.sidebar').style.scale = '0.9';
    setTimeout(() => {
      window.close();
    }, 3300);
  }
});

//! DOMContentLoaded program
document.addEventListener('DOMContentLoaded', () => {
  checkIfCodeExists();
  allEditorInput.forEach((input) => {
    refreshEditorContent(input.id);
  });
  const isFine = window.matchMedia('(pointer: fine)').matches;
  const editorWidth = freshSetting().editor.editorWidth;

  resizableArea.style.width = `${isFine && editorWidth <= 300 ? 300 : editorWidth}px`;

  const isMac = /Mac/i.test(navigator.platform);
  document.querySelectorAll('.shortcut-keys').forEach((key) => {
    key.innerHTML = key.innerHTML.replace(/Ctrl/g, isMac ? 'Cmd' : 'Ctrl');
  });
});
