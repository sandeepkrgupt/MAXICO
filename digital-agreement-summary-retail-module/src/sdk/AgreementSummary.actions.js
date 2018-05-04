import React from 'react';
import SDK from 'digital-sdk';
import __ from 'lodash';
import DigitalComponents from 'digital-common-components';
import actionsConfig from 'digital-agreement-summary-retail-module/src/sdk/AgreementSummary.actions.config';
import errorConfig from 'digital-agreement-summary-retail-module/src/sdk/AgreementSummary.errors';
import SDKConfig from 'digital-agreement-summary-retail-module/src/sdk/AgreementSummary.sdk.config';
import ActionTypes from 'digital-agreement-summary-retail-module/src/sdk/AgreementSummary.actionTypes';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';
import {registerReducer} from 'digital-agreement-summary-retail-module/src/sdk/reducers/AgreementSummary.reducer';
import CreateSalesAgreement from 'digital-create-sales-agreement-retail-module/lib/sdk/CreateSalesAgreement.actions';
import LoginActions from 'digital-login-module/src/sdk/Login.actions';
import PopupAction from 'digital-popup-module/src/sdk/Popup.actions';
import DashboardActions from 'digital-dashboard-retail-module/src/sdk/Dashboard.actions';
import SetBusinessGroup from 'digital-set-business-group-retail-module/src/sdk/SetBusinessGroup.actions';
import SalesAgreementAction from 'digital-create-sales-agreement-retail-module/src/sdk/CreateSalesAgreement.actions';
import CustomerAction from 'digital-customer-retail-module/src/sdk/Customer.actions';
import defaultConfig from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.config';
import SelectPlanAction from 'digital-select-plan-retail-module/src/sdk/SelectPlan.actions';
import {PAYMENT_BOX_SIMULATOR_URL, DIGITAL_JSP_RETURN_URL} from '../widget/AgreementSummary.consts';

registerReducer();

const CommerceService = new SDK.DigitalServicesImpl.DigitalCommerceService();
const CareService = new SDK.DigitalServicesImpl.DigitalCareService();

export default class extends SDK.ActionClass {
    constructor(connectParams, store) {
        super(connectParams, store, SDKConfig, actionsConfig, errorConfig);
    }

    setActions() {
        super.setActions();
        this.createSalesAgreementAction = new CreateSalesAgreement(
            {contextId: this.connectParams.contextId}, this.store);
        this.SetBusinessGroupAction = new SetBusinessGroup(
            {contextId: this.connectParams.contextId}, this.store);

        this.loginActions = new LoginActions({}, this.store);
        this.dashboardActions = new DashboardActions({}, this.store);
        this.salesAgreementAction = new SalesAgreementAction({
            contextId: this.connectParams.contextId
        }, this.store);
        this.customerAction = new CustomerAction({
            contextId: this.connectParams.contextId
        }, this.store);
        this.popupAction = new PopupAction({}, this.store);
        this.selectPlanAction = new SelectPlanAction({contextId: this.connectParams.contextId}, this.store);
    }

    getInitialData() {
        const initData = {
            totalAgreementSummaryGroupsData: {},
            totalAgreementSummaryPriceData: {},
            cancelOrderStatus: {},
            configurePlanData: {},
            cancelOrderInProgress: false,
            submitSalesAgreementInProgress: false
        };
        return initData;
    }

    fetchMaxImageConfigurationSuccess(response) {
        const ASC_CONFIGURATION = response.data;
        this.dispatchStoreAction(ActionTypes.UPDATE_MAX_IMAGE_DATA, {
            ascConfiguration: ASC_CONFIGURATION
        });
        return {
            ascConfiguration: ASC_CONFIGURATION
        };
    }

    fetchMaxImageConfigurationFailure(error) {
        return error;
    }

    fetchMaxImageConfiguration() {
        const serviceRequestPromise = this.serviceRequest(
            CareService,
            CareService.getASCConfiguration,
            {},
            ActionTypes.GET_MAX_IMAGE_CONFIGURATION
        );

        serviceRequestPromise.then((result) => {
            this.fetchMaxImageConfigurationSuccess(result);
        }).catch((err) => {
            this.fetchMaxImageConfigurationFailure(err);
        });
    }

    getManageDocumentsConfig() {
        const storeData = this.getData();
        const {ascConfiguration} = storeData;
        const customerID = this.customerAction.getCustomerId();
        const archiveID = this.salesAgreementAction.getOrderId();
        return {
            ...defaultConfig.MANAGE_DOCUMENT_CONFIG,
            ...ascConfiguration,
            customerID,
            archiveID
        };
    }

    setInputParameters() {
        const initialData = this.getInitialData();
        this.dispatchStoreAction(ActionTypes.SET_AGREEMENT_SUMMARY_INPUT_PARAMETERS,
            initialData);
        const payload = this.getSalesAgreementPayload();
        this.fetchMaxImageConfiguration();
        this.fetchSalesAgreementSummary(payload);
    }

    /* Services */

    getSalesAgreementPayload() {
        let salesAgreementOrderID = null;
        let salesAgreementID = null;
        let userId = null;

        const createSAOrderID = this.createSalesAgreementAction.getOrderId();
        const createSAID = this.createSalesAgreementAction.getAgreementId();

        if (createSAOrderID && createSAID) {
            salesAgreementOrderID = createSAOrderID;
            salesAgreementID = createSAID;
        }

        if (this.loginActions) {
            userId = this.loginActions.getUserId();
        }

        return {salesAgreementOrderID, salesAgreementID, userId};
    }

    getSalesAgreementSummary() {
        return this.getData();
    }

    getAddSharedAllowanceData() {
        return this.getData().addSharedAllowanceData;
    }

    getConfigurePlanData() {
        return this.getData().configurePlanData;
    }

    fetchSalesAgreementSummary(payload, config) {
        const serviceRequestPromise = this.serviceRequest(
            CommerceService,
            CommerceService.getSalesAgreementSummary,
            {
                data: payload,
                config
            },
            ActionTypes.RESERVE_SALES_AGREEMENT
        );

        serviceRequestPromise.then((result) => {
            if (result && result.data && result.data.salesAgreementSummary) {
                const agreementSummaryData = result.data.salesAgreementSummary;
                const totalAgreementSummaryPriceData = this.fetchTotalAgreementSummaryPriceData(agreementSummaryData);
                const totalAgreementSummaryGroupsData = this.fetchTotalAgreementSummaryGroupsData(agreementSummaryData);
                const totalAgreementSummaryFreeMonthsData =
                    this.fetchTotalAgreementSummaryFreeMonthsData(agreementSummaryData);
                const salesAgreementStatusData = this.fetchSalesAgreementStatus(agreementSummaryData);
                const salesAgreementSummaryData =
                    {totalAgreementSummaryPriceData,
                        totalAgreementSummaryFreeMonthsData,
                        totalAgreementSummaryGroupsData,
                        salesAgreementStatusData};
                this.dispatchStoreAction(ActionTypes.UPDATE_SALES_AGREEMENT_SUMMARY_DATA,
                    salesAgreementSummaryData);
            }
        }).catch((err) => {
            console.log(err); // NOSONAR
        });
    }

    fetchTotalAgreementSummaryPriceData(inputData) {
        const totalAgreementSummaryPriceData = {};
        totalAgreementSummaryPriceData.totalAgreementPrice = {};
        this.fetchTotAgrSumRecurringData(totalAgreementSummaryPriceData, inputData);
        this.fetchTotAgrSumImmediateData(totalAgreementSummaryPriceData, inputData);
        this.fetchTotAgrSumImmediatePayData(totalAgreementSummaryPriceData, inputData);
        totalAgreementSummaryPriceData.subscriptionsNo = inputData.totalQuantity;
        totalAgreementSummaryPriceData.commissionAffectation = inputData.commissionAffectation;
        totalAgreementSummaryPriceData.agreementName = inputData.agreementName;
        totalAgreementSummaryPriceData.freeMonths = inputData.freeMonths;
        totalAgreementSummaryPriceData.totalImmediateWithoutTax = inputData.totalImmediateWithoutTax;
        totalAgreementSummaryPriceData.totalImmediateWithTax = inputData.totalImmediateWithTax;
        totalAgreementSummaryPriceData.totalMonthlyWithoutTax = inputData.totalMonthlyWithoutTax;
        totalAgreementSummaryPriceData.totalMonthlyWithTax = inputData.totalMonthlyWithTax;
        totalAgreementSummaryPriceData.installments = inputData.totalPriceDetails.installments;
        totalAgreementSummaryPriceData.addressDetailsForSA = inputData.addressDetailsForSA;
        if (inputData.salesAgreementStatus) {
            totalAgreementSummaryPriceData.salesAgreementStatus = inputData.salesAgreementStatus;
        }
        return totalAgreementSummaryPriceData;
    }

    fetchTotAgrSumRecurringData(totalAgreementSummaryPriceData, inputData) {
        if (inputData.totalPriceDetails && inputData.totalPriceDetails.recurringCharge) {
            totalAgreementSummaryPriceData.totalAgreementPrice.services = {
                price: inputData.totalPriceDetails.recurringCharge.totalFinalAmountWithoutTax,
                freeMonths: []
            };
            if (!totalAgreementSummaryPriceData.totalAgreementPrice.includeTax) {
                totalAgreementSummaryPriceData.totalAgreementPrice.includeTax = {};
            }
            totalAgreementSummaryPriceData.totalAgreementPrice.includeTax.services = {
                price: inputData.totalPriceDetails.recurringCharge.totalAmountWithTax
            };
        }
    }

    fetchTotAgrSumImmediateData(totalAgreementSummaryPriceData, inputData) {
        if (inputData.totalPriceDetails && inputData.totalPriceDetails.immediateCharge) {
            totalAgreementSummaryPriceData.totalAgreementPrice.devices = {
                fullPrice: inputData.totalPriceDetails.immediateCharge.totalFinalAmountWithoutTax
            };
            if (!totalAgreementSummaryPriceData.totalAgreementPrice.includeTax) {
                totalAgreementSummaryPriceData.totalAgreementPrice.includeTax = {};
            }
            totalAgreementSummaryPriceData.totalAgreementPrice.includeTax.devices = {
                fullPrice: inputData.totalPriceDetails.immediateCharge.totalAmountWithTax
            };
        }
    }

    fetchTotAgrSumImmediatePayData(totalAgreementSummaryPriceData, inputData) {
        // TODO- next iteration
        totalAgreementSummaryPriceData.totalAgreementPrice.immediatePayment = {
            devicesFullPrice: null,
            installmentPayment: null,
            serviceDeposit: null
        };
    }

    fetchTotalAgreementSummaryFreeMonthsData(inputData) {
        let freeMonths = [];
        if (inputData.freeMonths) {
            freeMonths = Object.values(inputData.freeMonths);
            if (freeMonths.length > 0 && freeMonths[0] !== '0') {
                return freeMonths;
            }
            return [];
        }
        return freeMonths;
    }

    fetchTotalAgreementSummaryGroupsData(inputData) {
        const totalAgreementSummaryGroupsData = {};
        totalAgreementSummaryGroupsData.businessGroups = [];
        if (inputData.businessGroupDetails && inputData.businessGroupDetails.length > 0) {
            totalAgreementSummaryGroupsData.businessGroups = inputData.businessGroupDetails.map((groupItem) => {
                const newGroupItem = {
                    groupName: groupItem.groupName,
                    groupID: groupItem.groupID,
                    sharedAllowance: groupItem.sharedAllowance
                };

                newGroupItem.bots = groupItem.boTemplate && groupItem.boTemplate.map((botItem) => {
                    return this.fetchTotAgrSumBotsPlanData(botItem);
                });

                return newGroupItem;
            });
        }
        return totalAgreementSummaryGroupsData;
    }

    fetchTotAgrSumBotsPlanData(botItem) {
        const newBotItem = {};
        newBotItem.plan = {};
        if (botItem.basePlan) {
            newBotItem.plan.planName = botItem.basePlan.planName;
            if (botItem.basePlan.planPriceDetails && botItem.basePlan.planPriceDetails.recurringCharge) {
                newBotItem.plan.price = botItem.basePlan.planPriceDetails.recurringCharge.finalAmoutWithoutTax;
                newBotItem.plan.totalSubscriptionsPrice =
                    botItem.basePlan.planPriceDetails.recurringCharge.totalFinalAmountWithoutTax;
                newBotItem.plan.finalAmountWithoutTax =
                    botItem.basePlan.planPriceDetails.recurringCharge.finalAmountWithoutTax;
                if (botItem.basePlan.planPriceDetails.recurringCharge.discountPercentage) {
                    newBotItem.plan.discountPercentage =
                        botItem.basePlan.planPriceDetails.recurringCharge.discountPercentage;
                    newBotItem.plan.discountDuration =
                        botItem.basePlan.planPriceDetails.recurringCharge.discountDuration;
                    newBotItem.plan.discountAmountWithoutTax =
                        botItem.basePlan.planPriceDetails.recurringCharge.discountAmountWithoutTax;
                    newBotItem.plan.amoutWithoutTax =
                        botItem.basePlan.planPriceDetails.recurringCharge.amoutWithoutTax;
                }
            }
        }
        newBotItem.plan.orderActionID = botItem.orderActionID;
        newBotItem.plan.orderID = botItem.orderID;
        newBotItem.plan.subscriptionsNo = botItem.quantity;
        newBotItem.plan.productOffering = botItem.productOffering;
        newBotItem.addOns = botItem.addOnsPlans;
        newBotItem.addOnsTotal = botItem.addOnsTotal;

        this.fetchTotAgrSumBotsDeviceData(newBotItem, botItem);

        return newBotItem;
    }

    performCreditCheckSuccess(response) {
        this.dispatchStoreAction(
            ActionTypes.SET_CREDIT_STATUS, {creditStatus: response.data.responseCreditCheck.statusReason});
        if (Object.keys(response.data.responseCreditCheck).length !== 0) {
            if (response.data.responseCreditCheck.creditStatus !== 'RA') {
                const stateData = this.getData();
                const agreementName = stateData.totalAgreementSummaryPriceData.agreementName;
                this.dashboardActions.setSuccessMessage(`${agreementName}
                    Fué exitosamente enviado a validación de crédito`);
                this.dispatchStoreAction(ActionTypes.GO_TO_DASHBOARD, {});
            } else {
                this.openCreditCheckRejectedPopup();
            }
        }
    }

    performCreditCheckFailure() {

    }

    openCreditCheckRejectedPopup() {
        let creditStatus = this.getData().creditStatus;
        const isStatusCodeInMeassages = messages.creditStatus;
        if (!isStatusCodeInMeassages) {
            creditStatus = 'DEFAULT';
        }
        const data = {
            backdrop: 'static',
            closeButtonAction: () => { this.dispatchStoreAction(ActionTypes.GO_TO_DASHBOARD, {}); },
            header: {
                img: 'resources/pic/limitation.svg',
                title: messages.creditResults.defaultMessage
            },
            body: (
                <div>
                    <div>{messages.rejectionReason.defaultMessage}</div>
                    <div className="text-center modal-icon-wrap">
                        <img src="resources/pic/rejected.jpg" alt="rejected" />
                        <span className="modal-icon-wrap-title">{messages[creditStatus].defaultMessage}</span>
                    </div>
                </div>
            ),
            footer: {
                rightButton: {
                    title: messages.cancelAgreement.defaultMessage,
                    action: this.cancelAgreementPopupAction
                }
            },
            popupType: ''
        };
        this.popupAction.openPopup(data);
    }

    fetchTotAgrSumBotsDeviceData(newBotItem, botItem) {
        newBotItem.device = {};
        newBotItem.device.isBYOD = false;

        // TODO -'device' convention instead of 'plan' in the params
        if (botItem.deviceDetails) {
            newBotItem.device.deviceName = botItem.deviceDetails.planName;
            if (botItem.deviceDetails.planPriceDetails &&
                botItem.deviceDetails.planPriceDetails.immediateCharge) {
                newBotItem.device.fullPrice =
                    botItem.deviceDetails.planPriceDetails.immediateCharge.finalAmountWithoutTax;
                newBotItem.device.totalSubscriptionsPrice =
                    botItem.deviceDetails.planPriceDetails.immediateCharge.totalFinalAmountWithoutTax;

                newBotItem.device.immediateCharge = botItem.deviceDetails.planPriceDetails.immediateCharge;
            }
            if (botItem.deviceDetails.planPriceDetails &&
                botItem.deviceDetails.planPriceDetails.installments) {
                newBotItem.device.installments = botItem.deviceDetails.planPriceDetails.installments;
            }
        } else {
            newBotItem.device.isBYOD = true;
            newBotItem.device.deviceName = messages.byodDeviceName.defaultMessage;
        }
    }

    goToConfigurePlan(data) {
        const payload = {
            orderActionId: data.orderActionID
        };

        if (data.isConfigureSharedAllowance) {
            payload.isConfigureSharedAllowance = true;
            payload.isConfigureBOT = false;
            payload.groupName = data.groupName;
            payload.planName = data.planName;
            payload.sharedAllowanceName = data.planName;
        } else {
            payload.isConfigureBOT = true;
            payload.isConfigureSharedAllowance = false;
            payload.planName = data.planName;
            payload.deviceName = data.deviceName;
        }

        this.dispatchStoreAction(ActionTypes.UPDATE_CONFIGURE_PLAN_DATA, {configurePlanData: payload});
        this.dispatchStoreAction(ActionTypes.GO_TO_CONFIGURE_PLAN, {});
    }

    goToSharedAllowance(data) {
        const summaryData = this.getSalesAgreementSummary();
        const payloadData = this.getSalesAgreementPayload();
        const {businessGroups} = summaryData.totalAgreementSummaryGroupsData;
        const businessGroup = __.find(businessGroups, (bsGroup) => {
            return bsGroup.groupName === data.groupName;
        });

        const addSharedAllowanceData = {
            addSharedAllowanceData: {
                ...payloadData,
                agreementName: summaryData && summaryData.totalAgreementSummaryPriceData ?
                    summaryData.totalAgreementSummaryPriceData.agreementName : '',
                groupName: data.groupName,
                groupId: summaryData && summaryData.totalAgreementSummaryGroupsData ? businessGroup.groupID : ''
            }
        };

        this.dispatchStoreAction(ActionTypes.UPDATE_ADD_SHARED_ALLOWANCE_DATA,
            addSharedAllowanceData);

        this.dispatchStoreAction(ActionTypes.GO_TO_ADD_SHARED_ALLOWANCE, {});
    }

    getCreditCheckPayload() {
        const creditCheckData = this.getSalesAgreementPayload();
        const prepareCreditCheckJson = {
            salesAgreementOrderId: creditCheckData.salesAgreementOrderID,
            salesAgreementID: creditCheckData.salesAgreementID,
            userId: creditCheckData.userId
        };
        return prepareCreditCheckJson;
    }

    performCreditCheck() {
        const payload = this.getCreditCheckPayload();
        return new Promise((resolve, reject) => {
            const serviceRequestPromise = this.serviceRequest(
                CommerceService,
                CommerceService.performCreidtCheck,
                {payload}, ActionTypes.PERFORM_CREDIT_CHECK,
                this.performCreditCheckSuccess.bind(this),
                this.performCreditCheckFailure.bind(this)
            );
            serviceRequestPromise.then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    performSubmitSalesAgreement() {
        let userId = null;
        let saOrderId = null;
        if (this.loginActions) {
            userId = this.loginActions.getUserId() || 'Asmsa1';
        }
        if (this.createSalesAgreementAction) {
            saOrderId = this.createSalesAgreementAction.getOrderId() || '528';
        }
        const data = {
            userId
        };
        const payload = {
            saOrderId
        };
        return new Promise((resolve, reject) => {
            const submitSalesAgreementInProgress = this.getData().submitSalesAgreementInProgress;
            if (!submitSalesAgreementInProgress) {
                const serviceRequestPromise = this.serviceRequest(
                    CommerceService,
                    CommerceService.performSubmitSalesAgreement,
                    {payload, data},
                    ActionTypes.PERFORM_SUBMIT_SALES_AGREEMENT,
                    this.performSubmitSalesAgreementSuccess.bind(this),
                    this.performSubmitSalesAgreementFailure.bind(this)
                );
                serviceRequestPromise.then((res) => {
                    resolve(res);
                }).catch((err) => {
                    if (err) {
                        reject(err);
                    }
                });
            }
        });
    }

    performSubmitSalesAgreementSuccess() {
        const stateData = this.getData();
        const agreementName = stateData.totalAgreementSummaryPriceData.agreementName;
        this.dashboardActions.setSuccessMessage(
            (messages.agreementSummarySubmitSuccess.defaultMessage).replace('{agreementName}', agreementName));
        this.dispatchStoreAction(ActionTypes.GO_TO_DASHBOARD, {});
    }

    performSubmitSalesAgreementFailure(response) {

    }

    updateFreeMonths(freeMonths, update) {
        this.popupAction.closePopup();
        const payload = {};
        let salesAgreementId = null;
        let userId = null;
        if (this.loginActions) {
            userId = this.loginActions.getUserId() || 'Asmsa1';
        }
        if (this.createSalesAgreementAction) {
            salesAgreementId = this.createSalesAgreementAction.getAgreementId() || '100000589';
        }

        const data = {
            userId,
            salesAgreementId
        };
        if (update) {
            const stateData = this.getData();
            const preSelectedMonths = stateData.totalAgreementSummaryFreeMonthsData.map(Number);
            if (freeMonths.length >= preSelectedMonths.length) {
                for (let i = 0; i < freeMonths.length; i += 1) {
                    const key = `freeMonth${i + 1}`;
                    payload[key] = `${freeMonths[i]}`;
                }
            } else {
                for (let i = 0; i < preSelectedMonths.length; i += 1) {
                    const key = `freeMonth${i + 1}`;
                    payload[key] = freeMonths[i] ? `${freeMonths[i]}` : '0';
                }
            }
        } else {
            for (let i = 0; i < freeMonths.length; i += 1) {
                const key = `freeMonth${i + 1}`;
                payload[key] = `${freeMonths[i]}`;
            }
        }


        return new Promise((resolve, reject) => {
            const serviceRequestPromise = this.serviceRequest(
                CommerceService,
                CommerceService.updateFreeMonth,
                {payload, data},
                ActionTypes.UPDATE_FREE_MONTHS,
                this.updateFreeMonthsSuccess.bind(this),
                this.updateFreeMonthsFailure.bind(this)
            );
            serviceRequestPromise.then((res) => {
                resolve(res);
            }).catch((err) => {
                if (err) {
                    reject(err);
                }
            });
        });
    }

    updateFreeMonthsSuccess(response) {
        const updateFreeMonthResponse = response.data;
        let freeMonths;
        if (updateFreeMonthResponse && updateFreeMonthResponse.status === 'Success') {
            delete updateFreeMonthResponse.status;
            freeMonths = Object.values(updateFreeMonthResponse);
            if (!(freeMonths.length > 0 && freeMonths[0] !== '0')) {
                freeMonths = [];
            }
            const totalAgreementSummaryFreeMonthsData = freeMonths;
            const freeMonthsData = {totalAgreementSummaryFreeMonthsData};
            this.dispatchStoreAction(ActionTypes.UPDATE_SALES_AGREEMENT_SUMMARY_DATA, freeMonthsData);
        }
    }

    updateFreeMonthsFailure(response) {

    }

    goToSelectPlan(data) {
        this.SetBusinessGroupAction.setBusinessGroup(data.groupID, data.groupName);
        // set flow type 'isFlowFromSetBG = false' to navigate back to Agreement summary page
        this.selectPlanAction.dispatchStoreAction(ActionTypes.SET_SELECT_PLAN_INPUT_PARAMETERS,
            {isFlowFromSetBG: false});

        this.dispatchStoreAction(ActionTypes.GO_TO_SELECT_PLAN_SCREEN,
            {groupName: data.groupName});
    }

    goToSetBusinessGroup() {
        // set flow type 'isFlowFromSetBG = false' to navigate back to Agreement summary page
        this.selectPlanAction.dispatchStoreAction(ActionTypes.SET_SELECT_PLAN_INPUT_PARAMETERS,
            {isFlowFromSetBG: false});
        this.dispatchStoreAction(ActionTypes.GO_TO_SET_BUSINESS_GROUP);
    }

    goToDeliveryOptionPage() {
        this.dispatchStoreAction(ActionTypes.GO_TO_DELIVERY_OPTION_PAGE);
    }

    removeBOTRestCall({orderId, isCancelAgreement, getSalesAgreementPayload}) {
        // TODO- remove 'if'. only for standlone testing
        if (!getSalesAgreementPayload.salesAgreementOrderID) {
            getSalesAgreementPayload.salesAgreementOrderID = '528';
            getSalesAgreementPayload.salesAgreementID = '100000589';
            getSalesAgreementPayload.userId = 'Asmsa1';
        }

        const data = {};

        return new Promise((resolve, reject) => {
            const cancelOrderInProgress = this.getData().cancelOrderInProgress;
            if (!cancelOrderInProgress) {
                const serviceRequestPromise = this.serviceRequest(
                    CommerceService,
                    CommerceService.cancelOrder,
                    {payload: {orderId, userId: getSalesAgreementPayload.userId}, data},
                    ActionTypes.CANCEL_ORDER
                );

                serviceRequestPromise.then((res) => {
                    resolve(res);
                    this.dispatchStoreAction(ActionTypes.CANCEL_ORDER_STATUS,
                        {cancelOrderStatus: res.data});
                    if (isCancelAgreement) {
                        this.dashboardActions.setSuccessMessage(messages.agreementCanceledMessageText.defaultMessage);
                        this.dispatchStoreAction(ActionTypes.GO_TO_DASHBOARD, {});
                    } else {
                        this.fetchSalesAgreementSummary(getSalesAgreementPayload);
                    }
                }).catch((err) => {
                    reject(err);
                    this.dispatchStoreAction(ActionTypes.CANCEL_ORDER_STATUS,
                        {cancelOrderStatus: err.data});
                });
            }
        });
    }

    removeBOT(data) {
        const getSalesAgreementPayload = this.getSalesAgreementPayload();
        return this.removeBOTRestCall(
            {
                orderId: data.orderID,
                isCancelAgreement: data.isCancelAgreement,
                getSalesAgreementPayload
            }
        );
    }

    getSalesAgreementStatus() {
        return this.createSalesAgreementAction.getStatus();
    }

    fetchSalesAgreementStatus(inputData) {
        const salesAgreementStatusData = {};
        salesAgreementStatusData.salesAgreementStatus = inputData.salesAgreementStatus;
        return salesAgreementStatusData;
    }

    getGenerateContractPayload() {
        const customerData = this.customerAction.getCustomerId();
        const loginData = this.loginActions.getUserId();
        let payload = {};
        if (customerData && loginData) {
            payload = {
                customerID: customerData,
                userId: loginData
            };
        } else {
            payload = {
                customerID: '100000157',
                userId: 'user123'
            };
        }
        return payload;
    }

    getSummaryStatusData() {
        const stateData = this.getData();
        return stateData;
    }

    handleGenerateContract() {
        const stateData = this.getData();
        const temp = '';
        if (stateData.salesAgreementStatusData.salesAgreementStatus.additionalInfo.policyStatus === 'approved') {
            const payload = this.getGenerateContractPayload();
            const data = this.createSalesAgreementAction.getAgreementId();
            const config = {responseType: 'arraybuffer'};
            return new Promise((resolve, reject) => {
                const serviceRequestPromise = this.serviceRequest(
                    CommerceService,
                    CommerceService.generateContract,
                    {payload, data, config},
                    ActionTypes.GENERATE_CONTRACT,
                    this.generateContractSuccess.bind(this),
                    this.generateContractFailure.bind(this)
                );
                serviceRequestPromise.then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return temp;
    }

    generateContractSuccess(response) {
        const contractDetails = response.data.RetrieveContractOutput;
        const fileName = contractDetails.fileName;
        const document = contractDetails.document;
        const newWindow = window.open();
        /*eslint-disable */
        newWindow.document.write(`<iframe src="data:application/pdf;base64,${document}" frameborder="0" allowfullscreen width="1700" height="1500"></iframe>`);
        newWindow.document.title = fileName;
    }

    generateContractFailure(response) {
        return response;
    }

    openCancelAgreementPopup(){
        const data = {
            header: {
                img: 'resources/pic/cancel.svg',
                title: messages.cancelAgreementHeaderText.defaultMessage
            },
            body: messages.cancelAgreementPopupBodyText.defaultMessage,
            footer: {
                rightButton: {
                    title: messages.cancelAgreementPopupFooterText.defaultMessage,
                    action: this.cancelAgreementPopupAction
                }
            },
            popupType: ''
        };
        this.popupAction.openPopup(data);
    }

    cancelAgreementPopupAction() {
        const agreementOrderID = this.createSalesAgreementAction.getOrderId();
        const data = {
            orderID: agreementOrderID,
            isCancelAgreement: true
        };
        this.removeBOT(data);
        this.popupAction.closePopup();
    }

    updatePBPaymentConfirmation(pbData) {
        if (pbData && pbData.message && (pbData.message.confirmNum || pbData.message.depositMsgCode)) {
            const {salesAgreementOrderID, userId} = this.getSalesAgreementPayload();
            const data = {salesAgreementOrderID, userId};

            const payload = {
                paymentConfirmationFromPB : {
                    pbImmediateConfirmationNumber: pbData.message.confirmNum,
                    pbSlipNumber: pbData.message.depositMsgCode
                }
            };

            const serviceRequestPromise = this.serviceRequest(
                CommerceService,
                CommerceService.updatePBPaymentConfirmation,
                {
                    data,
                    payload
                },
                ActionTypes.RESERVE_PAYMENT_CONFIRMATION_DATA
            );

            serviceRequestPromise.then((result) => {
                if (result) {
                    this.dashboardActions.setSuccessMessage(messages.orderSubmitAfterPaymentSuccess.defaultMessage);
                    this.dispatchStoreAction(ActionTypes.GO_TO_DASHBOARD, {});
                }
            }).catch((err) => {
                console.log(err); // NOSONAR
            });
        } else {
            const {Tooltip} = DigitalComponents.DigitalControllerComponents;
            const questionIcon = <img src="resources/pic/question.svg" alt="" />;

            const popupData = {
                header: {
                    img: 'resources/pic/limitation.svg',
                    title: messages.handlePayment.defaultMessage
                },
                body: (
                    <div>
                        { messages.paymentFailure.defaultMessage}
                        { pbData.message && pbData.message.depositErrorText &&
                            <Tooltip icon={questionIcon}>{pbData.message.depositErrorText}</Tooltip>
                        }
                        <div className="text-center modal-icon-wrap">
                            <img src="resources/pic/rejected.jpg" alt="rejected" />
                            <span className="modal-icon-wrap-title">{messages.failed.defaultMessage}</span>
                        </div>
                    </div>
                ),
                footer: {
                    rightButton: {
                        title: messages.ok.defaultMessage,
                        action: this.popupAction.closePopup
                    }
                }
            };
            this.popupAction.openPopup(popupData);
        }
    }

    openPaymentBoxPopUp() {
        const {salesAgreementOrderID, userId} = this.getSalesAgreementPayload();
        const payload = {salesAgreementOrderID, userId};

        const serviceRequestPromise = this.serviceRequest(
            CommerceService,
            CommerceService.handlePaymentLicToPB,
            {
                payload
            },
            ActionTypes.RESERVE_HANDLE_PAYMENT_DATA
        );

        serviceRequestPromise.then((result) => {
            if (result && result.data &&
                result.data.createPayOrderRequest && result.data.createPayOrderRequest.payOrder) {
                const storeData = this.getData();
                const {ascConfiguration} = storeData;
                let isSimulator = true;

                const lastSeparatorPathIndex = window.location.pathname.lastIndexOf('/') > 0 ?
                    window.location.pathname.lastIndexOf('/') : window.location.pathname.length;

                const baseURL = window.location.origin + window.location.pathname.slice(0, lastSeparatorPathIndex);
                let targetURL = baseURL + PAYMENT_BOX_SIMULATOR_URL;

                result.data.createPayOrderRequest.payOrder.returnURL = baseURL + DIGITAL_JSP_RETURN_URL;

                if (result.data.createPayOrderRequest.payOrder && ascConfiguration) {
                    if (ascConfiguration.IS_PAYMENT_BOX_SIMULATOR != null) {
                        isSimulator = ascConfiguration.IS_PAYMENT_BOX_SIMULATOR;
                    }

                    if (ascConfiguration.DIGITAL_JSP_RETURN_URL) {
                        result.data.createPayOrderRequest.payOrder.returnURL = baseURL + ascConfiguration.DIGITAL_JSP_RETURN_URL;
                    }

                    if (!isSimulator) {
                        targetURL = ascConfiguration.PAYMENT_BOX_URL;
                    }
                }

                const data = {
                    header: '',
                    body: result.data.createPayOrderRequest,
                    footer: '',
                    popupType: 'payment',
                    popupPaymentData: {
                        isSimulator,
                        targetURL,
                        updatePBPaymentConfirmation: this.updatePBPaymentConfirmation
                    }
                };

                this.popupAction.openPopup(data);
            }
        }).catch((err) => {
            console.log(err); // NOSONAR
        });
    }
    openUpdateFreeMonthsPopUp(e) {
        e.preventDefault();
        const data = {
            header: {
                img: 'resources/pic/add_black.svg',
                title: 'Agrega un mes gratis'
            },
            body: JSON.stringify(this.prepareFreeMonthsPopupData()),
            footer: {
                rightButton: {
                    action: this.updateFreeMonths
                }
            },
            popupType: 'freeMonths'
        };
        this.popupAction.openPopup(data);
    }
    prepareFreeMonthsPopupData() {
        const stateData = this.getData();
        const preSelectedMonths = stateData.totalAgreementSummaryFreeMonthsData.map(Number);
        const {FREE_MONTHS_START_FROM_MONTH, FREE_MONTHS_INTERVAL, FREE_MONTHS_TOTAL_MONTHS_NUMBER, FREE_MONTHS_MAX_FREE_MONTHS} = stateData.ascConfiguration;
        const startFromMonth = FREE_MONTHS_START_FROM_MONTH || 7;
        const interval = FREE_MONTHS_INTERVAL || 5;
        const totalMonthsNumber = FREE_MONTHS_TOTAL_MONTHS_NUMBER || 24;
        const maxFreeMonths = FREE_MONTHS_MAX_FREE_MONTHS || 3;
        // dummy values NOSONAR
        const freeMonthsData = {
            startFromMonth,
            preSelectedMonths,
            interval,
            totalMonthsNumber,
            maxFreeMonths
        };
        return freeMonthsData;
    }

    clearAllFreeMonths() {
        const data = {
            header: {
                img: 'resources/pic/cancel.svg',
                title: messages.clearAllHeaderText.defaultMessage
            },
            body: `${messages.ClearAllPopupBodyText1.defaultMessage} ${messages.ClearAllPopupBodyText2.defaultMessage}`,
            footer: {
                rightButton: {
                    title: messages.clearAllHeaderText.defaultMessage,
                    action: this.clearAllFreeMonthsPopupAction
                },
                leftButton: {
                    title: messages.CancelText.defaultMessage,
                    action: this.popupAction.closePopup
                }
            },
            popupType: ''
        };
        this.popupAction.openPopup(data);
    }

    clearAllFreeMonthsPopupAction() {
        const freeMonthsArray = [0, 0, 0];
        this.updateFreeMonths(freeMonthsArray);
        this.popupAction.closePopup();
    }

    getIsEditSalesAgreementFlowStatus(){
        return this.getData().isEditSalesAgreementFlow;
    }

    getPublicActions() {
        return [
            'getSalesAgreementSummary',
            'goToSharedAllowance',
            'getAddSharedAllowanceData',
            'goToSelectPlan',
            'goToSetBusinessGroup',
            'removeBOT',
            'getConfigurePlanData',
            'goToConfigurePlan',
            'getManageDocumentsConfig',
            'getSalesAgreementStatus',
            'handleGenerateContract',
            'getSummaryStatusData',
            'openCancelAgreementPopup',
            'cancelAgreementPopupAction',
            'clearAllFreeMonths',
            'clearAllFreeMonthsPopupAction',
            'goToDeliveryOptionPage',
            'updateFreeMonths',
            'openCreditCheckRejectedPopup',
            'getIsEditSalesAgreementFlowStatus',
            'openPaymentBoxPopUp',
            'updatePBPaymentConfirmation',
            'openUpdateFreeMonthsPopUp'
        ];
    }

    onStateUpdate(/* data */) {
        // here is the place to respond to relevant state data changes and call relevant actions
        // data argument contains the module mapped state data
    }
}

