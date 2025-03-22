// ==UserScript==
// @name 		Dreamwidth Update Page Fix
// @namespace	http://tampermonkey.net/
// @version	  	2024-07-17
// @description See https://github.com/mapsedge/dreamwidth-monkey-update/blob/main/README.md for full details
// @author	   	Bill in KCMO
// @match		https://www.dreamwidth.org/*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=dreamwidth.org
// @grant		none
// ==/UserScript==

function tm_savedraft (){
	const doc = window.document;
	console.log(window);
	console.log(document);
	console.log(doc);
	const s = doc.querySelector('select#security');
	console.log(s);
}


(function () {

//	const Site = Site;
//	const user = Site.currentJournal;
    let $j = jQuery.noConflict();

	var dw_tampering = (function () {

		// defined within the local scope
		var privateMethod1 = function () { /* ... */ }
		var privateProperty1 = 'foobar';

		return {

			//nested namespace with public properties
			properties:{
				publicProperty1: privateProperty1
			},
			//--------------------------------------------------------------------------------
			getFormattedTimestamp: function() {
				let now = new Date();
				return now.getFullYear().toString().slice(2) +
				String(now.getMonth() + 1).padStart(2, '0') +
				String(now.getDate()).padStart(2, '0') +
				String(now.getHours()).padStart(2, '0') +
				String(now.getMinutes()).padStart(2, '0') +
				String(now.getSeconds()).padStart(2, '0');
			},
			//--------------------------------------------------------------------------------
			loadImageList: async function(imgtxt, okayButton){
                // Wait for getImageList to finish
                let images = await dw_tampering.getImageList();

                // Convert imgtxt to a DOM element
                imgtxt = typeof imgtxt === "string" ? document.querySelector(imgtxt) : imgtxt;

                // Create dropdown button
                let b = document.createElement("span");
                b.className = "material-symbols-outlined dw-span-dropdown";
                b.id = "dw-span-dropdown";
                b.textContent = "arrow_drop_down";

                // Click event to open dropdown
                b.addEventListener("click", () => {
                    document.querySelector("#dw-images-dropdown")?.classList.add("open");
                });

                // Append dropdown button to parent
                let a = imgtxt.parentElement;
                a.appendChild(b);

                // Get elements
                imgtxt = document.querySelector("#txtURL");
                let btn = document.querySelector("#dw-span-dropdown");

                // Access parent document
                let parentDoc = window.parent.document;
                let btnOk = parentDoc.querySelector("#btnOk");

                // Get imgtxt position within its parent
                let rect = imgtxt.getBoundingClientRect();

                // Position btn at the upper-right corner of imgtxt
                btn.style.position = "absolute";
                btn.style.right = "10px";
                btn.style.top = "16px";

                // Create dropdown menu
                let ul = document.createElement("ul");
                ul.id = "dw-images-dropdown";
                ul.className = "dropdown-default";

                // Populate dropdown
                images.forEach((image) => {
                    let li = document.createElement("li");
                    li.textContent = image.title;
                    li.setAttribute("value", image.href);
                    ul.appendChild(li);

                    // Click event for dropdown items
                    li.addEventListener("click", function () {
                        imgtxt.value = this.getAttribute("value");
                        imgtxt.dispatchEvent(new Event("blur"));
                        document.querySelector("#txtAlt").value = this.textContent;
                        ul.classList.remove("open");

                        console.log("[619794] btnOk", btnOk);
                        if (btnOk) {
                            btnOk.style.display = "block";
                            btnOk.style.visibility = "visible";
                        }
                    });
                });

                // Append dropdown to parent
                a.appendChild(ul);
                dw_tampering.getNewStyles(a);

			},
			//--------------------------------------------------------------------------------
			getImageList: async function() {
				return fetch('/file/list')
				.then(response => response.text())
				.then(html => {
					let parser = new DOMParser();
					let doc = parser.parseFromString(html, 'text/html');
					let inputs = doc.querySelectorAll("#media-list .embed.row .embed-thumb input[type=text]");
					return Array.from(inputs).map(input => {
						let div = document.createElement('div');
						div.innerHTML = input.value;
						let a = div.querySelector('a');
						let img = div.querySelector('img');
						return a && img ? { title: img.title, href: a.href } : null;
					}).filter(item => item);
				});
			},
			//--------------------------------------------------------------------------------
			getNewStyles: function (after){
				let datestr = dw_tampering.getFormattedTimestamp();
				let url = "https://raw.githubusercontent.com/mapsedge/dreamwidth-monkey-update/refs/heads/main/dreamwidth2025.css?" + datestr;
				fetch(url)
				.then(response => response.text())
				.then(css => {
					let style = document.createElement("style");
					style.textContent = css;
					if(after) {
						after.append(style);
					} else {
						document.head.appendChild(style);
					}
				})
				.catch(console.error);

			}


		}

	})();



	//--------------------------------------------------------------------------------
	function defineNewNavbar(oldNavBar) {

		const oldNavLinks = oldNavBar.querySelectorAll('a');
		const oldNav = oldNavBar.closest('div.row');

		// Create the new unordered list and list items
		const nav = document.createElement('nav');
		const ul = document.createElement('ul');
		ul.id = 'tamper-nav';
		ul.classList.add('clearfix');
		nav.classList.add('new-navigation-style');

		// Create new list items using the old links
		ul.appendChild(createListItem(createJournalIconLink()));
		if (!window.location.pathname.includes('/update')) {
			ul.appendChild(createListItem('Post', '', false, 'rate_review', ));
		} else {
			ul.appendChild(createListItem('Save Draft', `#" onclick="tm_savedraft(); return false;`, false, 'save_as', 'tm_savedraft'));
		}

		ul.appendChild(createListItem('Reading Page', oldNavLinks[3].href, false, 'auto_stories'));
		ul.appendChild(createListItem('Search', oldNavLinks[6].href, false, 'search'));
		ul.appendChild(createListItem('Upload', "https://www.dreamwidth.org/file/new", false, 'upload'));

		ul.appendChild(createListItem('Log Out', oldNavLinks[4].href, true, 'logout'));
		ul.appendChild(createListItem('Site Map', oldNavLinks[8].href, true, 'map'));
		ul.appendChild(createListItem('Settings', oldNavLinks[7].href, true, 'settings'));
		nav.appendChild(ul);
		// Replace the existing div[role=navigation] with the new ul
		oldNav.parentElement.replaceChild(nav, oldNav);

		// Create and append the style element
		dw_tampering.getNewStyles();

}


	//--------------------------------------------------------------------------------
	function createJournalIconLink() {
		let a = [];

		let user = Site && Site.user || 'mapsedge';
		a.user = document.createElement("a");
		a.user.classList.add('journalName');
		a.user.classList.add('specialpad');
		a.user.href = `https://${user}.dreamwidth.org/`;
		a.user.innerText = user;
		a.profile = document.createElement("a");
		a.profile.classList.add('specialpad');
		a.profile.href = `https://${user}.dreamwidth.org/profile`;
		let i = document.createElement("img");
		i.src = 'https://www.dreamwidth.org/img/silk/identity/user.png';
		i.alt = '[personal profile]';
		i.classList.add('journalIcon');
		i.classList.add('ContextualPopup');
		i.style.verticalAlign = 'text-bottom';
		a.profile.appendChild(i);
		let c = document.createElement('span');
		c.setAttribute('lj:user', user);
		c.classList.add("ljuser");
		c.appendChild(a.profile);
		c.appendChild(a.user);

		return c;
	}

	//--------------------------------------------------------------------------------
	// Function to create list items with links
	function createListItem(text, href, floatRight = false, icon, fn) {
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
		if(typeof fn != 'undefined') {
			li.onclick = ()=>{
				const doc = window.document;
				const s = doc.querySelector('select#security');
				s.focus();
				s.value = 'private';
				const b = doc.querySelector('input#formsubmit');
				b.click();
				setTimeout(()=>{
					history.back()
				}, 2000);
			};
		}

		return li;
	}



	setTimeout(() => {
		setTimeout(()=>{
			// document.querySelector("#xToolbar > table:nth-child(3) > tbody > tr > td:nth-child(3) > div > img")?.click();
		}
		, 1000);

		'use strict';
		let span = document.querySelector("span[lj\\:user]");
		let user = span ? span.getAttribute("lj:user") : null;
		if(typeof Site == 'undefined') {
			let Site = JSON.parse('{}');
		}

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
		document.head.appendChild(link);

		// Get links from the existing div
		const oldNavBar = document.querySelector('div.row div[role=navigation]');
        if(typeof oldNavBar != 'undefined' && oldNavBar != null) {
            defineNewNavbar(oldNavBar, $j);
        }

		let img = document.querySelector("#tamper-nav img.journalIcon.ContextualPopup");
		if (img) {
			img.style.width = "auto";
		}

		let imgtxt = document.querySelector("#txtUrl");
		if(imgtxt) {
			dw_tampering.loadImageList(imgtxt);
		}

	}, 200);
})();
