/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };


  class Product{
    constructor(id, data){
      const thisProduct = this;
    
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
    
      console.log('new Product', thisProduct);
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
      });
    }

    processOrder(){

      const thisProduct = this;

      /* read all data from the form*/
      const formData = utils.serializeFormToObject(thisProduct.form);
      
      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      console.log('!price', price);

      const paramData = thisProduct.data.params;
      console.log('paramData', paramData);
      
      /* START LOOP: for each paramId in paramData */
      for (let paramId in paramData){
        console.log('paramId', paramId);

        const param = thisProduct.data.params[paramId];
        console.log('param', param);
        
        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options){
          console.log('optionId', optionId);
          
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          console.log('option', option);
          
          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          console.log('optionSelected', optionSelected);
          if(optionSelected && !option.default){
            /* add price of option*/
            price += option.price;
          } else if (!optionSelected && option.default){
            price -= option.price;
          }
        }
      }
      thisProduct.priceElem.innerText = price; 
    }
  }


  const app = {
    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function() {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    }
  };

  app.init();
}