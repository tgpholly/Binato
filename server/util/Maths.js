module.exports = {
    map:function(input, inputMin, inputMax, outputMin, outputMax) {
        const newv = (input - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;
        if (outputMin < outputMax) return this.constrain(newv, outputMin, outputMax);
        else return this.constrain(newv, outputMax, outputMin);
    },

    constrain:function(input, low, high) {
        return Math.max(Math.min(input, high), low);
    },

    randInt:function(from, to) {
        return Math.round(this.map(Math.random(), 0, 1, from, to));
    }
}