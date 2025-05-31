//! Clean localStorage control
const cleanTag = 'clean-v-0.1';
const savedCleanTag = localStorage.getItem('clean-tag');
if (!savedCleanTag || savedCleanTag !== cleanTag) {
  localStorage.clear();
  localStorage.setItem('clean-tag', cleanTag);
}
// Migration system will be added if needed.

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
    sidebarToggleBtn.setAttribute('title', 'Click to open sidebar');
  } else {
    sidebarToggleBtn.setAttribute('title', 'Click to close sidebar');
  }
}
reloadTitleAttr();

function toggleSidebar() {
  if (!sidebar.classList.contains('show')) {
    setDisplay(sidebar, 'block');
    beneathLayer.classList.add('show');
    requestAnimationFrame(() => {
      sidebar.classList.add('show');
      sidebarToggleBtn.classList.add('move');
      reloadTitleAttr();
    });
  } else {
    sidebar.classList.remove('show');
    sidebarToggleBtn.classList.remove('move');
    beneathLayer.classList.remove('show');
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

function loadSidebarProject(projects) {
  document.querySelector('.project-list-container').innerHTML = '';
  projects.forEach((obj) => {
    loadProjectItem(obj.name, obj.des, obj.id);
  });
}

loadSidebarProject(savedProjects);

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
      'Ctrl-J': () => htmlCodeMirror.focus(),
      'Ctrl-K': () => cssCodeMirror.focus(),
      'Ctrl-L': () => jsCodeMirror.focus(),
      'Ctrl-1': () => htmlCodeMirror.focus(),
      'Ctrl-2': () => cssCodeMirror.focus(),
      'Ctrl-3': () => jsCodeMirror.focus(),
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

//! Editor clear expand and format button program
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
});

const allInputs = document.querySelectorAll('.each-editor');
const expandBtn = document.querySelectorAll('.expand-panel-btn');
expandBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    allInputs.forEach((input) => input.classList.toggle('shrink', !input.contains(btn)));
    allInputs.forEach((input) => input.classList.toggle('expand', input.contains(btn)));
    setDisplay(document.querySelector('.expand-reset-btn'), 'block');
    setTimeout(() => {
      // refreshCodeMirror();
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
document.addEventListener('keydown', (e) => {
  // toggle sidebar
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    sidebarToggleBtn.click();
  }
  // prevent page saving & print
  if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key)) {
    e.preventDefault();
  }
  if (e.ctrlKey && (e.key === '1' || e.key === 'j')) {
    e.preventDefault();
    if(sidebar.classList.contains('show')) sidebarToggleBtn.click();
    htmlCodeMirror.focus();
  }
  if (e.ctrlKey && (e.key === '2' || e.key === 'k')) {
    e.preventDefault();
    if(sidebar.classList.contains('show')) sidebarToggleBtn.click();
    cssCodeMirror.focus();
  }
  if (e.ctrlKey && (e.key === '3' || e.key === 'l')) {
    e.preventDefault();
    if(sidebar.classList.contains('show')) sidebarToggleBtn.click();
    jsCodeMirror.focus();
  }
  if((e.ctrlKey && e.key === ',') && !customizationContainer.classList.contains('slide-up')) {
    document.querySelector('.customize-panel-btn').click();
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
    toastPopup(confirmBtn);
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
});
