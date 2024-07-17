// ==UserScript==
// @name         Dreamwidth Update Page Fix
// @namespace    http://tampermonkey.net/
// @version      2024-07-17
// @description  moves and formats navigation
// @author       Bill in KCMO
// @match        https://www.dreamwidth.org/update
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dreamwidth.org
// @grant        none
// ==/UserScript==

(function () {


    function createJournalIconLink() {
        const user = Site.currentJournal;
        let a = [];
        a['user'] = document.createElement("a");
        a['user'].classList.add('journalName');
        a['user'].classList.add('specialpad');
        a['user'].href = `https://${user}.dreamwidth.org/`;
        a['user'].innerText = Site.currentJournal;
        a['profile'] = document.createElement("a");
        a['profile'].classList.add('specialpad');
        a['profile'].href = `https://${user}.dreamwidth.org/profile`;
        let i = document.createElement("img");
        i.src = 'https://www.dreamwidth.org/img/silk/identity/user.png';
        i.alt = '[personal profile]';
        i.classList.add('journalIcon')
        i.classList.add('ContextualPopup')
        i.style.verticalAlign = 'text-bottom';
        a['profile'].appendChild(i);
        let c = document.createElement('span');
        c.setAttribute('lj:user', user);
        c.classList.add("ljuser");
        c.appendChild(a['profile']);
        c.appendChild(a['user']);
        return c;
    }

    // Function to create list items with links
    function createListItem(text, href, floatRight = false, icon) {
        const li = document.createElement('li');
        if (floatRight) li.style.float = 'right';
        if (typeof href != 'undefined') {
            let i = '';
            if (icon) {
                i = `<span class="material-symbols-outlined">${icon}</span>`;
            }
            const a = document.createElement('a');
            a.href = href;
            a.innerHTML = i + text;

            li.appendChild(a);
        } else {
            li.appendChild(text);
        }
        return li;
    }

    setTimeout(() => {

        'use strict';

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
        document.head.appendChild(link);

        // Create the new unordered list and list items
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.id = 'tamper-nav';
        ul.classList.add('clearfix');
        nav.classList.add('new-navigation-style');

        // Get links from the existing div
        const oldNavBar = document.querySelector('div.row div[role=navigation]');
        const oldNavLinks = oldNavBar.querySelectorAll('a');
        const oldNav = oldNavBar.closest('div.row');

        // Create new list items using the old links
        ul.appendChild(createListItem(createJournalIconLink()));
        ul.appendChild(createListItem('Reading Page', oldNavLinks[3].href, false, 'auto_stories'));
        ul.appendChild(createListItem('Search', oldNavLinks[6].href, false, 'search'));
        ul.appendChild(createListItem('Log Out', oldNavLinks[4].href, true, 'logout'));
        ul.appendChild(createListItem('Site Map', oldNavLinks[8].href, true, 'map'));
        ul.appendChild(createListItem('Settings', oldNavLinks[7].href, true, 'settings'));
        nav.appendChild(ul);

        // Replace the existing div[role=navigation] with the new ul
        oldNav.parentElement.replaceChild(nav, oldNav);

        // Create and append the style element
        const style = document.createElement('style');
        style.textContent = `
#tamper-nav li {
    float: left;
    position: relative;
}

#tamper-nav li a {
    color: black;
    text-decoration: none;
}

#tamper-nav li a:not(.specialpad) {
    padding: .5rem 1rem;
    color: black;clear
}

#tamper-nav li:not(:first-child):not(:nth-child(6))::before {
    content: "|";
}

#tamper-nav li.right {
    float: right;
}

a.journalName {
    font-weight: bold;
    color: blue;
    padding-right: 1em;
    padding-left: .3rem;
    transform: translateY(-.2rem);
  display: inline-block;
}
}

i.journalIcon {
    width: 17px;
    height: 17px;
    vertical-align: text-bottom;
    border: 0;
    padding-right: .5em;
}

span.ljuser {
    white-space: nowrap;
}

.new-navigation-style {
    font-family: sans-serif;
    font-size: .65rem;
    background: linear-gradient(to bottom, #eee, #eee, #ccc);
    box-shadow: 0 0 .5rem 4px rgba(0,0,0, .3);
    border-bottom: 1px solid gray;
    margin: 0;
    padding: 0;
    top: 0;
    width: 100vw;
    box-sizing: border-box;
    position: fixed;
    li {
        list-style-type: none;
    }
}

.material-symbols-outlined {
    font-size: 12px;
    margin: 0 .3rem 0 0;
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 20
}

#content {
    margin-top: 3rem;
    margin-left: 1rem;
}

.clearfix::after {
  content: "";
  clear: both;
  display: table;
}


body {
    margin: 0;
    padding: 0;
}

`;
        document.head.appendChild(style);
    }, 100);
})();


