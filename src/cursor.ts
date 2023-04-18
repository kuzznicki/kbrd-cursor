// these will be configurable in the future
const CURSOR_STEPS = [10, 20, 40, 100];
const FAST_MOVE_TIME = 300;
const SLOW_CURSOR_COLOR = 'rgba(255, 255, 0, 0.5)';
const FAST_CURSOR_COLOR = 'rgba(255, 255, 255, 0.5)';
const CURSOR_BORDER_COLOR = 'rgba(0, 0, 0, 1)';
const CURSOR_BORDER_WIDTH = 1;

const CLICK_KEY = 'Enter';
const RESET_SPEED_KEY = 'ShiftLeft';
const SCROLL_UP_KEY = 'ArrowUp';
const SCROLL_DOWN_KEY = 'ArrowDown';
const TOGGLE_CURSOR_KEY = 'KeyM';

type Direction = 'up' | 'down' | 'left' | 'right';
const KEY_TO_DIRECTION: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};
let executed = false;
let cursorVisible = false;
let cursorSpeed = 0;
let lastMoveTime = 0;
let speedResetTimeout: number | null = null;
let lastDirectionX: Direction | null = null;
let lastDirectionY: Direction | null = null;
let mouseCursor: HTMLDivElement | null = null;
let cursorX = 100;
let cursorY = 100;

mouse();

function mouse() {
    console.log('start...')
    if (typeof document === 'undefined' || executed) return;

    document.body.appendChild(createMouseCursor());
    
    document.addEventListener('keydown', (e) => {
        if (e.code === TOGGLE_CURSOR_KEY && e.altKey) return toggleCursorVisibility(e);
        if (!cursorVisible) return;

        if (e.code === RESET_SPEED_KEY) {
            e.preventDefault();
            e.stopPropagation();
            setCursorSpeed(0);
        }
        if (e.code === CLICK_KEY && e.altKey) return handleClick(e);
        if (e.code === SCROLL_UP_KEY && e.altKey) return handleScroll(e, 'up');
        if (e.code === SCROLL_DOWN_KEY && e.altKey) return handleScroll(e, 'down');
        
        const direction = KEY_TO_DIRECTION[e.key];
        if (direction) return handleMove(e, direction);
    });

    executed = true;
}

function createMouseCursor() {
    mouseCursor = document.createElement('div');
    mouseCursor.classList.add('mouse-cursor');
    mouseCursor.style.position = 'fixed';
    mouseCursor.style.top = `${cursorY}px`;
    mouseCursor.style.left = `${cursorX}px`;

    mouseCursor.style.width = '12px';
    mouseCursor.style.height = '12px';

    mouseCursor.style.background = SLOW_CURSOR_COLOR;
    mouseCursor.style.zIndex = '9000';
    
    mouseCursor.style.borderRadius = '50%';
    mouseCursor.style.border = `${CURSOR_BORDER_WIDTH}px solid ${CURSOR_BORDER_COLOR}`;

    mouseCursor.style.transform = 'translate(-50%, -50%)';

    mouseCursor.style.display = 'none';

    return mouseCursor;
}

function toggleCursorVisibility(evt: KeyboardEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    cursorVisible = !cursorVisible;
    if (mouseCursor) {
        mouseCursor.style.display = cursorVisible ? 'block' : 'none';
    }
}

function handleClick(evt: KeyboardEvent) {
    if (!mouseCursor) return;
    
    evt.preventDefault();
    evt.stopPropagation();
    
    const { top, left } = mouseCursor.getBoundingClientRect();

    const element = document.elementFromPoint(left, top) as HTMLElement;
    element?.click();

    setCursorSize('big');
    setTimeout(() => setCursorSize('normal'), 100);
}

function handleMove(evt: KeyboardEvent, direction: Direction) {
    if (speedResetTimeout) clearTimeout(speedResetTimeout);
    evt.preventDefault();
    evt.stopPropagation();

    const delta = Date.now() - lastMoveTime;
    const isDirectionX = direction === 'left' || direction === 'right';
    const switchedDirection = isDirectionX 
        ? direction !== lastDirectionX
        : direction !== lastDirectionY;

    if (delta < FAST_MOVE_TIME) {
        const newSpeed = switchedDirection
            ? Math.max(cursorSpeed - 2, 0)
            : Math.min(cursorSpeed + 1, CURSOR_STEPS.length - 1);

        setCursorSpeed(newSpeed);
        speedResetTimeout = setTimeout(() => setCursorSpeed(0), FAST_MOVE_TIME);
    }

    moveCursor(direction);

    lastDirectionX = isDirectionX ? direction : lastDirectionX;
    lastDirectionY = !isDirectionX ? direction : lastDirectionY;
    lastMoveTime = Date.now();
}

function handleScroll(evt: KeyboardEvent, direction: 'up' | 'down') {
    evt.preventDefault();
    evt.stopPropagation();

    window.scrollBy({
        top: direction === 'up' ? -200 : 200,
    });
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
