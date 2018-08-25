
var message = {
    build: function(context, title, text) {
        var last = this.lastMessage;
        if (context != last.context && title != last.title && text != last.text) {
            $("<div id='message-element' class='alert alert-" + context + " alert-dismissible fade show alert-div'><button type='button' class='close' data-dismiss='alert'>&times;</button ><strong class='message-title'>" + title + "</strong> <span class='message-content'>" + text + "</span></div>")
                .appendTo(".message-container");
            setTimeout(() => {
                $(".alert-div").addClass("in");
            }, 20);
            this.lastMessage.context = context;
            this.lastMessage.title = title;
            this.lastMessage.text = text;
        }
    },
    success: function (text) {
        this.build("success", "Success!", text);
    },
    info: function (text) {
        this.build("info", "Info!", text);
    },
    warning: function (text) {
        this.build("warning", "Warning!", text);
    },
    error: function (text) {
        this.build("danger", "Error!", text);
    },
    primary: function (text) {
        this.build("primary", "Important!", text);
    },
    lastMessage: {
        context: "", title: "", text: ""
    }
}