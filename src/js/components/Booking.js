import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';


export class Booking{
  constructor(widget){
    const thisBooking = this;
    
    thisBooking.render(widget);
    thisBooking.initWidgets();
  }

  render(){
    const thisBooking = this; 
    
    const generatedHTML = templates.bookingWidget();
    const generatedDOM  = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);

    thisBooking.dom.wrapper.appendChild(generatedDOM);

    thisBooking.dom.wrapper.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.wrapper.hoursAmount = document.querySelector(select.booking.hoursAmount);
    
  }

  initWidgets(){
    
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.wrapper.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.wrapper.hoursAmount);
  }
}