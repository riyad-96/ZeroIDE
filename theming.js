// ES6+ Features
const PI = 3.14;
let arr = [1, 2, 3];
let obj = {
  key: 'value',
  method() {
    return this.key;
  },
};

class Component extends HTMLElement {
  #privateField = 42;

  constructor() {
    super();
    this.property = null;
  }

  connectedCallback() {
    this.innerHTML = `<div>${this.#privateField}</div>`;
  }
}

async function fetchData() {
  try {
    const response = await fetch('/api');
    const data = await response.json();
    console.log(data?.results ?? 'No data');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Regular expressions
const regex = /^[a-zA-Z]+$/g;
console.log(regex);

const boolean = true;

// Event listeners
window.addEventListener('load', () => {
  document.querySelector('button').onclick = (e) => {
    console.log('Clicked!');
  };
});

// Template literals
const html = `<div class="test">${PI.toFixed(2)}</div>`;
