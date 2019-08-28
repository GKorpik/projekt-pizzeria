import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;
  
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();


  
    //console.log('new Product', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on templeate */
    const generatedHTML = templates.menuProduct(thisProduct.data);
  
    /*create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    trigger.addEventListener('click', function(event) {
    /* prevent default action for event */

      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      /* START LOOP: for each active product */
      for (const activeProduct of activeProducts) {
      /* START: if the active product isn't the element of thisProduct */
        if (thisProduct.element !== activeProduct) {
        /* remove class active for the active product */
          activeProduct.classList.remove('active');
        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }

    /* END: click event listener to trigger */
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    
    const event = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  processOrder(){

    const thisProduct = this;

    /* read all data from the form*/
    const formData = utils.serializeFormToObject(thisProduct.form);
    
    /* set variable price to equal thisProduct.data.price */
    
    thisProduct.params = {};

    let price = thisProduct.data.price;
    //console.log('!price', price);

    const paramData = thisProduct.data.params;
    //console.log('paramData', paramData);

    
    /* START LOOP: for each paramId in paramData */
    for (let paramId in paramData){
      //console.log('paramId', paramId);

      const param = paramData[paramId];
      //console.log('param', param);
      
      /* START LOOP: for each optionId in param.options */
      for (let optionId in param.options){
        //console.log('optionId', optionId);
        
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        //console.log('option', option);
        
        /* START IF: if option is selected and option is not default */
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        //console.log('optionSelected', optionSelected);
        if(optionSelected && !option.default){
          /* add price of option*/
          price += option.price;
        } else if (!optionSelected && option.default){
          price -= option.price;
        }

        if(!thisProduct.params[paramId]){
          thisProduct.params[paramId] = {
            label: param.label,
            options: {},
          };
        }
        thisProduct.params[paramId].options[optionId] = option.label;
        
        const integratedClass = '.' + paramId + '-' + optionId;
        //console.log('class', integratedClass);

        const selector = thisProduct.imageWrapper.querySelector(integratedClass);
        //console.log('selector', selector);

        if(selector){
          if(optionSelected){
            selector.classList.add(classNames.menuProduct.imageVisible);
          } else {
            selector.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price; 
  }
}
