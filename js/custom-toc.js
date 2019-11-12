window.addEventListener("load", function initSideNav() {
    // define new general elements in TOC
    let toc = document.querySelector('nav[role="toc"]'),
        ditaSearchJS = document.createElement('script'),
        ditaSearchSubmit = document.createElement('input'),
        ditaSearchClear = document.createElement('button'),
        resizeHandle = document.createElement('div'),
        contentWrap = document.querySelector('.contentWrap'),
        mainHelpArea = document.querySelector('main[role="main"]'),
        articleArea = document.querySelector('article[role="article"]'),
        mainFooter = document.querySelector('footer[role="contentinfo"]'),
        firstTOCLink = toc.querySelector('a').href,
        headerNavMenu = document.querySelector('header[role="header"] .hcl-nav-menu'),
        openTOCBtn = document.querySelector('#openTOCBtn'),
        closeTOCBtn = document.querySelector('#closeTOCBtn'),
        navLinks = {};

    let hamburgerFirstItem = document.createElement('li');
    let navMenuItem = document.createElement('a');
    navMenuItem.id = 'navMenuItem';
    navMenuItem.href = 'javascript:void(0)';
    navMenuItem.style.width = '100%';
    navMenuItem.style.textAlign = 'right';
    navMenuItem.innerHTML = '&#9776;';

    navMenuItem.addEventListener('click', function () {
        var headerNavMenuItem = document.querySelector('header[role="header"] .hcl-nav-menu');

        if (headerNavMenuItem.classList.contains('shownMenu')) {
            headerNavMenuItem.classList.remove('shownMenu');
        } else {
            headerNavMenuItem.classList.add('shownMenu');
        }
    });

    hamburgerFirstItem.classList.add('hambergerStyle');
    hamburgerFirstItem.appendChild(navMenuItem);
    // hamburgerFirstItem.innerHTML = "<a id='navMenuItem' href='javascript:void(0);' style='font-size:15px;' class='icon' onclick='myFunction()'>&#9776;</a>";
    headerNavMenu.insertBefore(hamburgerFirstItem, headerNavMenu.childNodes[0]);

    // add attr and classes to new elements
    ditaSearchJS.src = `../ditasearch.js`;
    ditaSearchSubmit.type = 'submit';
    resizeHandle.id = 'resizeHandle';
    resizeHandle.title = 'Drag to resize';

    // custom ditasearch bar elements and attr
    ditaSearchSubmit.value = '';
    ditaSearchSubmit.classList.add('ditaSearchSubmit');
    ditaSearchSubmit.setAttribute("aria-label", "search")
    ditaSearchClear.classList.add('ditaSearchClearBtn');
    ditaSearchClear.id = 'ditaSearchClear';

    // insert elements in side-nav
    toc.insertBefore(resizeHandle, toc.firstElementChild);

    // insert and initialize ditasearch in running footer
    mainFooter.appendChild(ditaSearchJS);

    // TOC resizer handler
    ! function tocResizeHandler() {
        let mouse = { x: 0, d: false },
            resizeMove = function resizeMove(e) {
                if (mouse.d) {
                    mouse.x = e.clientX;
                    toc.style.width = `${mouse.x}px`;
                    contentWrap.style.marginLeft = `${mouse.x}px`;
                }
            }

        resizeHandle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            mouse.d = true;
            mouse.dStart = e.clientX;
            resizeHandle.classList.add('active');

            document.addEventListener('mousemove', resizeMove, false);
        });

        document.addEventListener('mouseup', function (e) {
            mouse.d = false;
            document.removeEventListener('mousemove', resizeMove);
            resizeHandle.classList.remove('active');
        });
    }();

    // Open and close buttons for TOC/Sidenav
    closeTOCBtn.addEventListener('click', function () {
        tocNav._handleTOCAction({ action: 'close' });
    });

    openTOCBtn.addEventListener('click', function () {
        tocNav._handleTOCAction({ action: 'open' });
    });

    // modify ditasearch object for bug fixing and/or augmenting features
    ! function modifyDitaSearch() {
        // wait for ditasearch to be defined
        if ("ditasearch" in window) {
            // initialize copy of original ditasearch code and get ditasearch side-nav elements
            let origCode = {},
                ditaSearchInput = document.querySelector('.ditasearch input[type=text]'),
                tocList = document.querySelector('nav[role="toc"] > ul'),
                searchResultsTitle = document.createElement('div'),
                seeAllResults = document.createElement('div'),
                resultsModal = document.createElement('div'),
                resultsModalBG = document.createElement('div'),
                ditaSearchResultsList = document.querySelector('.ditasearch nav ol'),
                modalTemplate = `
                    
                    <div class="searchModalHeader">
                        <h6 class="seeAllSearchTitle">Search results</h6>
                        <i aria-label="close search results" title="close search results" tabindex="0" id="closeResultsModal">&times;</i>
                    </div>
                    <div id="seeAllSearchList"></div>
                    <nav id="seeAllSearchControls"></nav>
                `,
                addSearchResultsElements = function () {
                    // update var to check if node exists
                    ditaSearchResultsList = document.querySelector('.ditasearch nav ol');
                    if (ditaSearchResultsList) {
                        ditaSearchResultsList.insertBefore(searchResultsTitle, ditaSearchResultsList.firstChild);
                        ditaSearchResultsList.appendChild(seeAllResults);
                    }
                };

            // Store ditasearch original functions
            Object.assign(origCode, {
                ditasearch: {
                    search: ditasearch.search
                }
            });

            // Extend ditasearch search method
            ditasearch.search = function () {
                origCode.ditasearch.search.call();
                addSearchResultsElements();
            }

            // Initialize resultsModal template
            resultsModal.innerHTML = modalTemplate;

            // Add HTML class to modal and its BG overlay
            searchResultsTitle.classList.add('searchResultsTitle');
            resultsModal.classList.add('searchResultsModal');
            resultsModalBG.classList.add('searchResultsModalBG');

            // insert custom searchbar icon and clear button
            ditasearch.div.appendChild(ditaSearchClear);
            ditasearch.div.appendChild(ditaSearchSubmit);

            // See all search results custom anchor (bottom of search bar results)
            searchResultsTitle.innerHTML = `<h6>Search Results</h6>`
            seeAllResults.innerHTML = `<span tabindex="0" class="seeAllResultsText waves-effect waves-hcl" aria-label="see all search results">VIEW ALL</span>`
            seeAllResults.id = 'seeAllResults';

            // custom clearsearch function
            ditaSearchClear.onclick = function () {
                ditaSearchInput.value = '';
                ditasearch.results.clear();
            }

            // custom submit button function
            ditaSearchSubmit.onclick = function () {
                ditasearch.search();
            }

            // See all search results on-click functionality
            seeAllResults.querySelector('.seeAllResultsText').addEventListener('click', e => {
                // Timeout/async function call required for default ditasearch hide method to work
                setTimeout(() => {
                    ditasearch.results.hide();
                }, 1);

                // Render modal main  help/document area
                contentWrap.appendChild(resultsModalBG);
                contentWrap.appendChild(resultsModal);
                // Set help/documentation area to 'overflow: hidden 'with utility class
                mainHelpArea.classList.add('hideOverflow');

                // Init/reset modal contents
                resultsModal.innerHTML = modalTemplate;

                // Get this instance's close modal button
                let closeModal = resultsModal.querySelector('#closeResultsModal');

                // Bind/re-bind close function to close modal button and backdrop
                [resultsModalBG, closeModal].forEach(el => {
                    el.addEventListener('click', e => {
                        resultsModal.remove();
                        resultsModalBG.remove();
                        // Remove 'overflow: hidden' utility class from help/doc area
                        mainHelpArea.classList.remove('hideOverflow');
                    });
                });

                // Instantiate custom paginator
                var searchResults = new Paginator({
                    list: '.ditasearch nav ol',
                    newListTarget: '#seeAllSearchList',
                    controlsTarget: '#seeAllSearchControls',
                });

                // Extend custom paginator's buildList method and bind
                // SPA behavior to  paginator-displayed <a> elements
                searchResults.buildList = function () {
                    Paginator.prototype.buildList.call(this);
                    setTimeout(() => {
                        spaAnchorInit(resultsModal);
                    }, 1);
                }

                // Initialize custom paginator
                searchResults.init();

                // Focus first search results in modal
                resultsModal.querySelector('a').focus();

                //if any link  in the result set is clicked, close resultsModal
                let hrefs = resultsModal.querySelectorAll('a');
                if (hrefs) {
                    hrefs.forEach(el => {
                        el.addEventListener('click', e => {
                            resultsModal.remove();
                            resultsModalBG.remove();
                            mainHelpArea.classList.remove('hideOverflow');
                        });
                    });
                }
            });

            // SPA behavior for search results
            ['keyup', 'click'].forEach(function (ev) {
                ditaSearchInput.addEventListener(ev, function () {
                    setTimeout(function () {
                        // Update search results node
                        ditaSearchResultsList = document.querySelector('.ditasearch nav ol');

                        // Disable 'see all results' if no topics found
                        if (ditaSearchResultsList && ditaSearchResultsList.querySelector('a')) {
                            seeAllResults.querySelector('span').classList.remove('disabled');
                        } else {
                            seeAllResults.querySelector('span').classList.add('disabled');
                        }

                        // Attach SPA behavior to search results
                        spaAnchorInit(ditasearch.div.results);

                        // Add additional elements to ditasearch input results
                        addSearchResultsElements();
                    }, 500)
                })
            });
        } else {
            setTimeout(modifyDitaSearch, 100);
        }
    }();

    // Make sure side navigation reflects the current selected page
    function syncToc(selectedNavID) {

        // Clear existing selected page selector
        document.querySelectorAll('nav[role="toc"] .selected').forEach(elem => {
            elem.classList.remove('selected');
            elem.blur();
        });

        const openParentMenus = function (node) {
            const walkUp = function (node, menuNodes) {
                if (node.tagName === 'BODY') {
                    //went too far
                    return menuNodes;
                } else {
                    if (node.classList.contains('tocSubMenu')) {
                        //try to protect against markup changes
                        node.parentElement.childNodes.forEach(function (elem) {
                            if (elem.tagName === 'I') {
                                menuNodes.push(elem)
                                //keep looking for parent menus
                                walkUp(node.parentElement, menuNodes);
                            }
                        });
                    } else {
                        walkUp(node.parentElement, menuNodes);
                    }
                }
                return menuNodes;
            }

            //menu height is dynamically calculated so need to open parent menus first.
            walkUp(node, []).reverse().forEach(function (menu) {
                if (!menu.classList.contains('isOpen') && menu.click) {
                    menu.click();
                }
            })
        }

        selectedNavID = selectedNavID || navLinks[tocNav.getCurrentPage()];

        if (selectedNavID) {
            let navElem = document.getElementById(selectedNavID);
            navElem.classList.add('selected');
            openParentMenus(navElem);
            tocNav.scrollToc(navElem);

            // Scroll into view after a set delay
            setTimeout(function () {
                navElem.scrollIntoView(true);
            }, 500)
        }

    }

    // initiate treeview collapse/expand features
    ! function initTreeview() {
        let links = document.querySelectorAll('nav[role="toc"] > ul li'),
            chevronIcon = document.createElement('i'),
            currentPage = tocNav.getCurrentPage(),
            selected = null;

        // add html class names to new icons
        chevronIcon.classList.add('tocChevronIcon');

        //add tabindex attribute to chevronIcon to make it focusable
        chevronIcon.tabIndex = 0;

        // add aria-label to chevron icons
        chevronIcon.setAttribute("aria-label", "collapsible directory")

        // function to determine if link is a parent link
        function isParentLink(link) {
            let isParent;

            // detect if list contains another list indicating a parent link
            link.childNodes.forEach(function (child) {
                if (child.nodeType === 1 && child.tagName === 'UL') {
                    isParent = true;
                    child.classList.add('tocSubMenu');
                }
            });

            return isParent;
        }

        // loop through each link and apply changes if determined to be parent
        links.forEach(function (link, index) {

            link.querySelectorAll('a').forEach(function (innerLink, innerIndex) {
                innerLink.id = 'nav-item-' + index + '-' + innerIndex;  //set the ID of the link to make syncing the toc easier.
            })
            if (isParentLink(link)) {
                // get parent link main anchor node
                let parentANode = link.querySelector('a');

                // add html class name to parent link
                link.classList.add('parentLink');

                // insert chevron/arrow icon before each parent
                parentANode.after(chevronIcon.cloneNode(true));
            }
        });

        //cache nav links to improve performance.
        document.querySelectorAll('nav[role="toc"] a').forEach(anchor => {
            let href = anchor.href;
            if (href)
                //if there are duplicate links on initial load the first one wins.
                if (!navLinks[href]) {
                    //look for id;
                    navLinks[href] = anchor.id;

                    if (href === currentPage) {
                        selected = navLinks[href];
                        anchor.focus();
                    }
                }
        })

        // Add expand/collapse functionality to chevron icon
        let chevronIcons = toc.querySelectorAll('.tocChevronIcon'),
            subMenus = toc.querySelectorAll('.tocSubMenu'),
            subMenuExpandToggle = toc.querySelector('#TOCExpandToggle');

        // Set sub-menu to height: auto upon transition end to accomodate dynamic content height
        setHeightAuto = function (e) {
            let icon = e.target.parentElement.querySelector('.tocChevronIcon'),
                subMenu = e.target.parentElement.querySelector('.tocSubMenu');
            if (icon.classList.contains('isOpen')) {
                subMenu.style.height = `auto`;
                subMenu.style.overflow = 'visible';
            } else {
                subMenu.style.display = 'none';
                subMenu.style.overflow = 'hidden';
            }
        },

            // Expand a target sub-menu
            expandSubMenu = function (e) {
                let subMenu = e.target.parentElement.querySelector('.tocSubMenu');

                subMenu.addEventListener('transitionend', setHeightAuto, true);
                subMenu.style.display = 'block';
                subMenu.style.height = `${subMenu.scrollHeight}px`;
            },

            // Collapse a target sub-menus
            collapseSubMenu = function (e) {
                subMenu = e.target.parentElement.querySelector('.tocSubMenu');

                subMenu.removeEventListener('transitionend', setHeightAuto);
                subMenu.style.height = `${subMenu.scrollHeight}px`;
                setTimeout(function () {
                    subMenu.style.height = 0;
                }, 1);
            },

            // Expand all sub-menus
            expandAllSubMenus = function () {
                chevronIcons.forEach(function (icon) {
                    icon.classList.add('isOpen');
                });

                subMenus.forEach(function (subMenu) {
                    subMenu.addEventListener('transitionend', setHeightAuto, true);
                    subMenu.style.display = 'block';
                    subMenu.style.height = `${subMenu.scrollHeight}px`;
                })
            },

            // Expand all sub-menus
            collapseAllSubMenus = function () {
                chevronIcons.forEach(function (icon) {
                    icon.classList.remove('isOpen');
                });

                subMenus.forEach(function (subMenu) {
                    subMenu.removeEventListener('transitionend', setHeightAuto);
                    subMenu.style.height = `${subMenu.scrollHeight}px`;
                    setTimeout(function () {
                        subMenu.style.height = 0;
                    }, 1);
                })
            };

        // Expand / collapse all sub-menus for toggle button
        subMenuExpandToggle.addEventListener('change', function (e) {
            if (e.target.checked) {
                // Collapse prior to opening to refresh menu flow
                collapseAllSubMenus();
                // Expand menus delay to provide time window for flow refresh
                setTimeout(function () {
                    expandAllSubMenus();
                }, 100)
            } else {
                collapseAllSubMenus();
            }
        })

        // Expand / collapse sub-menus for toggle button
        chevronIcons.forEach(function (icon) {
            icon.addEventListener('click', function toggleSubMenu(e) {
                // define elements and variables
                let subMenu = e.target.parentElement.querySelector('.tocSubMenu');

                // Toggle icon class
                icon.classList.toggle('isOpen');

                // Expand sub-menu if applicable
                if (icon.classList.contains('isOpen')) {
                    expandSubMenu(e);
                    icon.setAttribute("aria-label", "expanded directory")
                } else {
                    collapseSubMenu(e);
                    icon.setAttribute("aria-label", "collapsible directory")
                }
            });
        });

        syncToc(selected);
    }();

    // Push initial state into history - required to prevent a null history state on initial page load
    history.replaceState(location.href, null, location.href);

    // SPA (single-page app feature) - only works with links within same domain
    function loadQueryParam(sVar) {
        return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    function getMainArticle(e) {
        let xhr = new XMLHttpRequest(),
            validLink = e.target,
            articleContent = document.createElement('div'),
            selectedNavID = e.target.id;

        if (e.type === 'popstate') {
            url = e.state
        } else {
            url = validLink.href;
            history.pushState(url, null, url);
        }

        if (validLink) {
            e.preventDefault();
        }

        // Insert loader in main help area
        articleArea.innerHTML = ` 
            <div class="article-loader preloader-wrapper big active">
                <div class="spinner-layer spinner-blue-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div><div class="gap-patch">
                        <div class="circle"></div>
                    </div><div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>`

        xhr.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {

                articleContent.innerHTML = this.responseText;
                articleContent = articleContent.querySelector('article[role="article"]');

                //to fix page layout problems, add class responsive-img to images so that it will resize based on screen
                let imagesInArticle = articleContent.querySelectorAll('img');
                if (imagesInArticle) {
                    imagesInArticle.forEach(img => {
                        img.classList.add('responsive-img');
                    })
                }

                //to fix page layout problems, add class responsive-video to videos so that it will resize based on screen
                let videosInArticle = articleContent.querySelectorAll('video');
                if (videosInArticle) {
                    videosInArticle.forEach(video => {
                        video.classList.add('responsive-video');
                    })
                }

                articleContent = articleContent.innerHTML;

                loadLinkInMain(articleContent, url, validLink, selectedNavID);
                //update the page title upon loading a new article
                let responseHTML = document.createElement('html');
                responseHTML.innerHTML = this.responseText;
                if (responseHTML && responseHTML.querySelector('title')) {
                    document.title = responseHTML.querySelector('title').text;
                }
            }
        };

        xhr.open("GET", url, true);
        xhr.send();
    }

    function loadLinkInMain(htmlData, url, validLink, selectedNavID) {
        setTimeout(function () {

            articleArea.innerHTML = htmlData;
            spaAnchorInit(articleArea);

        }, 500);

        //new page loaded,  need to make sure nav is updated
        syncToc(selectedNavID);
    }

    function spaAnchorInit(el) {
        
        let disableSinglePage = false; // This will be set on build to true if -DdisableSinglePage=yes is set in dita parameter
        if(disableSinglePage === false) {
            let links = el.querySelectorAll('a');

            if (loadQueryParam("sp")) {
                sessionStorage.setItem("isSinglePage", loadQueryParam("sp"));
            }
 
            // Query parameter is evaluated as a string. This check is required to see if it has been set (being unset defaults to true)
            if (sessionStorage.getItem("isSinglePage") === "true" || !sessionStorage.getItem("isSinglePage")) {
                isSinglePage = true;
            } else {
                isSinglePage = false;
            }
    
            links.forEach(function (link) {
                if (link.href.match(`${location.origin}`) && isSinglePage && isNotDXInterVersion(link.href)) {
                    link.addEventListener('click', getMainArticle);
                }
            });
        }
        createBreadcrumbs();
    }

    ! function historySPAHandler() {
        window.addEventListener('popstate', function (e) {
            getMainArticle(e);
        }, true)
    }();

    //function to make elements clickable by using keyboard 'spacebar'
    window.onkeypress = function (event) {
        if (event.keyCode === 32 && event.target.classList.contains('tocChevronIcon')) {
            event.preventDefault();
            document.activeElement.click();
        }
    };

    // Bind SPA event to anchor within same domain on document load
    spaAnchorInit(document);

    // Open or close TOC based on stored setting
    if (window.localStorage.getItem('TOCisOpen') === 'true') {
        toc.classList.toggle('isShown', true);
        tocNav.adjustOnTOCOpen();
    } else {
        toc.classList.toggle('isShown', false);
        tocNav.adjustOnTOCClose();
    }
});

// TOC Functions
var tocNav = {
    adjustOnTOCOpen: function () {
        this._handleTOCAction({
            action: 'open'
        })
    },

    adjustOnTOCClose: function () {
        this._handleTOCAction({
            action: 'close'
        })
    },

    _handleTOCAction: function (params) {
        let open = (params.action === 'open') ? true : false;

        document.querySelector('nav[role="toc"]').classList.toggle('isShown_toc', open);
        document.querySelector('nav[role="toc"]').classList.toggle('isShown', open);
        document.querySelector('article[role="article"]').classList.toggle('isShown_article', open);
        document.querySelector('.mainContentBanner__productBranding').classList.toggle('isShown_banner', open);
        document.querySelector('.contentWrap').style.marginLeft = (open) ? document.querySelector('nav[role="toc"]').clientWidth + 'px' : '0';
        document.querySelector('.contentWrap .TOCBannerToggle').style.display = (open) ? 'none' : 'flex';

        // Store TOC open/close state
        window.localStorage.setItem('TOCisOpen', open);

        // Scroll to current topic in sidenav upon closing or opening of TOC
        this.scrollToc(null);
    },

    // Normalize getting the current url
    getCurrentPage: function () {
        // Solution to no query parameter support in IE
        return location.href.split('?')[0].split('#')[0];
    },

    scrollToc: function (navElem) {
        navElem = navElem || document.querySelector('nav[role="toc"] > ul .selected');
        let tocList = document.querySelector('nav[role="toc"] > ul');
        navElem.scrollIntoView(true);
    }
}

function isNotDXInterVersion(linkHref) {
    // This method is for DX doc for handling inter version links.
    // Cliking the link will refresh the whole page.
    let isDXdoc = false; // This will be set on build to true if -DisDxDoc=yes is set in dita parameter.
    if (isDXdoc === true) {
        let versionSectionRX = /\/(\d{1,}|d)(\.|x)(\d{1,}|\/)/g;
        return document.location.pathname.match(versionSectionRX)[0] === linkHref.match(versionSectionRX)[0];
    }

    return true; // always return true if not DX doc set.
}


function createBreadcrumbs() {

    const exists = !!document.getElementsByClassName('breadcrumbs').length;

    if (exists) {
        return;
    }

    let TOC_CLASSNAME = "browser-default"

    let targetATags = [];

    let tocNav = document.getElementsByClassName(TOC_CLASSNAME)[0];

    if (!tocNav) {
        console.error(`The table of content with ${TOC_CLASSNAME} class name is not present.`);
        return;
    }

    let tocUl = tocNav.getElementsByTagName('ul')[0];

    if (!tocUl) {
        console.error(`The main toc 'ul' tag does not exist.`);
        return;
    }

    let tocATags = tocUl.getElementsByTagName('a');

    if (!tocATags.length) {
        console.error(`There are no links at the table of content.`);
        return;
    }

    let rootATag = tocATags[0];

    let urlATag;

    console.log(window.location.href);
    for (let aTag of tocATags) {
        if (window.location.href.includes(aTag.href)) {
            urlATag = aTag;
            break;
        }
    }

    if (urlATag) {
        let targetATag = urlATag;
        while (targetATag.href !== rootATag.href) {
            let nextParentTag = targetATag.parentNode.parentNode.parentNode;
            if (nextParentTag.tagName = "LI") {
                targetATag = nextParentTag.getElementsByTagName('a')[0];
                if (targetATag) {
                    targetATags.push(targetATag);
                } else {
                    break;
                }
            }
        }
    } else {
        console.error('urlATag does not exist.');
    }

    let article = document.getElementsByTagName('article')[0];

    if (!article) {
        console.error(`'article' tag is missing.`);
        return;
    }

    let breadcrumbsDivTag = document.createElement('div');
    breadcrumbsDivTag.setAttribute('class', 'breadcrumbs');
    article.insertBefore(breadcrumbsDivTag, article.childNodes[0]);
    let _breadcrumbsDivTag = document.getElementsByClassName("breadcrumbs")[0];
    if (!_breadcrumbsDivTag) {
        console.error('Breadcrumbs div tag not present');
        return;
    }
    targetATags.reverse().forEach(function (aTag, index, aTagArray) {
        createBreadcrumb(_breadcrumbsDivTag, aTag, index, aTagArray.length - 1);
    });
}

function createBreadcrumb(breadcrumbsDivTag, aTag, index, count) {
    let spanTag = document.createElement("span");
    let spanVal = document.createTextNode(" | ");
    let anchorTag = document.createElement("a");
    if (index < count) {
        spanTag.appendChild(spanVal);
        anchorTag.setAttribute('href', aTag.href);
        anchorTag.innerHTML = aTag.text;
        breadcrumbsDivTag.appendChild(anchorTag);
        breadcrumbsDivTag.appendChild(spanTag);
    } else {
        anchorTag.setAttribute('href', aTag.href);
        anchorTag.innerHTML = aTag.text;
        breadcrumbsDivTag.appendChild(anchorTag);
    }
}