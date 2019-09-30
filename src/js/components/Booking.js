import {select, templates, settings, classNames} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import{utils} from '../utils.js';

export class Booking{
  constructor(widget){
    const thisBooking = this;
    console.log('booking.started');
    thisBooking.render(widget);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  render(widget){
    const thisBooking = this; 
    
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = widget;
    widget.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets(){
    
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }


  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);
    
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);
  

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};
    console.log(eventsCurrent, bookings, eventsRepeat);

    for(let event of eventsCurrent) {
      
      console.log('eventsCurrent', event);
      let hourNumber = utils.hourToNumber(event.hour);
      thisBooking.makeBooked(event.date, hourNumber, event.duration, event.table);
    }  
    
    for(let event of eventsRepeat) {
      
      console.log('eventsRepeat', event);
      let hourNumber = utils.hourToNumber(event.hour);
      thisBooking.makeBooked(event.date, hourNumber, event.duration, event.table);
    }

    for(let event of bookings) {
      
      console.log('bookings', event);
      let hourNumber = utils.hourToNumber(event.hour);
      thisBooking.makeBooked(event.date, hourNumber, event.duration, event.table);
    }       
    
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    console.log(date, hour, duration, table);

    if(thisBooking.booked.hasOwnProperty(date) == false){
      thisBooking.booked[date] = {};
    }
      

    for(let i=hour; i < hour + duration; i += 0.5){
      
      if(!thisBooking.booked[date][i]){
        thisBooking.booked[date][i] = [table];
      } else {
        thisBooking.booked[date][i].push(table);
      }
      console.log('thisBooking.booked',thisBooking.booked);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.hours);
  
    for (let table of thisBooking.dom.tables){
      let numberTable = table.getAttribute(settings.booking.tableIdAttribute);
    
      if(typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined' ||
        thisBooking.booked[thisBooking.date][thisBooking.hour].hasOwnProperty(numberTable))
      {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
}


