// ** Paginator Constructor **
function Paginator(args) {
    this.sourceList = document.querySelectorAll(`${args.list} > li`);
    this.index = 1;
    this.limitOptions = args.limitOptions || [5, 10, 15, 50, 100, 150, 200, 250];
    this.limit = this.limitOptions[1];
    this.newListTarget = document.querySelector(args.newListTarget);
    this.controlsTarget = document.querySelector(args.controlsTarget);
    this.newList = document.createElement('div');
    this.displayedItems = document.createElement('ul');
    this.displayedItems.classList.add('paginatorOutputList');
    this.controls = document.createElement('div');
    this.controls.innerHTML = `
        <div class="pageLimitControl">
            <span>Items per page</span>
            <select class="limitSelect browser-default"></select>
        </div>
        <div class="shownResults"></div>
        <div class="pageControl">
            <select class="pageSelect browser-default"></select>
            <span class="pageCount"></span>
            <button class="pageControl-btn prevPage">&#10216;</button>
            <button class="pageControl-btn nextPage">&#10217;</button>
        </div>
    `;
    this.controls.classList.add('paginatorControls');
    this.pageCount = 0;
    this.currentShownResults = this.controls.querySelector('.shownResults');
    this.limitSelect = this.controls.querySelector('.limitSelect');
    this.pageSelect = this.controls.querySelector('.pageSelect');
    this.pageControlBtns = this.controls.querySelectorAll('.pageControl-btn');
}

// ** Take Specified Target List and Pre-process **
Paginator.prototype.buildList = function () {
    let transDelay = 0,
        transDelayIncrement = 50;

    this.displayedItems.innerHTML = '';
    this.pageCount = Math.ceil(this.sourceList.length / this.limit);

    this.sourceList.forEach(el => {
        this.newList.appendChild(el.cloneNode(true));
    });

    for (let i = (this.index - 1); i < (parseInt(this.index - 1) +
        parseInt(this.limit)); i++) {
        if (this.sourceList.item(i)) {
            this.sourceList.item(i).classList.add('paginatedListItem');
            this.sourceList.item(i).style.animationDelay = `${transDelay}ms`;
            transDelay += transDelayIncrement;
            this.displayedItems.appendChild(this.sourceList.item(i).cloneNode(true));
        }
    }

    this.currentShownResults.innerText = `${this.index} - ${parseInt(this.index - 1) + parseInt(this.limit) > this.sourceList.length ? this.sourceList.length : parseInt(this.index - 1) + parseInt(this.limit)} of ${this.sourceList.length} items`;
}

// ** Build Page Limiter DOM and HTML/innerText Variables **
Paginator.prototype.buildPageLimitControl = function () {
    let limitOption = document.createElement('option');

    for (let i = 0; i < this.limitOptions.length; i++) {
        limitOption.innerText = this.limitOptions[i];
        limitOption.value = this.limitOptions[i];
        limitOption.defaultSelected = limitOption.value == this.limit ? true : false;
        this.limitSelect.appendChild(limitOption.cloneNode(true));
    }
}

// ** Build Page Controls DOM and HTML/innerText Variables **
Paginator.prototype.buildPageControl = function () {
    let pageControl = this.controls.querySelector('.pageControl'),
        pageOption = document.createElement('option'),
        pageCount = pageControl.querySelector('.pageCount');

    this.pageSelect.innerHTML = '';
    pageCount.innerText = `of ${this.pageCount} pages`;

    for (let i = 0; i < this.pageCount; i++) {
        pageOption.innerText = ((i + 1) + '').padStart(2, '0');
        pageOption.value = (this.index * (i * this.limit) + 1);
        this.pageSelect.appendChild(pageOption.cloneNode(true));
    }

}

// Update Previous/Next Page Buttons
Paginator.prototype.updatepageControlBtns = function () {
    this.pageControlBtns[0].disabled = this.index == 1 ? true : false;
    this.pageControlBtns[1].disabled = (parseInt(this.index) + parseInt(this.limit)) > this.sourceList.length ? true : false;
}

// ** Initiate Event Handlers for Paginator Controls **
Paginator.prototype.initEventHandlers = function () {
    let onChangeEvent = new Event('change');

    this.limitSelect.addEventListener('change', e => {
        this.limit = parseInt(e.target.value);
        this.index = 1;
        this.buildList();
        this.buildPageControl();
        this.updatepageControlBtns();
        this.render();
    });

    this.pageSelect.addEventListener('change', e => {
        this.index = e.target.value;
        this.buildList();
        this.updatepageControlBtns();
        this.render();
    });

    this.pageControlBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            if (e.target.classList.contains('prevPage') &&
                !(this.pageSelect.selectedIndex < 1)) {
                this.pageSelect.selectedIndex--
                this.pageSelect.dispatchEvent(onChangeEvent);
                this.updatepageControlBtns();
            } else if (e.target.classList.contains('nextPage') &&
                (this.pageSelect.selectedIndex + 1) <
                this.pageSelect.length) {
                this.pageSelect.selectedIndex++;
                this.pageSelect.dispatchEvent(onChangeEvent);
                this.updatepageControlBtns();
            }
        });
    });
}

// ** Insert Paginator Elements into Specified DOM Containers **
Paginator.prototype.render = function () {
    this.newListTarget.appendChild(this.displayedItems);
    this.controlsTarget.appendChild(this.controls);
}

// ** Initialize Paginator on Specified List **
Paginator.prototype.init = function () {
    this.buildList();
    this.buildPageLimitControl();
    this.buildPageControl();
    this.updatepageControlBtns();
    this.initEventHandlers();
    this.render();
}
