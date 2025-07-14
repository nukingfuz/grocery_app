// Grocery List App Script
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const darkToggle = document.getElementById('dark-mode-toggle');
const filterMode = document.getElementById('filter-mode');
const clearCheckedBtn = document.getElementById('clear-checked');

// Save and render
function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

// Add new item
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const quantity = document.getElementById('item-quantity').value.trim();
  const store = document.getElementById('item-store').value;
  const category = document.getElementById('item-category').value;
  if (!name || !quantity || !store || !category) return;
  groceryList.push({ name, quantity, store, category, checked: false });
  form.reset();
  saveList();
});

// Render list
function renderList() {
  listEl.innerHTML = '';
  let sortedList = [...groceryList];

  if (filterMode.value === 'store') {
    sortedList.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filterMode.value === 'category') {
    sortedList.sort((a, b) => a.category.localeCompare(b.category));
  } else {
    sortedList.sort((a, b) => a.checked - b.checked);
  }

  sortedList.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = item.checked ? 'checked' : '';
    li.dataset.index = index;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      groceryList[index].checked = checkbox.checked;
      saveList();
    });

    const content = document.createElement('div');
    content.className = 'content';

    const nameInput = createEditableField(item.name, newVal => {
      groceryList[index].name = newVal;
      saveList();
    });

    const qtyInput = createEditableField(item.quantity, newVal => {
      groceryList[index].quantity = newVal;
      saveList();
    });

    const storeInput = createEditableField(item.store, newVal => {
      groceryList[index].store = newVal;
      saveList();
    });

    const tags = document.createElement('div');
    tags.className = 'tags';
    tags.innerHTML = `
      Quantity: <span class="pill">${qtyInput.outerHTML}</span>
      Store: <span class="pill">${storeInput.outerHTML}</span>
      Category: <span class="pill">${item.category}</span>
    `;

    content.appendChild(nameInput);
    content.appendChild(tags);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveList();
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  Sortable.create(listEl, {
    animation: 150,
    onEnd: evt => {
      const [movedItem] = groceryList.splice(evt.oldIndex, 1);
      groceryList.splice(evt.newIndex, 0, movedItem);
      saveList();
    }
  });
}

// Editable field
function createEditableField(value, onSave) {
  const span = document.createElement('span');
  span.className = 'editable';
  span.contentEditable = true;
  span.textContent = value;
  span.addEventListener('blur', () => onSave(span.textContent.trim()));
  span.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      span.blur();
    }
  });
  return span;
}

// Dark mode
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

// Filter mode
filterMode.addEventListener('change', renderList);

// Clear checked
clearCheckedBtn.addEventListener('click', () => {
  if (confirm('Remove all checked items?')) {
    groceryList = groceryList.filter(item => !item.checked);
    saveList();
  }
});

renderList();