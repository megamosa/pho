/**
 * MagoArab PhoneMail Module
 *
 * @category  MagoArab
 * @package   MagoArab_PhoneMail
 * @author    MagoArab
 * @copyright Copyright (c) 2025
 */
define([
    'jquery',
    'ko',
    'uiComponent',
    'Magento_Customer/js/model/customer',
    'Magento_Customer/js/action/check-email-availability',
    'Magento_Customer/js/action/login',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/model/full-screen-loader',
    'mage/validation'
], function ($, ko, Component, customer, checkEmailAvailability, loginAction, quote, checkoutData, fullScreenLoader) {
    'use strict';
    
    var validatedEmail = checkoutData.getValidatedEmailValue();
    
    if (validatedEmail && !customer.isLoggedIn()) {
        quote.guestEmail = validatedEmail;
    }
    
    return Component.extend({
        defaults: {
            template: 'MagoArab_PhoneMail/checkout/email-hidden',
            email: checkoutData.getInputFieldEmailValue(),
            telephone: '',
            isLoading: false,
            isPasswordVisible: false,
            listens: {
                email: 'emailHasChanged',
                telephone: 'telephoneHasChanged'
            }
        },
        
        /**
         * Initialize component
         */
        initialize: function () {
            this._super();
            
            // Set a placeholder email as this will be generated from phone
            this.email = 'placeholder@example.com';
            
            // Pre-fill telephone from quote if available
            var billingAddress = quote.billingAddress();
            if (billingAddress && billingAddress.telephone) {
                this.telephone(billingAddress.telephone);
            }
            
            return this;
        },
        
        /**
         * Email has changed handler
         */
        emailHasChanged: function () {
            var self = this;
            
            clearTimeout(this.emailCheckTimeout);
            
            if (self.validateEmail()) {
                quote.guestEmail = self.email();
                checkoutData.setValidatedEmailValue(self.email());
            }
        },
        
        /**
         * Telephone has changed handler
         */
        telephoneHasChanged: function () {
            var self = this;
            
            if (self.validateTelephone()) {
                // When phone changes and is valid, generate a placeholder email
                // Final email will be generated on the server side
                var cleanPhone = self.telephone().replace(/[^0-9]/g, '');
                var storeDomain = window.location.hostname.replace('www.', '');
                
                // Set the generated email
                self.email(cleanPhone + '@' + storeDomain);
                quote.guestEmail = self.email();
                checkoutData.setValidatedEmailValue(self.email());
                
                // Store telephone in checkout data for later use
                checkoutData.setTelephone(self.telephone());
            }
        },
        
        /**
         * Validate email
         * 
         * @returns {Boolean}
         */
        validateEmail: function () {
            // Since email is generated, we don't need to validate it here
            return true;
        },
        
        /**
         * Validate telephone
         * 
         * @returns {Boolean}
         */
        validateTelephone: function () {
            var telephoneElement = $('#customer-email-fieldset [name="telephone"]');
            
            if (!telephoneElement.length) {
                return false;
            }
            
            // Clean phone number
            var phoneNumber = this.telephone().replace(/[^0-9]/g, '');
            
            // Minimum 6 digits, maximum 15 digits (international standard)
            return phoneNumber.length >= 6 && phoneNumber.length <= 15;
        },
        
        /**
         * Validate phone and proceed with checkout
         */
        validatePhone: function () {
            if (this.validateTelephone()) {
                // Generate email from phone if it worked
                this.telephoneHasChanged();
                
                // Trigger continue to go to next step
                $('.action.primary.continue').trigger('click');
            } else {
                // Show validation error
                var telephoneElement = $('#customer-email-fieldset [name="telephone"]');
                telephoneElement.addClass('mage-error');
                telephoneElement.after('<div class="mage-error" generated="true">Please enter a valid phone number (minimum 6 digits).</div>');
            }
        }
    });
});