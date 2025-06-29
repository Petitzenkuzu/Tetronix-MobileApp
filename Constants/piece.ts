export const PIECES = {
    I:() => ({
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        color: "cyan"
    }),
    L: () => ({
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        color: "blue"
    }),
    O: () => ({
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: "yellow"
    }),
    J: () => ({
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        color: "orange"
    }),
    T: () => ({
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: "purple"
    }),
    Z: () => ({
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: "green"
    }),
    S: () => ({
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: "red"
    })
};