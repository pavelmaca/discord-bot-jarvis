const Discord = require('discord.js');


module.exports = class PollStatus{

    answers = new Discord.Collection();

    addAnswer(answer, author){
        if(!this.answers.has(answer)){
            this.answers.set(answer, new Discord.Collection());
        }

        this.answers.get(answer).set(author, true);
    }

    removeAnswer(answer, author){
        if(!this.answers.has(answer)){
            return;
        }

        this.answers.get(answer).delete(author);
    }

    getStatus(){
        return this.answers;
    }
}