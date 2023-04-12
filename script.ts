// these will be configurable in the future
const CURSOR_STEPS = [10, 20, 40, 100];
const FAST_MOVE_TIME = 300;
const SLOW_CURSOR_COLOR = 'rgba(255, 255, 0, 0.5)';
const FAST_CURSOR_COLOR = 'rgba(255, 255, 255, 0.5)';
const CURSOR_BORDER_COLOR = 'rgba(0, 0, 0, 1)';
const CURSOR_BORDER_WIDTH = 1;

type Direction = 'up' | 'down' | 'left' | 'right';
const KEY_TO_DIRECTION: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};
let executed = false;
let cursorSpeed = 0;
let lastMoveTime = 0;
let speedResetTimeout: NodeJS.Timeout | null = null;
let lastDirectionX: Direction | null = null;
let lastDirectionY: Direction | null = null;
let mouseCursor: HTMLDivElement | null = null;
let cursorX = 100;
let cursorY = 100;

export function mouse() {
    if (typeof document === 'undefined' || executed) return;

    document.body.appendChild(createMouseCursor());
    
    document.addEventListener('keydown', (e) => {
        const direction = KEY_TO_DIRECTION[e.key];
        const clicked = e.key === 'Enter';

        if (!direction && !clicked) return;

        if (clicked) {
            if (!mouseCursor) return;
            const { top, left } = mouseCursor.getBoundingClientRect();

            const element = document.elementFromPoint(left, top) as HTMLElement;
            if (!element) return;

            element.click();
            setCursorSize('big');

            setTimeout(() => {
                setCursorSize('normal')
            }, 100);
        }

        if (speedResetTimeout) clearTimeout(speedResetTimeout);

        const isDirectionX = direction === 'left' || direction === 'right';

        const delta = Date.now() - lastMoveTime;
        const switchedDirection = isDirectionX 
            ? direction !== lastDirectionX
            : direction !== lastDirectionY;

        if (e.shiftKey) {
            setCursorSpeed(0);
        } else if (delta < FAST_MOVE_TIME) {
            if (switchedDirection) {
                setCursorSpeed(Math.max(cursorSpeed - 2, 0));
            } else {
                setCursorSpeed(Math.min(cursorSpeed + 1, CURSOR_STEPS.length - 1));
            }

            speedResetTimeout = setTimeout(() => setCursorSpeed(0), FAST_MOVE_TIME);
        }
        
        moveCursor(direction);

        lastDirectionX = isDirectionX ? direction : lastDirectionX;
        lastDirectionY = !isDirectionX ? direction : lastDirectionY;
        lastMoveTime = Date.now();
    });

    executed = true;
}

function createMouseCursor() {
    mouseCursor = document.createElement('div');
    mouseCursor.classList.add('mouse-cursor');
    mouseCursor.style.position = 'absolute';
    mouseCursor.style.top = `${cursorY}px`;
    mouseCursor.style.left = `${cursorX}px`;

    mouseCursor.style.width = '12px';
    mouseCursor.style.height = '12px';

    mouseCursor.style.background = 'rgba(255, 255, 0, 0.5)';
    mouseCursor.style.zIndex = '9000';
    
    mouseCursor.style.borderRadius = '50%';
    mouseCursor.style.border = `${CURSOR_BORDER_WIDTH}px solid ${CURSOR_BORDER_COLOR}`;

    mouseCursor.style.transform = 'translate(-50%, -50%)';

    return mouseCursor;
}

function setCursorSpeed(speed: number) {
    if (speed < 0 || speed > CURSOR_STEPS.length - 1) return;
    cursorSpeed = speed;
    setCursorColor(speed === 0 ? SLOW_CURSOR_COLOR : FAST_CURSOR_COLOR);
}

function moveCursor(direction: 'up' | 'down' | 'left' | 'right') {
    const mouseCursor = document.querySelector('.mouse-cursor') as HTMLDivElement;
    if (!mouseCursor) return;

    switch (direction) {
        case 'up':
            cursorY -= CURSOR_STEPS[cursorSpeed];
            break;
        case 'down':
            cursorY += CURSOR_STEPS[cursorSpeed];
            break;
        case 'left':
            cursorX -= CURSOR_STEPS[cursorSpeed];
            break;
        case 'right':
            cursorX += CURSOR_STEPS[cursorSpeed];
            break;
    }

    if (cursorY < 0) cursorY = 0;
    if (cursorX < 0) cursorX = 0;
    if (cursorY > window.innerHeight) cursorY = window.innerHeight;
    if (cursorX > window.innerWidth) cursorX = window.innerWidth;

    mouseCursor.style.top = `${cursorY}px`;
    mouseCursor.style.left = `${cursorX}px`;
}

function setCursorColor(color: string) {
    if (mouseCursor) {
        mouseCursor.style.background = color;
    }
}

function setCursorSize(size: 'normal' | 'big') {
    if (mouseCursor) {
        mouseCursor.style.width = `${size === 'big' ? 20 : 12}px`;
        mouseCursor.style.height = `${size === 'big' ? 20 : 12}px`;
    }
}
