export const PIECES = {
    I:() => ({
        shape: [
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false],
            [false, true, false, false]
        ],
        color: "cyan"
    }),
    L: () => ({
        shape: [
            [false, true, false],
            [false, true, false],
            [false, true, true]
        ],
        color: "blue"
    }),
    O: () => ({
        shape: [
            [true, true],
            [true, true]
        ],
        color: "yellow"
    }),
    J: () => ({
        shape: [
            [false, true, false],
            [false, true, false],
            [true, true, false]
        ],
        color: "orange"
    }),
    T: () => ({
        shape: [
            [false, true, false],
            [true, true, true],
            [false, false, false]
        ],
        color: "purple"
    }),
    Z: () => ({
        shape: [
            [true, true, false],
            [false, true, true],
            [false, false, false]
        ],
        color: "green"
    }),
    S: () => ({
        shape: [
            [false, true, true],
            [true, true, false],
            [false, false, false]
        ],
        color: "red"
    })
};