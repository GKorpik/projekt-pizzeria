import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';


export class Booking{
  constructor(){
    const thisBooking = this;
    
    thisBooking.render();
    thisBooking.initWidgets();
  }

  render(){
    const thisBooking = this;	
		
    const generatedHTML = templates.bookingWidget();
    const generatedDOM  = utils.createDOMFromHTML(generatedHTML);
    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);

    bookingContainer.appendChild(generatedDOM);

    thisBooking.dom.peopleAmount = thisBooking.element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.element.querySelector(select.booking.hoursAmount);
    
  }

  initWidgets(){
		
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
