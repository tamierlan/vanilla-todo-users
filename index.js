// select elements
const inputs = document.getElementsByTagName('body')[0].getElementsByTagName('div')[1].getElementsByTagName('input');
const tabs = document.getElementsByTagName('nav')[0].getElementsByTagName('button');
const divs = document.getElementsByTagName('body')[0].getElementsByTagName('div');
const ul = document.getElementById('userlist');

const state = {
    users: [],
    backupUsers: []
};

// delete user
const deleteTodo = id => {
    state.users = state.users.filter(user => user.id !== id);
    renderUsers();
};


// change tabs
let tabNum = 0;
let editedUser = null;
const changeTab = newTab => {
    if (typeof newTab === 'object') {
        divs[0].style.display = 'none';
        divs[1].style.display = 'block';
        inputs[0].value = newTab.name;
        inputs[1].value = newTab.email;
        inputs[2].value = newTab.address.street; 
        inputs[3].value = newTab.address.city;
        inputs[4].value = newTab.address.zipcode;
        inputs[5].value = newTab.phone;
        editedUser = newTab;
    } else {
        tabs[tabNum].className = tabs[tabNum].className.replace(' active', '');
        divs[0].style.display = 'none';
        divs[1].style.display = 'none';
        tabNum = newTab;
        tabs[tabNum].className += ' active';
        divs[tabNum].style.display = 'block';
        editedUser = null;
    }
    if (tabNum === 0) renderFilterInput()
};

//save user
const saveUser = () => {
    let isValid = true;
    const newUser = { name: '', email: '', address: {}, phone: '' };
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.value.length) {
            if (input.id == 'name' || input.id == 'email' || input.id == 'phone') {
                newUser[input.id] = input.value;
            } else {
                newUser.address[input.id] = input.value;
            }
            
        } else {
            input.style.border = '1px solid red';
            isValid = false;
        }
    }
    if (!isValid) return;
    if (tabNum === 1) {
        state.users.push({ id: state.users.length += 1, ...newUser });
    } else {
        editedUser.name = inputs[0].value;
        editedUser.email = inputs[1].value;
        editedUser.address.street = inputs[2].value;
        editedUser.address.city = inputs[3].value;
        editedUser.address.zipcode = inputs[4].value;
        editedUser.phone = inputs[5].value;

        for (let s = 0; s < state.users.length; s++) {
            if (editedUser.id === state.users[s].id) {
                state.users.splice(s, 1, editedUser);
            }
        }
    }
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
        inputs[i].style.border = '1px solid grey';
    } 
    changeTab(0);
    renderUsers();
};



// render filter
let selectType = '';
const renderFilterInput = () => {
    if (state.users.length > 2) {
        const keys = Object.keys(state.users[0]);
        const select = document.getElementsByTagName('select')[0];
        for (let key = 1; key < keys.length; key++) {
            console.log(typeof keys[key])
            if (keys[key] !== 'address') {
                if (key == 1) selectType = keys[key];
                const option = document.createElement('option')
                option.text = keys[key];
                select.add(option);
            } 
        }
        select.addEventListener('change', (event) => {
            selectType = event.target.value;
        })
    }
};

const searchInput = document.getElementsByClassName('search')[0];
searchInput.addEventListener('input', (val) => {
    const value = val.target.value;
    if (value.length) {
        const sortedUsers = state.users.sort((a, b) => {
            a = a[selectType].toLowerCase();
            b = b[selectType].toLowerCase();
            if (a > b) return 1;
            if (a < b) return -1;
            console.log(a, b)
        });
        state.users = sortedUsers;
        renderUsers();
    } else {
        state.users = state.backupUsers;
    }
    // console.log(selectType)
    // console.log(val.target.value)
})


// render list
const renderUsers = () => {
    ul.innerHTML = '';
    state.users.forEach(user => {
        const li = document.createElement('LI');
        let editting = false;

        // flex list in li
        const keys = Object.keys(user);
        for (let key = 1; key < keys.length; key++) {
            if (typeof user[keys[key]] === 'string') {
                const input = document.createElement("INPUT");
                input.addEventListener('mouseenter', () => editting = true);
                input.addEventListener('mouseleave', () => editting = false);
                const saveBtn = document.createElement('button')
                saveBtn.innerHTML = 'save';
                saveBtn.className = 'saveBtn';
                saveBtn.addEventListener('mouseenter', () => editting = true);
                saveBtn.addEventListener('mouseleave', () => editting = false);
                saveBtn.addEventListener('click', () => {
                    //save li edits 
                    state.users.forEach(item => {
                        if (item.id == user.id) {
                            if (input.value.length) {
                                item[keys[key]] = input.value;
                                input.style.border = '0';
                            } else {
                                input.style.border = '1px solid red';
                            }
                        } 
                    })
                })
                
                input.setAttribute("type", "text");
                input.value = user[keys[key]];
                input.placeholder = keys[key];
                li.appendChild(input);
                li.appendChild(saveBtn);
            }
        }
        //delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'delete';
        deleteBtn.className = 'delete';
        deleteBtn.addEventListener('mouseenter', () => editting = true);
        deleteBtn.addEventListener('mouseleave', () => editting = false);
        deleteBtn.addEventListener('click', () => deleteTodo(user.id));
        li.appendChild(deleteBtn);

        //edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = 'edit';
        editBtn.className = 'editBtn';
        li.appendChild(editBtn);
        li.addEventListener('click', () => {
            if (!editting) changeTab(user)
        })
        ul.appendChild(li);
    });
};



 // initial render
 (async () => {
    let data = await fetch('https://jsonplaceholder.typicode.com/users').then(data => data.json());
    // remove  unnecessary properties
    data = data.filter(item => {
        delete item.username;
        delete item.website;
        delete item.company;
        delete item.address.geo;
        delete item.address.suite;
        return item;
    });

    state.users.push(...data);
    state.backupUsers.push(...data);
    tabs[tabNum].className += ' active';
    divs[tabNum].style.display = 'block';
    renderFilterInput();
    renderUsers();
})();