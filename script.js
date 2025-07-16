// Grocery List App Script
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
let knownStores = new Set();
let knownCategories = new Set();

const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const filterMode = document.getElementById('filter-mode');
const clearCheckedBtn = document.getElementById('clear-checked');

function saveList() {
  groceryList.forEach(item => {
    knownStores.add(item.store);
    knownCategories.add(item.category);
  });
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  updateSuggestions();
  renderList();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const store = document.getElementById('item-store').value.trim();
  const category = document.getElementById('item-category').value.trim();
  if (!name || !store || !category) return;
  groceryList.push({ name, store, category, checked: false });
  form.reset();
  saveList();
});

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

    const storeTag = document.createElement('span');
    storeTag.className = 'pill store';
    storeTag.textContent = item.store;

    const categoryTag = document.createElement('span');
    categoryTag.className = 'pill category';
    categoryTag.textContent = item.category;

    const tags = document.createElement('div');
    tags.className = 'tags';
    tags.appendChild(storeTag);
    tags.appendChild(categoryTag);

    content.appendChild(nameInput);
    content.appendChild(tags);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '<strong>X</strong>';
    delBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveList();
    });

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '&#8942;&#8942;';

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(delBtn);
    actions.appendChild(handle);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  Sortable.create(listEl, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: evt => {
      const uncheckedItems = groceryList.filter(i => !i.checked);
      const checkedItems = groceryList.filter(i => i.checked);
      const [movedItem] = uncheckedItems.splice(evt.oldIndex, 1);
      uncheckedItems.splice(evt.newIndex, 0, movedItem);
      groceryList = [...uncheckedItems, ...checkedItems.sort((a, b) => a.store.localeCompare(b.store) || a.category.localeCompare(b.category))];
      saveList();
    }
  });
}

function updateSuggestions() {
  const storeDatalist = document.getElementById('store-suggestions');
  const categoryDatalist = document.getElementById('category-suggestions');

  storeDatalist.innerHTML = '';
  categoryDatalist.innerHTML = '';

  knownStores.forEach(store => {
    const opt = document.createElement('option');
    opt.value = store;
    storeDatalist.appendChild(opt);
  });

  knownCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    categoryDatalist.appendChild(opt);
  });
}

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

filterMode.addEventListener('change', renderList);

clearCheckedBtn.addEventListener('click', () => {
  groceryList.forEach(item => item.checked = false);
  saveList();
});

updateSuggestions();
renderList();