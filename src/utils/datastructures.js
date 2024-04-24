class Stack {
    constructor(size) {
        this._size = size
        this._stack = []
    }

    isFull() {
        return (this._stack.length === this._size)
    }

    isEmpty() {
        return (this._stack.length === 0)
    }

    push(item) {
        if (!this.isFull()) {
            this._stack.push(item)

            return true
        }

        return false
    }
    pushAll(items) {
        for (let i = 0; i < items.length; i++) {
            this.push(items[i])
        }
    }


    pop() {
        if (!this.isEmpty()) {
            const index = this._stack.indexOf(this._stack[this._stack.length - 1])
            if (index > -1) {
                this._stack.splice(index, 1)
            }

            return true
        }

        return false
    }

    peek() {
        if (!this.isEmpty()) {
            return this._stack[this._stack.length - 1]
        }

        return 'empty'
    }

    getStack() {
        return this._stack
    }
}

export { Stack }