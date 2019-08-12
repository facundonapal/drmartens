ACC.secureacceptance = {

    _autoload: [
        'attachHandlerForPlaceOrderBtn',
        'initSOPIframeDialog',
        ['initApplePay', $("#applePayDetails").length != 0],
        'attachHandlerForPaymentModeRadioBtn',
        ["attachHandlerForCardPayment", $(".creditCardDetails").length != 0],
        //  ['initDefaultPaymentMode', $(".creditCardDetails").length != 0],
        'initCvvTooltip',
        'resetCardNumberButton',
        ['createCreditCardList', $('.checkout-paymentmethod').length != 0],
        ['giftcardBind', $('.checkout-paymentmethod').length != 0],
        ['checkRedeemGiftCard', $('.checkout-paymentmethod').length != 0],
    ],

    cardTypeList: {
        'dinersclub': '006',
        'jcb': '007',
        'diners': '005',
        'amex': '003',
        'visaelectron': '033',
        'visa': '001',
        'mastercard': '002',
        'discover': '004'
    },

    creditCardActive: [],

    createCreditCardList: function () {
        // extact active credit card list
        $.each(ACC.config.crediCardListAvailable, function (key, value) {
            var temp = $.grep(Object.keys(ACC.secureacceptance.cardTypeList), function (k) {
                return ACC.secureacceptance.cardTypeList[k] == value;
            });
            ACC.secureacceptance.creditCardActive[key] = temp;
        });
        // remove empty item
        ACC.secureacceptance.creditCardActive = ACC.secureacceptance.creditCardActive.filter(function (el) {
            return el != '';
        });
        ACC.secureacceptance.creditCardActive = ACC.secureacceptance.creditCardActive.join();
        ACC.secureacceptance.creditCardActive = ACC.secureacceptance.creditCardActive.split(',');
    },

    isCreditCardTypeAllowed: function (type) {
        var isIn = (ACC.secureacceptance.creditCardActive.indexOf(type) > -1) ? true : false;
        return isIn;
    },

    checkOrderStatusInterval: function (cartGuid, timeout) {
        setInterval(function () {
            ACC.secureacceptance.checkOrderStatus(cartGuid)
        }, timeout);
    },

    checkOrderStatus: function (cartGuid) {
        $.ajax({
            url: ACC.config.sitePath + '/checkout/payment/sa/isorderplaced',
            cache: false,
            dataType: 'json',
            data: {
                cartGuid: cartGuid
            },
            success: function (orderCode) {

                if (orderCode) {
                    window.location = ACC.config.sitePath + '/checkout/orderConfirmation/' + orderCode;
                }
            }
        });
    },

    initSOPIframeDialog: function () {
        var $sopIframeCbox = $('#sopIframeCbox');
        var sopUrl = $sopIframeCbox.data("sop-url");
        $sopIframeCbox.find("iframe").attr('src', sopUrl);

        // if ($sopIframeCbox) {
            // console.log('test1');
            // $sopIframeCbox.dialog({
            //     autoOpen: false,
            //     width: 390,
            //     dialogClass: 'no-close',
            //     modal: true
            // });
        // }
    },

    startSOPIframeTimeout: function ($sopRequestIframe) {
        var previousSOPIframeTimeout = null;
        // var $sopIframeCbox = $('#sopIframeCbox');
        // var sopUrl = $sopIframeCbox.data("sop-url");

        $sopRequestIframe.on('load', function () {
            if (previousSOPIframeTimeout) {
                clearTimeout(previousSOPIframeTimeout);
            }

            previousSOPIframeTimeout = setTimeout(function () {
                // $('#sopIframeCbox').dialog('open');
                ACC.overlayDrm.open('#sopIframeCbox');
                $('#sopIframeCbox').css({'display':'block'});
                if (ACC.os.isiOS()) {
                    $('#sopRequestIframe').css({
                        'height': '100vh'
                    });
                    $('body').addClass('block-background');
                } else {
                    $('#sopRequestIframe').css({'height': '430px'});
                }

                // window.location.href = sopUrl;
            }, 3000);
        });
    },

    initDefaultPaymentMode: function () {
        var creditCardMode = $("#credit-card-btn");
        $(window).bind("load", function () {
            if (creditCardMode) {
                ACC.accordion.open(creditCardMode);
            }
        });
    },

    creditCardTypeFromNumber: function (number) {
        ACC.secureacceptance.resetCardNumber('checking');
        // Diners - Carte Blanche - dinersclub
        if (number.match(new RegExp("^30[0-5]")) != null)
            return '006'; //Diners - Carte Blanche

        // JCB
        if (number.match(new RegExp("^(352[89]|35[3-8][0-9])")) != null ||
            number.match(new RegExp("^(1800[0-9]{2}|180100)")) != null)
            return '007'; //JCB

        // Diners
        if (number.match(new RegExp("^(30[6-9]|36|38)")) != null)
            return '005'; //Diners

        // AMEX
        if (number.match(new RegExp("^3[47]")) != null)
            return '003'; //AMEX

        // Visa Electron - visaelectron
        if (number.match(new RegExp("^(4026|417500|4508|4844|491(3|7))")) != null)
            return '033'; //Visa Electron

        // Visa
        if (number.match(new RegExp("^4")) != null)
            return '001'; //Visa

        // Mastercard
        if (number.match(new RegExp("^5[1-5]")) != null)
            return '002'; //Mastercard

        // Discover
        if (number.match(new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)")) != null)
            return '004'; //Discover

        return "";
    },

    // creditCardLenghtCheck: function () {
    //     var cardNumber = ACC.secureacceptance.removeWhiteSpace($("#card_accountNumber").val());
    //     var cardNumberLenght = cardNumber.length;
    //     var cardType = ACC.secureacceptance.creditCardTypeFromNumber(cardNumber);
    //     var isCorrect = false;

    //     switch (cardType) {
    //         case '006': // Diners - Carte Blanche
    //             if (cardNumberLenght == 14) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '007': // JCB
    //             if (cardNumberLenght >= 16 && cardNumberLenght <= 19) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '005': // Diners
    //             if (cardNumberLenght == 14) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '003': // AMEX
    //             if (cardNumberLenght == 15) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '033': // Visa Electron
    //             if (cardNumberLenght >= 16 && cardNumberLenght <= 19) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '001': // Visa
    //             if (cardNumberLenght >= 16 && cardNumberLenght <= 19) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '002': // Mastercard
    //             if (cardNumberLenght == 16) {
    //                 isCorrect = true;
    //             }
    //             break
    //         case '004': // Discover
    //             if (cardNumberLenght == 16) {
    //                 isCorrect = true;
    //             }
    //             break
    //     }

    //     return isCorrect;
    // },

    attachHandlerForCardPayment: function () {
        var cardInput = "#card_accountNumber";
        var cardInputCss = "#card_accountNumber";
        var cvvInput = "#card_cvNumber";
        var cvvInputCss = "#card_cvNumber";
        var isDDS = ($('#card_accountNumber_mask').length > 0) ? true : false;
        var inputCardCheck = "#card_accountNumber";
        var inputCVVCheck = "#card_cvNumber";
        
        if (isDDS) {
            var inputCardCheck = "#card_accountNumber_mask";
            var inputCVVCheck = "#card_cvNumber_mask";
            var cvvInputCss = "#card_cvNumber, #card_cvNumber_mask";
            var cardInputCss = "#card_accountNumber, #card_accountNumber_mask";
        }

        $(inputCardCheck)
            .keyup(function () {
                // add setitmeout because of acc.checkout.maskValue
                setTimeout(function(){
                    ACC.secureacceptance.creditCardTypeCheck();
                    if (isDDS) {
                        var ccValue = $(cardInput).val();
                        var cardFormat = $(cardInput).dmCcForm().formatCardNumber(ccValue);
                        $(cardInputCss).attr("maxlength", cardFormat.realLength);
                    } else {
                        $(cardInput).dmCcForm().formattingCard();
                    }
                    var isValid = $(cardInput).dmCcForm().validateCard();
                    var cardType = $(cardInput).dmCcForm().typeCreditCard();
                    ACC.secureacceptance.resetCardType();
                    $(cardInputCss).addClass(cardType);
                    if (isValid) {
                        $('#number-card-simbol').addClass('_card-ok');
                        $(cardInputCss).addClass('_correct');
                    } else {
                        $(cardInputCss).removeClass('_correct');
                    }
                    ACC.secureacceptance.checkCardForm();
                },0);
            })
            .focusout(function () {
                ACC.secureacceptance.checkCardForm();
                if ($(cardInput).val().length > 0) {
                    var isValid = $(cardInput).dmCcForm().validateCard();
                    var cardType = $(cardInput).dmCcForm().typeCreditCard();
                    if (isValid && ACC.secureacceptance.isCreditCardTypeAllowed(cardType)) {
                        ACC.secureacceptance.resetCardNumber('correct');
                    } else {
                        ACC.secureacceptance.resetCardNumber('error');
                    }
                }
            });

        $(inputCVVCheck)
            .keyup(function () {
                if ($(cvvInput).val().length < $(cvvInput).attr('maxlength')) {
                    $('#cvv-check').removeClass('_ok');
                    $(cvvInputCss).removeClass('_correct');
                } else {
                    $('#cvv-check').addClass('_ok');
                    $(cvvInputCss).addClass('_correct');
                    ACC.secureacceptance.checkCardForm();
                }
            })
            .focusout(function () {
                ACC.secureacceptance.checkCardForm();
                if ($(cvvInput).val().length < $(cvvInput).attr('maxlength')) {
                    $('#cvv-check').removeClass('_ok');
                } else {
                    $('#cvv-check').addClass('_ok');
                }
            });

        $('#expire-month, #expire-year').change(function () {
            ACC.secureacceptance.checkCardForm();
        });
    },

    creditCardTypeCheck: function () {
        var cardStatus = '';
        var newCardType = ACC.secureacceptance.creditCardTypeFromNumber($("#card_accountNumber").val());
        if (newCardType != "") {
            cardStatus = 'checking';
            $(".payment-icon").removeClass("_active");
            setTimeout(function () {
                $(".payment-icon[data-card='" + newCardType + "']").addClass('_active');
            }, 0);

            //handle AMEX card content changes
            var $cvnField = $('#card_cvNumber');
            var $cvvMask = $('#card_cvNumber_mask');
            var cvnTitle, cvnInfo, cvnPlaceholder, cvvImage;
            var cvvImageAmex = 'image-amex';
            var cvvImageGeneric = 'image-generic';
            ACC.secureacceptance.initCvvTooltip();
            if (newCardType == '003') {
                cvnTitle = $cvnField.data('title-amex');
                cvnInfo = $cvnField.data('info-amex');
                cvnPlaceholder = $cvnField.data('placeholder-amex');
                cvvImage = cvvImageAmex;
                $cvnField.attr('maxlength', 4);
                if ($cvvMask) {
                    $cvvMask.attr('maxlength', 4);
                }
            } else {
                cvnTitle = $cvnField.data('title');
                cvnInfo = $cvnField.data('info');
                cvnPlaceholder = $cvnField.data('placeholder');
                cvvImage = cvvImageGeneric;
                $cvnField.attr('maxlength', 3);
                if ($cvvMask) {
                    $cvvMask.attr('maxlength', 3);
                }
            }
            $('#cvvTitle').text(cvnTitle);
            $cvnField.attr('placeholder', cvnPlaceholder);
            $('#cvvInfo').text(cvnInfo);
            $('#cvv-tooltip').attr('data-title', cvnTitle);
            $('#cvv-tooltip .cvv-tooltip__content').addClass(cvvImage);
            $('#cvv-tooltip-text').text(cvnInfo);
        }
        // checking credit card number during typing
        if ($('#card_accountNumber').val().length > 6) {
            var cardType = $('#card_accountNumber').dmCcForm().typeCreditCard();
            if (ACC.secureacceptance.isCreditCardTypeAllowed(cardType)) {
                cardStatus = 'correct';
            } else {
                cardStatus = 'error';
            }
        }
        ACC.secureacceptance.resetCardNumber(cardStatus);
    },

    initCvvTooltip: function () {
        var $cvnField = $('#card_cvNumber');
        var cvnTitle, cvnInfo, cvvImage;
        cvnTitle = $cvnField.data('title');
        cvnInfo = $cvnField.data('info');
        cvvImage = 'image-generic';

        $('#cvv-tooltip .cvv-tooltip__content')
            .removeClass('image-generic')
            .removeClass('image-amex');
        $('#cvv-tooltip').attr('data-title', cvnTitle);
        $('#cvv-tooltip .cvv-tooltip__content').addClass(cvvImage);
        $('#cvv-tooltip-text').text(cvnInfo);
    },

    getSelectedRadioButton: function () {
        return $(".accordion-radio._active .payment-icon._active").next();
    },

    initApplePay: function () {
        if (window.ApplePaySession) {
            // The Apple Pay JS API is available.
            var merchantIdentifier = 'merchant.com.drmartens';
            var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
            promise.then(function (canMakePayments) {
                if (canMakePayments) {
                    $(".js-apple-pay").removeClass('hide');

                    $(".apple-pay-button").on('click', function (e) {
                        $.ajax({
                            url: ACC.config.sitePath + '/checkout/payment/apple-pay/sessionRequest',
                            async: false,
                            type: 'POST',
                            data: {},
                            success: function (result) {
                                try {
                                    var session = new ApplePaySession(1, result);
                                    session.onpaymentmethodselected = function (event) {
                                        var updatePaymentMethodRequest = {
                                            newTotal: {
                                                label: "Dr. Martens",
                                                type: "final",
                                                amount: result.total.amount
                                            }
                                        };
                                        session.completePaymentMethodSelection(updatePaymentMethodRequest);
                                    };
                                    session.onpaymentauthorized = function (event) {
                                        //STATUS_SUCCESS

                                        // STATUS_FAILURE
                                        $.ajax({
                                            url: ACC.config.sitePath + '/checkout/payment/apple-pay/authorize',
                                            async: false,
                                            dataType: 'json',
                                            type: 'POST',
                                            data: {
                                                paymentToken: JSON.stringify(event.payment.token.paymentData),
                                                cardType: event.payment.token.paymentMethod.network
                                            },
                                            success: function (result) {
                                                session.completePayment(result.data);
                                                if (result.success) {
                                                    ACC.overlayDrm.toastDone(result.errorMessage);
                                                    $("#placeOrder").after('<form id="applePayPlaceOrder" action="' + ACC.config.contextPath + '/checkout/payment/apple-pay/placeOrder" method="post"> <input type="hidden" name="CSRFToken" value="' + ACC.config.CSRFToken + '" /> </form>');
                                                    $("#applePayPlaceOrder").submit();

                                                } else if (result.errorMessage != undefined) {
                                                    ACC.overlayDrm.toastError(result.errorMessage);
                                                    session.abort();
                                                    if (result.errorMessage != undefined) {
                                                        setTimeout(function () {
                                                            window.location = ACC.config.sitePath + result.redirectUrl;
                                                        }, 4000);
                                                    }
                                                }

                                            }
                                        });
                                    };
                                    session.oncancel = function (event) {
                                        console.log("cancel payment");
                                    };
                                    /*session.onshippingcontactselected = function(event) {
                                       console.log(" onshippingcontactselected" );
                                    };
                                    session.onshippingmethodselected = function(event) {
                                       console.log(" onshippingmethodselected" );
                                    };*/
                                    //session.completeMerchantValidation = function(event) {
                                    //    alert("completeMerchantValidation" + event)
                                    //};
                                    session.onvalidatemerchant = function (event) {
                                        $.ajax({
                                            url: ACC.config.sitePath + '/checkout/payment/apple-pay/session/create',
                                            async: false,
                                            dataType: 'json',
                                            type: 'POST',
                                            data: {
                                                'validationUrl': event.validationURL
                                            },
                                            success: function (result) {
                                                if (result.success) {
                                                    session.completeMerchantValidation(JSON.parse(result.data));
                                                } else if (result.errorMessage != undefined) {
                                                    ACC.overlayDrm.toastError(result.errorMessage);
                                                    session.abort();
                                                    if (result.errorMessage != undefined) {
                                                        setTimeout(function () {
                                                            window.location = ACC.config.sitePath + result.redirectUrl;
                                                        }, 4000);
                                                    }
                                                }
                                            },
                                            error: function () {
                                                ACC.overlayDrm.toastError("Sorry, unexpected error.");
                                                setTimeout(function () {
                                                    window.location = ACC.config.sitePath + "/cart";
                                                }, 4000);
                                            }
                                        });
                                    };


                                    session.begin();
                                } catch (err) {
                                    console.log(err.message);
                                }
                            }
                        });
                    });

                    /*$("#payWithApplePay").on('click', function(e) {
                        if (ApplePaySession.openPaymentSetup) {
                            // Display the Set up Apple Pay Button here…
                            ApplePaySession.openPaymentSetup(merchantIdentifier)
                               .then(function(success) {
                                   if (success) {
                                        alert("success")
                                       // Open payment setup successful
                                   } else {
                                        alert("failed")
                                       // Open payment setup failed
                                   }
                            })
                            .catch(function(e) {
                                alert("Open payment setup error handling" + e);
                                // Open payment setup error handling
                            });
                        }
                    });*/
                }
            });
        } else {
            //alert("Sorry, The Apple Pay JS API is NOT available.");
        }

    },


    attachHandlerForPaymentModeRadioBtn: function () {
        var paymentModeBtn = $('.payment-icon');
        var paymentModeAccordion = $('.js-paymentmode-accordion-call');
        if (paymentModeAccordion) {
            var paymentType = ACC.secureacceptance.getPaymentType();
            if (paymentType === 'AGENT' || paymentType === 'FREE') {
                // var ORDER_BTN = '#placeOrderForm1 #placeOrder';
                // $(ORDER_BTN).removeClass('disabled');
                ACC.secureacceptance.activeOrderButton();
            }
            paymentModeAccordion.on('click', function (e) {
                ACC.accordion.open(e);
                ACC.secureacceptance.creditCardTypeCheck();
                ACC.common.loadingStatus('.cs_btn-place-order', 'done');
                ACC.secureacceptance.applePayBtnActivation(e);
                ACC.secureacceptance.activateSubmitButton(e);

                paymentModeBtn.removeClass("_active");
                if ($(this).find('img').length > 1) {
                    // is multiple payment method do nothing
                } else {
                    // is single payment method
                    $(this).find('img').addClass("_active");
                }

                if ($(this).data('payment-type') != 'GIFT_CARD') {
                       $('#placeOrderForm1 #placeOrder').removeClass("js-gift-card-payment");
                }



                // if is klarna payment method
                if ($(this).data('payment-type') == 'ALTERNATIVE_PAYMENT' && $(this).data('payment-sub-type') == '100_klarna') {
                    //1st step create the session
                    // $('#placeOrderForm1 button').addClass('disabled');
                    ACC.secureacceptance.disableOrderButton();
                    $('#klarna_container').prepend('<div id="item-loading"></div>');
                    $('#klarna_container iframe').remove();
                    $.get(ACC.config.encodedContextPath + '/checkout/payment/klarna/create-session', {}).done(function (data, result, status) {
                        if (result == "success") {
                            //2nd step add init script
                            if (data.errorMessage != undefined) {
                                ACC.overlayDrm.toastError(data.errorMessage);
                                return;
                            }
                            var newScript = document.createElement("script");
                            var inlineScript = document.createTextNode("window.klarnaAsyncCallback = function () { Klarna.Payments.init({ client_token: '" + data.sessionToken + "' })}");
                            newScript.appendChild(inlineScript);
                            document.head.appendChild(newScript);

                            //3rd step inlcude Klarna script
                            var klarnaScript = document.createElement('script');
                            klarnaScript.onload = function () {
                                Klarna.Credit.init({
                                    client_token: data.sessionToken
                                });

                                Klarna.Payments.load({
                                    container: '#klarna_container'
                                }, function (res) {
                                    if (res["show_form"] == true && $('#item_klarnaDetails').hasClass('_active')) {
                                        $('#klarna_container #item-loading').remove();
                                        // $('#placeOrderForm1 button').removeClass('disabled');
                                        ACC.secureacceptance.activeOrderButton();
                                    } else {
                                        console.log("Klarna Not Available As A Payment Option" + JSON.stringify(res));
                                    }
                                })
                            };
                            klarnaScript.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
                            document.head.appendChild(klarnaScript);
                        } else {
                            alert("error handling");
                        }
                    });
                }
            });

        }

        // not used
        // $("#end-date").keyup(function () {
        //     var val = $(this).val().trim();
        //     val = val.replace(/\s+/g, '');
        //     val = val.replace(/-/g, '');
        //     if (val.length == 2) {
        //         val = val + "-";
        //     } else if (val.length > 2 && val[2] != '-') {
        //         val = val.substring(0, 2) + '-' + val.substring(2);
        //     }
        //     $(this).val(val);
        // });

        // $("#end-date").change(function () {
        //     var val = $(this).val().trim();
        //     val = val.replace(/[^\d-]/g, '');
        //     if (val.length == 2) {
        //         val = val + "-";
        //     } else if (val.length > 2 && val[2] != '-') {
        //         val = val.substring(0, 2) + '-' + val.substring(2);
        //     }
        //     $(this).val(val);
        // });

    },

    attachHandlerForPlaceOrderBtn: function () {

        var submitHOPForm = function () {
            if (termsAndConditionsChecked()) {
                var hopForm = $("#hopRequestForm");
                hopForm.submit();
            }
        };

        var submitSOPForm = function () {
            if (isCreditCardPayment() && isValidCardData() && termsAndConditionsChecked()) {
                var $sopRequestIframe = $('#sopRequestIframe');
                var sopForm = $sopRequestIframe.contents().find('#sopRequestForm');

                sopForm.find("#card_type").val(getCardType());
                sopForm.find("#card_number").val(getCardNumber());
                sopForm.find("#card_expiry_date").val(getCardExpireDate());
                sopForm.find("#card_cvn").val(getCardCvn());

                sopForm.submit();

                ACC.secureacceptance.startSOPIframeTimeout($sopRequestIframe);

                var cartGuid = $sopRequestIframe.contents().find("#cart_guid").val();
                ACC.secureacceptance.checkOrderStatusInterval(cartGuid, 10000);
            } else {
                var creditCardMode = $("#credit-card-btn");
                if (!creditCardMode.hasClass('_active')) {
                    ACC.accordion.open(creditCardMode);
                }
            }
        };

        var placeOrderWithPayPal = function () {
            if (termsAndConditionsChecked()) {
                $(".checkout-paymentmethod").after('<form id="paypalPlaceOrder" action="' + ACC.config.contextPath +
                    '/checkout/payment/paypal/startFlow" method="get"></form>');
                $("#paypalPlaceOrder").submit();
            }
        };

        var placeFreeOrder = function () {
            if (termsAndConditionsChecked()) {
                $("#placeOrder").after('<form id="freePlaceOrder" action="' + ACC.config.contextPath + '/checkout/multi/summary/place-free-order" method="get"></form>');
                $("#freePlaceOrder").submit();
            }
        };

        var placeAgentOrder = function () {
            if (termsAndConditionsChecked()) {
                $("#csAgentPaymentForm").submit();
            }
        };

        var checkCartBeforePlaceOrder = function (paymentType) {
            var checkSession;
            $.ajax({
                url: ACC.config.sitePath + '/cart/check',
                cache: false,
                async: false,
                dataType: 'json',
                type: 'POST',
                data: {
                    'CSRFToken': ACC.config.CSRFToken,
                    'paymentType': paymentType
                },
                success: function (result) {
                    if (!result.success) {
                    		if(result.errorMessage == 'stock_issue'){
                            checkSession = false;
                            document.location.reload();
                    		}else{
									ACC.overlayDrm.toastError(result.errorMessage);
									setTimeout(function () {
										 window.location = ACC.config.sitePath + '/cart';
									}, 4000);
                        }
                    } else {
                        checkSession = true;
                    }
                },
                error: function(xht, textStatus, ex)
                     {
                        checkSession = false;
                     }
            });


            return checkSession;
        };

        var placeKlarnaOrder = function () {
            if (termsAndConditionsChecked()) {
                $.get(ACC.config.encodedContextPath + '/checkout/payment/klarna/update-session', {}).done(function (data, result, status) {
                    if (result == "success") {
                        //2nd step add init script
                        if (data.errorMessage != undefined) {
                            ACC.overlayDrm.toastError(data.errorMessage);
                            return;
                        }

                        Klarna.Credit.authorize({}, function (res) {
                            var isApproved = res["approved"];
                            if (isApproved) {
                                var auth_token = res["authorization_token"];

                                var form = document.createElement("form");
                                document.body.appendChild(form);
                                form.method = "POST";
                                form.action = ACC.config.encodedContextPath + '/checkout/payment/klarna/autorize';
                                var input = document.createElement("INPUT");
                                input.name = "authorization_token";
                                input.value = auth_token;
                                input.type = 'hidden';
                                form.appendChild(input);
                                var csrf = document.createElement("INPUT");
                                csrf.name = "CSRFToken";
                                csrf.value = ACC.config.CSRFToken;
                                csrf.type = 'hidden';
                                form.appendChild(csrf);
                                form.submit();

                                /*$.post(url, { authorization_token : auth_token }).done(function (result, data, status) {
                                    alert(data);
                                    if (result == "200") {
                                        var url = data;
                                        window.location.replace(url);
                                    } else {
                                        alert("error handling");
                                    }
                                });*/
                            } else {
                                ACC.common.loadingStatus('.cs_btn-place-order', 'done');
                                ACC.secureacceptance.disableOrderButton();
                                ACC.accordion.close();
                            }
                        });
                    }
                });
            }
        };

        placeGiftcardOrder = function () {
            if (termsAndConditionsChecked()) {
                $(".checkout-paymentmethod").after('<form id="giftcardPlaceOrder" action="' + ACC.config.contextPath +
                    '/checkout/giftcard/placeOrder" method="get"></form>');
                $("#giftcardPlaceOrder").submit();
            }
        };

        var isCreditCardPayment = function () {
            return ACC.secureacceptance.getPaymentType() === "CREDIT_CARD";
        };

        var placeOrderWithCard = function () {
            if ($('#hopRequestForm').length) {
                submitHOPForm();
            } else {
                submitSOPForm();
            }
        };

        var placeOrderWithAlternativePayment = function () {
            var alternativePaymentCode = ACC.secureacceptance.getSelectedRadioButton().val();

            if (termsAndConditionsChecked()) {
                $(".checkout-paymentmethod").after(
                    '<form id="alternativePlaceOrder" action="' + ACC.config.contextPath + '/checkout/payment/ap/pay" method="post">' +
                    '<input type="hidden" name="paymentModeCode" value="' + alternativePaymentCode + '" /> ' +
                    '<input type="hidden" name="CSRFToken" value="' + ACC.config.CSRFToken + '" /> ' +
                    '</form>');
                $("#alternativePlaceOrder").submit();
            }
        };

        var isValidCardData = function () {
            var fieldsToValidate = [{
                    value: getCardType(),
                    error: $("#card_cardType_errors")
                },
                {
                    value: getCardNumber(),
                    error: $("#card_accountNumber_errors")
                },
                {
                    value: getCardCvn(),
                    error: $("#card_cvn_errors")
                },
                {
                    value: getCardExpireDate(),
                    error: $("#card_expirationdate_errors")
                }
            ];

            var isValid = true;

            fieldsToValidate.forEach(function (field) {
                if (Boolean(field.value)) {
                    hide(field.error)
                } else {
                    ACC.common.loadingStatus('.cs_btn-place-order', 'done');
                    show(field.error);
                    isValid = false;
                }
            });

            return isValid;

        };

        var termsAndConditionsChecked = function () {
            if ($("input[name='termsCheck']").is(":checked")) {
                $(".tc-unchecked-alert").attr("hidden", "hidden");
                return true;
            } else {
                ACC.common.loadingStatus('.cs_btn-place-order', 'done');
                $(".tc-unchecked-alert").removeAttr("hidden");
                return false;
            }
        };

        var show = function (validationMsg) {
            // validationMsg.removeAttr("hidden");
            // validationMsg.closest(".form-group").addClass("has-error");
        };

        var hide = function (validationMsg) {
            // validationMsg.attr("hidden", "hidden");
            // validationMsg.closest(".form-group").removeClass("has-error");
        };

        var getCardType = function () {
            return ACC.secureacceptance.getSelectedRadioButton().data("payment-card");
        };

        var getCardNumber = function () {
            var cardNumber = ACC.secureacceptance.removeWhiteSpace($("#card_accountNumber").val());
            return cardNumber;
        };

        var getCardExpireDate = function () {
            var expireDate = '';
            var month = $("#expire-month").val();
            var year = $("#expire-year").val();
            if (month != '' && year != '') {
                expireDate = month + '-' + year;
            }
            return expireDate;
        };

        var getCardCvn = function () {
            return $("#card_cvNumber").val();
        };

        $('.cs_btn-place-order, .btn-place-order').on('click', function (e) {
            e.preventDefault();
            var paymentType = ACC.secureacceptance.getPaymentType();
            var cartCanBePlaced = checkCartBeforePlaceOrder(paymentType);
            if (!cartCanBePlaced) {
                //Redirect will happen
            } else {
                if (paymentType) {
                    ACC.common.loadingStatus('.cs_btn-place-order', 'loading');
                    switch (paymentType) {
                        case "CREDIT_CARD":
                            var isValid = $('#card_accountNumber').dmCcForm().validateCard();
                            if (isValid) {
                                ACC.secureacceptance.resetCardNumber('correct');
                                placeOrderWithCard();
                            } else {
                                var errorMsg = $('.checkout-paymentmethod__cards').data('error-msg');
                                // ACC.overlayDrm.toastError(errorMsg);
                                ACC.secureacceptance.resetCardNumber('error');
                                ACC.common.loadingStatus('.cs_btn-place-order', 'done');
                            }
                            break;
                        case "PAY_PAL":
                            placeOrderWithPayPal();
                            break;
                        case "ALTERNATIVE_PAYMENT":
                            placeOrderWithAlternativePayment();
                            break;
                        case "FREE":
                            placeFreeOrder();
                            break;
                        case "AGENT":
                            placeAgentOrder();
                            break;
                        case "KLARNA":
                            placeKlarnaOrder();
                            break;
                        case "GIFTCARD":
                            placeGiftcardOrder();
                            break;
                        default:
                            break;
                    }
                } else {
                    var errorMsg = $('.payment-step').data('error-msg');
                    ACC.overlayDrm.toastError(errorMsg);
                }

            }
        });
    },

    applePayBtnActivation: function (e) {
        var classList = e.target.className,
            paymentType = $(e.target).data('payment-type'),
            APPLE_PAY_BTN = '#dm-apple-pay-button',
            ORDER_BTN = '#placeOrderForm1 #placeOrder',
            isActive = (classList.indexOf("_active") >= 0) ? true : false;

        if (paymentType === 'APPLE_PAY' && isActive) {
            $(APPLE_PAY_BTN).removeClass('hide');
            $(ORDER_BTN).addClass('hide');
        } else {
            $(APPLE_PAY_BTN).addClass('hide');
            $(ORDER_BTN).removeClass('hide');
        }
    },

    resetCardNumber: function (action) {
        switch (action) {
            case 'checking':
                $('#number-card-simbol').removeAttr('class');
                $('#card_accountNumber_errors').addClass('hide');
                $('#card_accountNumber').removeClass('has-error');
                $('#number-card-simbol .js-reset-card').remove();
                break;
            case 'error':
                $('#number-card-simbol').removeAttr('class');
                if ($('.js-reset-card').length < 1) {
                    $('#number-card-simbol').append('<div class="js-reset-card">&times;</div>');
                }
                $('#card_accountNumber').addClass('has-error');
                $('#card_accountNumber_errors').removeClass('hide');
                break;
            case 'correct':
                $('#card_accountNumber_errors').addClass('hide');
                $('#card_accountNumber').removeClass('has-error');
                $('#number-card-simbol .js-reset-card').remove();
                break;
            case 'reset':
                $('#card_accountNumber_errors').addClass('hide');
                $('#card_accountNumber, #card_accountNumber_mask')
                    .removeAttr('class')
                    .addClass('form-control card_accountNumber');
                $('#number-card-simbol .js-reset-card').remove();
                break;
        }
    },

    removeWhiteSpace: function (string) {
        return string.replace(/\s+/g, '');
    },

    resetCardNumberButton: function () {
        $('body').on('click', '.js-reset-card', function () {
            ACC.secureacceptance.resetCardNumber('reset');
            $('#card_accountNumber, #card_accountNumber_mask').val('');
        });
    },

    resetCardType: function () {
        $.each(ACC.secureacceptance.cardTypeList, function (key, value) {
            // console.log(key,value);
            $('#card_accountNumber, #card_accountNumber_mask').removeClass(key);
        });
    },

    activateSubmitButton: function (e) {
        var classList = e.target.className;
        var paymentType = $(e.target).data('payment-type');
        // var ORDER_BTN = '#placeOrderForm1 #placeOrder';
        var isActive = (classList.indexOf("_active") >= 0) ? true : false;

        // $(ORDER_BTN).addClass('disabled');
        ACC.secureacceptance.disableOrderButton();
        // reset credit card form
        if ($("#card_accountNumber").length > 0) {
            ACC.secureacceptance.resetCardNumber('reset');
            $('#card_cvNumber').removeClass('_correct');
            $('#cvv-check').removeClass('_ok');
            $('#expire-month, #expire-year, #card_cvNumber, #card_accountNumber, #card_accountNumber_mask, #card_cvNumber_mask').val('');
        }
        // reset klarna
        if ($('#klarna_container').length > 0) {
            $('#klarna_container').html('');
        }
        // reset GiftCard
        if ($('#item_giftcard').length > 0) {
            ACC.secureacceptance.resetGiftCard();
        }

        // checking if and which accordion is opne
        if ((paymentType === 'CREDIT_CARD' || paymentType === 'GIFT_CARD') && isActive) {
            // we use the function checkCardForm and getGiftCard to check it
        } else if (isActive) {
            // $(ORDER_BTN).removeClass('disabled');
            ACC.secureacceptance.activeOrderButton();
        }
    },

    checkCardForm: function () {
        var isCardNumber = $("#card_accountNumber").hasClass('_correct');
        var isCVV = $('#card_cvNumber').hasClass('_correct');
        var isCardMonth = ($('#expire-month').val() === '') ? false : true;
        var isCardYear = ($('#expire-year').val() === '') ? false : true;
        // var ORDER_BTN = '#placeOrderForm1 #placeOrder';

        if (isCardNumber && isCVV && isCardMonth && isCardYear) {
            // $(ORDER_BTN).removeClass('disabled');
            ACC.secureacceptance.activeOrderButton();
        } else {
            ACC.secureacceptance.disableOrderButton();
            // $(ORDER_BTN).addClass('disabled');
        }
    },

    giftcardBind: function () {
        $('.js-giftcard-pay').on('click', function (e) {
            e.preventDefault();
            ACC.secureacceptance.resetGiftCardError();
            if (ACC.giftcard.checkGifcardInput()) {
                ACC.secureacceptance.getGiftCard();
            }
        });

        if ($('#total-price-value').data('iszero')) {
            var ORDER_BTN = '#placeOrderForm1 #placeOrder';
            $(ORDER_BTN).addClass("js-gift-card-payment");
            ACC.secureacceptance.activeOrderButton();
        }
    },

    getGiftCard: function () {
        var FORM_ID = '#giftcard-code';
        var FORM_CVN = '#giftcard-cvn';
        var url_call = ACC.config.sitePath + '/checkout/giftcard/pay';
        var codeID = $(FORM_ID).val().toUpperCase();
        var codeCVN = $(FORM_CVN).val().toUpperCase();
        var postData = {};
        var postData = {
            CSRFToken: ACC.config.CSRFToken,
            giftcardId: codeID,
            giftcardCvn: codeCVN
        };
        var balance = 0;
        var ERROR_MSG = '#item_giftcard_error';

        // $(ERROR_MSG).html('');
        // $(FORM_ID).parent().removeClass('has-success');
        ACC.secureacceptance.resetGiftCardError();

        $.ajax({
            url: url_call,
            type: 'POST',
            data: postData,
            traditional: true,
            //contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {
                if (data.status === 'ok') {
                    $.getJSON(
                        ACC.config.contextPath + "/checkout/giftcard/update", {},
                        function (data) {
                            ACC.checkoutaddress.reRenderCartDetails(data);
                        }
                    );
                    if (data.balance === "0.0") {
                        $('#placeOrderForm1 #placeOrder').addClass("js-gift-card-payment");
                        setTimeout(function() {
                            // var ORDER_BTN = '#placeOrderForm1 #placeOrder';
                            // $(ORDER_BTN).removeClass('disabled');
                            // $(ORDER_BTN).addClass("js-gift-card-payment");
                            ACC.secureacceptance.activeOrderButton();
                        }, 300);
                    }
                    balance = data.balance;
                    // $(FORM_ID).parent().addClass('has-success');
                    ACC.secureacceptance.redeemGiftCard();
                    ACC.secureacceptance.reloadSopIframe();
                    $('.has-error .input-error-msg').removeClass('hidden');
                } else {
                    $('.js-giftcard-validation').parent().addClass('has-error');
                    $(ERROR_MSG).html('<p class="error-text">'+data.errorMessage+'</p>');
                    $('.has-error .input-error-msg').addClass('hidden');
                }
            },
            error: function (xht, textStatus, ex) {
                console.log("Error details [" + xht + ", " + textStatus + ", " + ex + "]");
            }
        });
    },

    resetGiftCard: function () {
        var FORM_ID = '#giftcard-code';
        var FORM_CVN = '#giftcard-cvn';
        ACC.secureacceptance.resetGiftCardError();
        $(FORM_ID)
            .val('')
            .parent()
            .removeClass('has-success');
        $(FORM_CVN)
            .val('')
            .parent()
            .removeClass('has-success');
    },

    resetGiftCardError: function() {
        var FORM_ID = '#giftcard-code';
        var FORM_CVN = '#giftcard-cvn';
        var ERROR_MSG = '#item_giftcard_error';
        $('.giftcard__codeform .input-error-msg').removeClass('hidden');
        $(FORM_ID).removeClass('has-error');
        $(FORM_CVN).removeClass('has-error');
        $(ERROR_MSG).text('');
    },

    getPaymentType: function () {
        var paymentMode = ACC.secureacceptance.getSelectedRadioButton().attr("data-payment-type");
        var subPaymentMode = ACC.secureacceptance.getSelectedRadioButton().val();

        if ($('#placeOrderForm1 #placeOrder').hasClass("js-gift-card-payment") || $('.js-giftcard-side__wrapper').length && $('.js-giftcard-side__wrapper').data('paid') == true) {
            return 'GIFTCARD';
        }

        if (paymentMode === undefined && $("input[type='radio'][name='paymentMode']:checked").length > 0) {
            paymentMode = $("input[type='radio'][name='paymentMode']:checked").data("payment-type");
            subPaymentMode = $("input[type='radio'][name='paymentMode']:checked").val();
        }


        if (paymentMode === 'ALTERNATIVE_PAYMENT' && subPaymentMode === '100_klarna') {
            return 'KLARNA';
        }
        return paymentMode;
    },

    reloadSopIframe: function() {
        var sopRequestIframe = 'sopRequestIframe';
        document.getElementById(sopRequestIframe).contentDocument.location.reload(true);
    },

    redeemGiftCard: function() {
        $('.js-paymentmode-accordion-call.accordion-radio._active').trigger('click');
        $('#gift-card-redeem-label').removeClass('hidden');
    },

    checkRedeemGiftCard: function() {
        var GIFTCARD_CARD = '#checkout-product-sidebar .giftcard-side__card';
        var GIFTCARD_LABEL = '#gift-card-redeem-label';

        if ($(GIFTCARD_CARD).length > 0) {
            // add Redeem
            $(GIFTCARD_LABEL).removeClass('hidden');
        } else {
            // remove Redeem
            $(GIFTCARD_LABEL).addClass('hidden');
        }
    },

    activeOrderButton: function() {
        var ORDER_BTN = '#placeOrderForm1 #placeOrder';
        $(ORDER_BTN).removeClass('disabled');
    },

    disableOrderButton: function() {
            if($('.js-giftcard-side__wrapper').length && $('.js-giftcard-side__wrapper').data('paid') == true){
                //do nothing
            }else{
                var ORDER_BTN = '#placeOrderForm1 #placeOrder';
                $(ORDER_BTN).addClass('disabled');
        }
    }
};
