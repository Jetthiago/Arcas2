var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

var getDate = {
    date: 0,
    dateDefined: false,
    set: function(newDate) {
        this.date = newDate;
        this.dateDefined = true;
    },
    unset: function() {
        this.date = 0;
        this.dateDefined = false;
    },
    day: function() {
        if (!this.dateDefined) this.date = new Date();
        return this.date.getDate();
    },
    month: function(type) {
        if (!this.dateDefined) this.date = new Date();
        if (!type || type == "number") {
            return this.date.getMonth();
        } else if (type == "string") {
            return meses[this.date.getMonth()];
        }
    },
    year: function() {
        if (!this.dateDefined) this.date = new Date();
        return this.date.getFullYear();
    },
    numberOfDays: function(arg) { // arg: {year: number, month: number};
        if(arg){
            return new Date(arg.year, arg.month + 1, 0).getDate();
        } else {
            return new Date(this.year(), this.month() + 1, 0).getDate();
        }
    },
    generateDaysData: function (arg) { // arg: {year: number, month: numer};
        var number = this.numberOfDays(arg),
            data = [];
        for(var i = 0; i < number; i++){
            data[i] = i+1;
        }
        return data;
    }
}


module.exports = getDate;