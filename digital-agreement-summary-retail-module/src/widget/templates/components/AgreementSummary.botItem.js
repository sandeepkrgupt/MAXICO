import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import DigitalComponents from 'digital-common-components';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';
import {EDITABLE_STATUS} from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.consts';
import Discount from './AgreementSummary.discount';
import AddonsList from './AgreementSummary.addonsList';


const {Tooltip} = DigitalComponents.DigitalControllerComponents;


class BotItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.isToggleCollapse = true;
        this.removeBOT = this.props.removeBOT;
        this.goToConfigurePlan = this.props.goToConfigurePlan;
        this.sa_status = this.props.status;
    }

    toggleCollapse () {
        this.setState({isToggleCollapse: !this.state.isToggleCollapse});
    }

    fetchData(data) {
        this.bot = data.botItem;
    }

    render() {
        const discountIcon = <img src="resources/pic/discount.svg" alt="" />;
        this.fetchData(this.props);
        if (this.props.totalAgreementSummaryPriceData.salesAgreementStatus) {
            this.sa_status = this.props.totalAgreementSummaryPriceData.salesAgreementStatus.code;
        }
        return (
            <div>
                <div className="col-sm-12 offer-head">
                    <div className="row">
                        <div className="col-sm-5 col-md-5 offer-icon">
                            <img src="resources/pic/business-offer.svg" alt="" />
                            <h4>{this.bot.planName}</h4>
                            <p>{this.bot.productOffering}</p>
                        </div>
                        <div className="col-sm-2 col-md-2 border-left hidden-sm">

                            <dl className="description">
                                <dt><FormattedMessage {...messages.perSubscription} /></dt>
                                <dd>{this.bot.planSubscriptionsNo}</dd>
                            </dl>
                        </div>
                        <div className="col-sm-3 col-md-2 border-left">

                            <dl className="description">
                                <dt><FormattedMessage {...messages.subscriptions} /></dt>
                                <dd className="align-center">
                                    {this.bot.planPrice}
                                    {this.bot.planDiscountPercentage &&
                                    <Tooltip icon={discountIcon} >
                                        <Discount
                                            amoutWithoutTax={this.bot.planAmoutWithoutTax}
                                            discountPercentage={this.bot.planDiscountPercentage}
                                            discountDuration={this.bot.planDiscountDuration}
                                            discountAmountWithoutTax={this.bot.planDiscountAmountWithoutTax}
                                            finalAmountWithoutTax={this.bot.planFinalAmountWithoutTax}
                                        />
                                    </Tooltip>
                                    }
                                </dd>
                            </dl>
                        </div>
                        <div className="col-sm-3 col-md-2">

                            <dl className="description">
                                <dt><FormattedMessage {...messages.total} /></dt>
                                <dd>{this.bot.planTotalSubscriptionsPrice}</dd>
                            </dl>
                        </div>
                        {this.sa_status === EDITABLE_STATUS &&
                        <div className="col-sm-1">
                            <div className="settings">
                                <div className="settings-preview"><span /></div>
                                <div className="settings-list">
                                    <div
                                        className="settings-item"
                                        onClick={() => this.goToConfigurePlan({
                                            orderActionID: this.bot.orderActionID,
                                            planName: this.bot.planName,
                                            deviceName: this.bot.deviceName,
                                            isConfigureBOT: true
                                        })}>
                                        <span className="settings-icon">
                                            <img src="resources/pic/configure_blue.svg" alt="" />
                                        </span>
                                        <FormattedMessage {...messages.configure} />
                                    </div>
                                    <div className="settings-item" onClick={() => this.removeBOT({orderID: this.bot.orderID})}>
                                        <span className="settings-icon">
                                            <img src="resources/pic/remove.svg" alt="" />
                                        </span>
                                        <FormattedMessage {...messages.delete} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
                {
                    this.bot.addOnsArray && <AddonsList addOnsArray={this.bot.addOnsArray} addOnsTotal={this.bot.addOnsTotal} />
                }


                <div className="col-sm-12">
                    <div className="offer-body">
                        {this.bot.isAddOns &&
                        <div className="offer-accordion" id="accordion">
                            <div className="offer-accordion-heading">
                                <div className="row">
                                    <div className="col-sm-6 col-md-5 offer-title">
                                        <strong className="b-p3"> <FormattedMessage {...messages.addOns} />(4)</strong>
                                        <a
                                            className="offer-accordion-btn"
                                            data-toggle="collapse"
                                            data-parent="#accordion"
                                            href="#collapseOne"
                                            data-show="Show add-ons"
                                            data-hide="Hide add-ons">????</a>
                                    </div>
                                    <div className="col-sm-3 col-md-2 col-md-offset-2">

                                        <dl className="description description-small">
                                            <dt> <FormattedMessage {...messages.perSubscription} /></dt>
                                            <dd className="align-center">
                                                $xxxx/mo.
                                                <Tooltip icon={discountIcon} >
                                                    <FormattedMessage {...messages.tooltipAddOns} />
                                                </Tooltip>
                                            </dd>
                                        </dl>

                                    </div>
                                    <div className="col-sm-3 col-md-2">
                                        <dl className="description description-small">
                                            <dt> <FormattedMessage {...messages.total} /></dt>
                                            <dd>$xxxxx/mo.</dd>
                                        </dl>
                                    </div>
                                </div>

                            </div>
                            <div className="offer-accordion-content collapse" id="collapseOne">
                                <div className="row">
                                    <div className="col-sm-6 col-md-5">
                                        Add on Name #2.1
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 col-md-5">
                                        Add on Name #2.2
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 col-md-5">
                                        Add on Name #2.3
                                    </div>
                                    <div className="col-sm-3 col-md-2 col-md-offset-2">
                                        $5.00/mo.
                                    </div>
                                    <div className="col-sm-3 col-md-2">
                                        $150.00/mo.
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 col-md-5">
                                        Add on Name #2.4
                                    </div>
                                    <div className="col-sm-3 col-md-2 col-md-offset-2">
                                        $xxxx/mo.
                                    </div>
                                    <div className="col-sm-3 col-md-2">
                                        $xxxx0/mo.
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 col-md-5">
                                        Add on Name #2.5
                                    </div>
                                    <div className="col-sm-3 col-md-2 col-md-offset-2">
                                        $xxxx/mo.
                                    </div>
                                    <div className="col-sm-3 col-md-2">
                                        $xxxxxxxxx/mo.
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                        <div className="offer-item" id={`panelDevice_${this.bot.orderActionID}`}>
                            {!this.bot.isBYOD ?
                                <div className="row">
                                    <div className="col-sm-4 col-md-5 offer-icon">
                                        <img src="resources/pic/phone.svg" alt="" />
                                        <strong className="p-b3">{this.bot.deviceName}</strong>
                                    </div>
                                    <div className="col-sm-2 col-md-2 border-left">

                                        <dl className="description description-small">
                                            <dt><FormattedMessage {...messages.devices} /></dt>
                                            <dd>{this.bot.deviceInstallmentsCount}</dd>
                                        </dl>
                                    </div>
                                    <div className="col-sm-3 col-md-2 border-left">
                                        <dl className="description description-small">
                                            <dt> <FormattedMessage {...messages.devicePer} /></dt>
                                            {this.bot.isDeviceInstallments ?
                                                <dd>
                                                    {this.bot.deviceInstallmentsPrice}
                                                    {this.bot.deviceInstallmentDiscountPercentage &&
                                                    <Tooltip icon={discountIcon} >
                                                        <Discount
                                                            amoutWithoutTax={this.bot.deviceInstallmentAmoutWithoutTax}
                                                            discountPercentage={this.bot.deviceInstallmentDiscountPercentage}
                                                            discountDuration={this.bot.deviceInstallmentDiscountDuration}
                                                            discountAmountWithoutTax={this.bot.deviceInstallmentDiscountAmountWithoutTax}
                                                            finalAmountWithoutTax={this.bot.deviceInstallmentsPrice}
                                                    />
                                                    </Tooltip>
                                               }
                                                    <p>
                                                        {this.bot.deviceInstallmentsCount}&nbsp;
                                                        <FormattedMessage {...messages.installment} />
                                                    </p>

                                                </dd> :
                                                <dd>
                                                    {this.bot.deviceFullPrice}
                                                    <p> <FormattedMessage {...messages.fullPrice} />
                                                        {this.bot.immediateCharge &&
                                                this.bot.immediateCharge.discountPercentage &&
                                                    <Tooltip icon={discountIcon} >
                                                        <Discount
                                                            amoutWithoutTax={this.bot.immediateCharge.amoutWithoutTax}
                                                            discountPercentage={this.bot.immediateCharge.discountPercentage}
                                                            discountDuration={this.bot.immediateCharge.discountDuration}
                                                            discountAmountWithoutTax={this.bot.immediateCharge.discountAmountWithoutTax}
                                                            finalAmountWithoutTax={this.bot.immediateCharge.finalAmountWithoutTax}
                                                        />
                                                    </Tooltip>
                                                }
                                                    </p>
                                                </dd>}

                                        </dl>
                                    </div>
                                    <div className="col-sm-3 col-md-2">
                                        <dl className="description description-small">
                                            <dt><FormattedMessage {...messages.total} /></dt>
                                            <dd>{this.bot.totalFinalAmountWithoutTax}</dd>
                                        </dl>
                                    </div>
                                </div> :
                                <div className="row">
                                    <div className="col-sm-4 col-md-5 offer-icon">
                                        <img src="resources/pic/byod.svg" alt="" />
                                        <strong className="p-b3">{this.bot.deviceName}</strong>
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default BotItem;
