/* global rangeSlider */

import{BaseWidget} from './BaseWidget.js';
import{select,settings}from '../settings.js';
import{utils} from '../utils.js';


export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);   
    thisWidget.initPlugin(); 
    thisWidget.value = thisWidget.dom.input.value;

  }


  initPlugin(){
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }  

  parseValue(value){
    
    const thisWidget = this;
    thisWidget.hours = utils.numberToHour(value);

    return(thisWidget.hours);
  }
  
  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerText = thisWidget.hours;
  }
}