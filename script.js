let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

const form = document.getElementById('item-form');
const listEl = document.getElementById('grocery-list');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const quantity = document.getElementById('item-quantity').value.trim();
  const store = document.getElementById('item-store').value;

  if (!name || !quantity || !store) return;

  groceryList.push({ name, quantity, store, checked: false });
  saveAndRender();
  form.reset();
});

function saveAndRender() {
  groceryList.sort((a, b) => a.checked - b.checked);
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function renderList() {
  listEl.innerHTML = '';
  groceryList.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = item.checked ? 'checked' : '';

    const label = document.createElement('div');
    label.style.flex = '1';

    const nameEl = document.createElement('strong');
    nameEl.textContent = item.name;

const quantityEl = document.createElement('span');
quantityEl.textContent = ` (${item.quantity})`;
quantityEl.style.cursor = 'pointer';
quantityEl.style.marginLeft = '5px';
quantityEl.style.color = '#007AFF';

quantityEl.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = item.quantity;
  input.style.width = '80px';
  input.style.fontSize = '14px';
  input.style.marginLeft = '5px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #ccc';
  input.style.padding = '2px 6px';

  // Replace the quantity span with input
  quantityEl.replaceWith(input);
  input.focus();

  // Save on blur or Enter key
  const saveEdit = () => {
    const newQty = input.value.trim();
    if (newQty !== '') {
      groceryList[index].quantity = newQty;
      saveAndRender();
    } else {
      renderList(); // fallback if empty
    }
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    }
  });
});

    const storeEl = document.createElement('span');
    storeEl.textContent = ` - ${item.store}`;

    label.appendChild(nameEl);
    label.appendChild(quantityEl);
    label.appendChild(storeEl);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      groceryList[index].checked = !groceryList[index].checked;
      saveAndRender();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveAndRender();
    });

    li.appendChild(label);
    li.appendChild(checkbox);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });
}

// Initial load
saveAndRender();
