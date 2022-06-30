class LamaScrollEventListener {

    static eventTimeout = 500;
    static isEventInProgress = false;
    static isAuxClick = false;
    static touchpadOption = {
        isWheelInProgress: false,
        direction: null,
        timeoutId: null,
    }
    static keys = {
        next: ['ArrowDown', 'PageDown'],
        prev: ['ArrowUp', 'PageUp']
    }

    static setEventTimeout = (ms) => {
        this.eventTimeout = ms;
    }

    static init({ element = document } = { element: document }) {

        const events = [
            'wheel',
            'keydown',
            'mousedown',
            'mouseup',
            'auxclick',
            'mousemove'
        ];

        const options = { passive: false };

        events.forEach(event => {
            element.addEventListener(
                event,
                this[`on${event}`],
                options
            );
        })

    }



    static onnext = () => {
        console.log('Lama got NEXT event!');
        return new Promise(res => {
            setTimeout(() => { res(200) }, this.eventTimeout);
        })
    };

    static onprev = () => {
        console.log('Lama got PREV event!');
        return new Promise(res => {
            setTimeout(() => { res(200) }, this.eventTimeout);
        })
    };

    static onwheel = (e) => {

        e.preventDefault();

        if (this.isEventInProgress) return;

        const direction = this.getDirection(e.deltaY);

        if (this.isTouchpad(e)) {
            this.ontouchpadwheel(e);
            return;
        }

        this.executeEventFunction(direction);
    }

    static onkeydown = async (e) => {

        const direction = this.getDirectionByKeyCode(e.code);

        if (!direction) return;

        e.preventDefault();

        if (this.isEventInProgress) return;

        this.executeEventFunction(direction);
    }

    static executeEventFunction = async (direction) => {

        if (typeof this[`on${direction}`] !== 'function') {
            return;
        }

        this.isEventInProgress = true;
        await this[`on${direction}`]();
        this.isEventInProgress = false;
    }

    static onmousedown = (e) => {

        if (e.button !== 1) return;

        e.preventDefault();
        this.isAuxClick = true;
    }

    static onmouseup = (e) => {

        if (e.button !== 1) return;

        this.isAuxClick = false;
        e.preventDefault();
    }

    static onmousemove = (e) => {

        if (this.isEventInProgress) return;
        if (!this.isAuxClick) return;

        const direction = this.getDirection(e.movementY);

        if (!direction) return;

        this.executeEventFunction(direction);
    }

    static onauxclick = (e) => {
        e.preventDefault();
    }

    static isTouchpad = (e) => {
        return ![100, -100].includes(e?.deltaY);
    }

    static ontouchpadwheel = (e) => {

        if (this.isDirectionChangedBeforeEventEnds(e.deltaY)) {
            console.log(e.deltaY);
            this.touchpadOption.direction = this.getDirection(e.deltaY);
        }

        if (!this.touchpadOption.isWheelInProgress) {

            const direction = this.getDirection(e.deltaY);

            this.touchpadOption.isWheelInProgress = true;
            this.touchpadOption.direction = direction;
            this.touchpadOption.timeoutId = setTimeout(() => {
                this.touchpadOption.isWheelInProgress = false
            }, this.eventTimeout);

        } else {

            clearTimeout(this.touchpadOption.timeoutId);
            this.touchpadOption.timeoutId = setTimeout(() => {
                this.touchpadOption.isWheelInProgress = false
            }, this.eventTimeout);

            if (e.deltaY === -0) {
                this.executeEventFunction(this.touchpadOption.direction);
                return;
            }

        }

    }

    static isDirectionChangedBeforeEventEnds = (delta) => {
        return (this.touchpadOption.direction === 'next'
            && Math.sign(delta) === -1)
            ||
            (this.touchpadOption.direction === 'prev'
                && Math.sign(delta) === 1);
    }

    static getDirection(delta) {
        return delta > 0 ? 'next' : 'prev';
    }

    static getDirectionByKeyCode(code) {
        return this.keys.next.includes(code) ? 'next' :
            this.keys.prev.includes(code) ? 'prev' : null;
    }
}

