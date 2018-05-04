import React, {Component} from 'react';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import Consts from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.consts';
import CreateAgreementActions from 'digital-create-sales-agreement-retail-module/src/sdk/CreateSalesAgreement.actions';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';
import BusinessGroup from './AgreementSummary.businessGroup';

class BusinessGroupList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    fetchData(data) {
        if (data.businessGroups && data.businessGroups.length > 0) {
            this.sa_status = this.props.totalAgreementSummaryPriceData.salesAgreementStatus.code;
            this.isBusinessGroups = true;
            this.businessGroupsCount = data.businessGroups.length;
            this.businessGroups = data.businessGroups.map((groupItem) => {
                const newGroup = {
                    groupName: groupItem.groupName,
                    groupID: groupItem.groupID
                };

                if (groupItem.sharedAllowance) {
                    newGroup.isSharedAllowance = true;
                    if (groupItem.sharedAllowance.basePlan) {
                        newGroup.sharedAllowanceName = groupItem.sharedAllowance.basePlan.planName;
                        const sharedAllowancePriceDetails = groupItem.sharedAllowance.basePlan.planPriceDetails;
                        newGroup.sharedAllowancePrice = this.props.formatPrice(
                            sharedAllowancePriceDetails &&
                            sharedAllowancePriceDetails.recurringCharge &&
                            sharedAllowancePriceDetails.recurringCharge.totalFinalAmountWithoutTax
                            , 'monthly', true);
                        newGroup.sharedAllowanceBasePlan = true;
                        newGroup.sharedAllowanceOrderId = groupItem.sharedAllowance.orderID;
                        newGroup.sharedAllowanceOrderActionId = groupItem.sharedAllowance.orderActionID;
                        this.discountShareAllowance(sharedAllowancePriceDetails, newGroup);
                    }
                    newGroup.isAddSharedAllowanceAllowed = groupItem.sharedAllowance.isAddAllowed;
                }

                if (groupItem.bots && groupItem.bots.length > 0) {
                    newGroup.isBots = true;
                    newGroup.bots = groupItem.bots.map((botItem) => {
                        const newBot = {};
                        if (botItem.plan) {
                            newBot.planName = botItem.plan.planName;
                            newBot.orderActionID = botItem.plan.orderActionID;
                            newBot.orderID = botItem.plan.orderID;
                            newBot.productOffering = botItem.plan.productOffering;
                            newBot.planPrice =
                                this.props.formatPrice(botItem.plan.finalAmountWithoutTax, 'monthly', true);
                            newBot.planSubscriptionsNo = botItem.plan.subscriptionsNo;
                            newBot.planTotalSubscriptionsPrice = this.props.formatPrice(
                                botItem.plan.totalSubscriptionsPrice, 'monthly', true);
                            this.discountPlan(botItem, newBot);

                            if (botItem.addOns) {
                                newBot.addOnsArray = [];
                                for (let i = 0; i < botItem.addOns.length; i += 1) {
                                    newBot.addOnsArray[i] = {};
                                    newBot.addOnsArray[i].discountPercentage =
                                        this.props.formatPercentage(botItem.addOns[i].planPriceDetails.recurringCharge.discountPercentage);
                                    newBot.addOnsArray[i].amoutWithoutTax = this.props.formatPrice(
                                        botItem.addOns[i].planPriceDetails.recurringCharge.amoutWithoutTax, 'monthly', true);
                                    newBot.addOnsArray[i].discountDuration = botItem.addOns[i].planPriceDetails.recurringCharge.discountDuration;
                                    newBot.addOnsArray[i].discountAmountWithoutTax = this.props.formatPrice(
                                        botItem.addOns[i].planPriceDetails.recurringCharge.discountAmountWithoutTax, 'monthly', true);
                                    newBot.addOnsArray[i].finalAmountWithoutTax = this.props.formatPrice(
                                            botItem.addOns[i].planPriceDetails.recurringCharge.finalAmountWithoutTax, 'monthly', true);
                                    newBot.addOnsArray[i].totalFinalAmountWithoutTax = this.props.formatPrice(
                                        botItem.addOns[i].planPriceDetails.recurringCharge.totalFinalAmountWithoutTax, 'monthly', true);
                                    newBot.addOnsArray[i].addOnsName = botItem.addOns[i].planName;

                                    if (botItem.addOns[i].planPriceDetails.recurringCharge.finalAmountWithoutTax === '0' ||
                                        botItem.addOns[i].planPriceDetails.recurringCharge.totalFinalAmountWithoutTax === '0') {
                                        newBot.addOnsArray[i].isChargeZero = true;
                                    } else {
                                        newBot.addOnsArray[i].isChargeZero = false;
                                    }
                                }
                            }

                            if (botItem.addOnsTotal) {
                                newBot.addOnsTotal = {};
                                newBot.addOnsTotal.addOnsSummaryWithoutTax = this.props.formatPrice(
                                    botItem.addOnsTotal.addOnsSummaryWithoutTax, 'monthly', true);
                                newBot.addOnsTotal.totalAddOnsSummaryWithoutTax = this.props.formatPrice(
                                    botItem.addOnsTotal.totalAddOnsSummaryWithoutTax, 'monthly', true);
                            }
                        }

                        if (botItem.device && !botItem.device.isBYOD) {
                            newBot.isBYOD = botItem.device.isBYOD;
                            newBot.deviceName = botItem.device.deviceName;
                            newBot.deviceFullPrice = this.props.formatPrice(
                                botItem.device.fullPrice, null, true);
                            if (botItem.device.installments) {
                                newBot.deviceTotalSubscriptionsPrice = this.props.formatPrice(
                                    botItem.device.totalSubscriptionsPrice, 'monthly', true);
                                newBot.totalFinalAmountWithoutTax = this.props.formatPrice(
                                    botItem.device.installments[0].installmentCharge.totalFinalAmountWithoutTax,
                                    'monthly', true);
                            } else {
                                newBot.deviceTotalSubscriptionsPrice = this.props.formatPrice(
                                    botItem.device.totalSubscriptionsPrice, null, true);
                                newBot.totalFinalAmountWithoutTax =
                                    this.props.formatPrice(botItem.device.immediateCharge.totalFinalAmountWithoutTax,
                                        'monthly', true);
                            }
                            this.discountDeviceFullPrice(botItem, newBot);

                            if (botItem.device.installments) {
                                newBot.isDeviceInstallments = true;
                                newBot.deviceInstallmentsCount = botItem.device.installments[0].months;
                                newBot.deviceInstallmentsPrice = this.props.formatPrice(
                                    botItem.device.installments[0].installmentCharge.finalAmountWithoutTax,
                                    'monthly',
                                    true);
                                newBot.deviceInstallmentAmoutWithoutTax = this.props.formatPrice(
                                    botItem.device.installments[0].installmentCharge.amoutWithoutTax,
                                    'monthly',
                                    true);
                                newBot.deviceInstallmentDiscountPercentage =
                                    this.props.formatPercentage(
                                        botItem.device.installments[0].installmentCharge.discountPercentage);
                                newBot.deviceInstallmentDiscountDuration =
                                    botItem.device.installments[0].installmentCharge.discountDuration;

                                newBot.deviceInstallmentDiscountAmountWithoutTax = this.props.formatPrice(
                                    botItem.device.installments[0].installmentCharge.discountAmountWithoutTax,
                                    'monthly',
                                    true);
                            }
                        } else {
                            newBot.isBYOD = botItem.device.isBYOD;
                            newBot.deviceName = botItem.device.deviceName;
                        }

                        return newBot;
                    });
                }

                return newGroup;
            });
        }
    }

    discountDeviceFullPrice(botItem, newBot) {
        if (botItem.device.immediateCharge && botItem.device.immediateCharge.discountPercentage) {
            newBot.immediateCharge = {};
            newBot.immediateCharge.finalAmountWithoutTax = this.props.formatPrice(
                botItem.device.immediateCharge.finalAmountWithoutTax, 'monthly', true);
            newBot.immediateCharge.amoutWithoutTax = this.props.formatPrice(
                botItem.device.immediateCharge.amoutWithoutTax, 'monthly', true);
            newBot.immediateCharge.discountPercentage = this.props.formatPercentage(
                botItem.device.immediateCharge.discountPercentage);
            newBot.immediateCharge.discountDuration =
                botItem.device.immediateCharge.discountDuration;
            newBot.immediateCharge.discountAmountWithoutTax = this.props.formatPrice(
                botItem.device.immediateCharge.discountAmountWithoutTax, 'monthly', true);
        }
    }

    discountPlan(botItem, newBot) {
        if (botItem.plan.discountPercentage) {
            newBot.planDiscountPercentage =
                this.props.formatPercentage(botItem.plan.discountPercentage);
            newBot.planDiscountDuration = botItem.plan.discountDuration;
            newBot.planDiscountAmountWithoutTax =
                this.props.formatPrice(botItem.plan.discountAmountWithoutTax, 'monthly', true);
            newBot.planAmoutWithoutTax =
                this.props.formatPrice(botItem.plan.amoutWithoutTax, 'monthly', true);
            newBot.planFinalAmountWithoutTax =
                this.props.formatPrice(botItem.plan.finalAmountWithoutTax, 'monthly', true);
        }
    }

    discountShareAllowance(sharedAllowancePriceDetails, newGroup) {
        if (sharedAllowancePriceDetails.recurringCharge.discountPercentage) {
            newGroup.sharedAllowance = {};
            newGroup.sharedAllowance.amoutWithoutTax =
                this.props.formatPrice(sharedAllowancePriceDetails.recurringCharge.amoutWithoutTax,
                    'monthly', true);
            newGroup.sharedAllowance.discountPercentage =
                this.props.formatPercentage(
                    sharedAllowancePriceDetails.recurringCharge.discountPercentage);
            newGroup.sharedAllowance.discountDuration =
                sharedAllowancePriceDetails.recurringCharge.discountDuration;
            newGroup.sharedAllowance.discountAmountWithoutTax =
                this.props.formatPrice(sharedAllowancePriceDetails.recurringCharge
                    .discountAmountWithoutTax, 'monthly', true);
            newGroup.sharedAllowance.finalAmountWithoutTax =
                this.props.formatPrice(sharedAllowancePriceDetails.recurringCharge
                    .finalAmountWithoutTax, 'monthly', true);
        }
    }

    render() {
        this.fetchData(this.props.totalAgreementSummaryGroupsData);

        return (
            <div id="businessGroupList">
                { this.isBusinessGroups && this.businessGroups.map((groupItem) => {
                    return (
                        <BusinessGroup key={groupItem.groupID} groupItem={groupItem} {...this.props} />
                    );
                })}
            </div>
        );
    }
}

export default BusinessGroupList;
