

import express, { Express, Request, Response } from "express";
import Event from "../model/model.event";

const supposedEvent: Event = {
    id: '1',
    name: 'Trip to Paris',
    members: [ 'a123', 'b456', 'c789' ],
    expenses: [ 'e1', 'e2', 'e3' ],
    finsihed: false
}

const mapExpenses = {
    'e1': ['a123', 100],
    'e2': ['b456', 50],
    'e3': ['c789', 25]
}



export const finish = (req: Request, res: Response) => {

    // Hypothetically gets event wirh req.params.eventId

    let individualTabs = {}
    for(let member of supposedEvent.members) {
        individualTabs[member] = []
    }

    for(let expense of supposedEvent.expenses) {
        let expenseData = mapExpenses[expense]
        individualTabs[expenseData[0]] += -(expenseData[1])
    }

    let sum = 0;
    for(let member in individualTabs) {

        individualTabs[member].array.forEach(element => {
            sum += element;
        });

        individualTabs[member] = [sum]
    }

    console.log(individualTabs)

    
    res.send(`Event ${req.params.eventId} finished`);
}

export const test = () => {
    console.log('test');
}




