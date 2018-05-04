import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import DigitalComponents from 'digital-common-components';
import {EDITABLE_STATUS} from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.consts';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';
import BotItem from './AgreementSummary.botItem';
import Discount from './AgreementSummary.discount';


const {Tooltip} = DigitalComponents.DigitalControllerComponents;

class BusinessGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.isExpandEditMenu = false;
        this.goToSharedAllowance = this.props.goToSharedAllowance;
        this.goToSelectPlan = this.props.goToSelectPlan;
        this.removeBOT = this.props.removeBOT;
        this.goToConfigurePlan = this.props.goToConfigurePlan;
    }

    getExistingAllowedSharedAllowanceDiv() {
        const discountIcon = <img src="resources/pic/discount.svg" alt="" />;
        return (
            <div className="order-allowance">
                <div className="col-sm-8 col-md-9 order-allowance-icon">
                    <img src="resources/pic/allowance.svg" alt="" />
                    <h4>{this.businessGroup.sharedAllowanceName}</h4>
                </div>

                <div className="col-sm-3 col-md-2">
                    <dl className="description">
                        <dt><FormattedMessage {...messages.total} /></dt>
                        <dd>{this.businessGroup.sharedAllowancePrice}
                            {this.businessGroup.sharedAllowance && this.businessGroup.sharedAllowance.discountPercentage &&
                            <Tooltip icon={discountIcon} >
                                <Discount
                                    amoutWithoutTax={this.businessGroup.sharedAllowance.amoutWithoutTax}
                                    discountPercentage={this.businessGroup.sharedAllowance.discountPercentage}
                                    discountDuration={this.businessGroup.sharedAllowance.discountDuration}
                                    discountAmountWithoutTax={this.businessGroup.sharedAllowance.discountAmountWithoutTax}
                                    finalAmountWithoutTax={this.businessGroup.sharedAllowance.finalAmountWithoutTax}
                                />
                            </Tooltip>
                        }
                        </dd>
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
                                    orderActionID: this.businessGroup.sharedAllowanceOrderActionId,
                                    groupName: this.businessGroup.groupName,
                                    planName: this.businessGroup.sharedAllowanceName,
                                    isConfigureSharedAllowance: true
                                })}>
                                <span className="settings-icon">
                                    <img src="resources/pic/configure_blue.svg" alt="" />
                                </span>
                                <FormattedMessage {...messages.configure} />
                            </div>
                            <div
                                className="settings-item"
                                onClick={() => this.removeBOT({
                                    orderID: this.businessGroup.sharedAllowanceOrderId
                                })}>
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

        );
    }

    getDisabledSharedAllowanceDiv() {
        return (
            <div className="order-allowance disabled">
                <div className="order-allowance-icon">
                    <img src="resources/pic/business-offer.svg" alt="" />
                    <div>
                        <h4>{this.businessGroup.sharedAllowanceName}</h4>
                        <p className="icon-text p-b5">
                            <img src="resources/pic/info.svg" alt="" />
                            <FormattedMessage {...messages.addSharedAllowance} />
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    getAddSharedAllowanceDiv() {
        const questionIcon = <img src="resources/pic/question.svg" alt="" />;
        return (
            <div className="order-add">
                <div className="col-sm-8 col-md-9 order-add-title">
                    <span className="order-add-icon">
                        <img src="resources/img/plus.svg" alt="" />
                    </span>
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            this.goToSharedAllowance({groupName: this.businessGroup.groupName});
                        }}>
                        <FormattedMessage {...messages.addSharedAllowance} />
                        <Tooltip icon={questionIcon} >
                            <FormattedMessage {...messages.monthlyPaymentInfo} />
                        </Tooltip>
                    </a>
                </div>
            </div>
        );
    }

    getRelevantDivForSharedAllowance() {
        if (this.businessGroup.sharedAllowanceBasePlan) {
            if (this.businessGroup.isAddSharedAllowanceAllowed) {
                return this.getExistingAllowedSharedAllowanceDiv();
            }
            return this.getDisabledSharedAllowanceDiv();
        }
        if (this.sa_status === EDITABLE_STATUS) {
            return this.getAddSharedAllowanceDiv();
        }
        return '';
    }

    fetchData(data) {
        this.businessGroup = data.groupItem;
        this.sa_status = this.props.totalAgreementSummaryPriceData &&
            this.props.totalAgreementSummaryPriceData.salesAgreementStatus &&
            this.props.totalAgreementSummaryPriceData.salesAgreementStatus.code;
    }

    expandEditMenu() {
        this.setState({isExpandEditMenu: !this.state.isExpandEditMenu});
    }

    render() {
        this.fetchData(this.props);
        const businessGroupSummaryData = this.props.totalAgreementSummaryGroupsData ? {} : '';
        const businessGroupNumbers = businessGroupSummaryData.businessGroups ?
            businessGroupSummaryData.businessGroups.length :
            '';
        return (
            <div id={`businessGroup_${this.businessGroup.groupID}`}>
                <div className="row">
                    <div className="col-sm-12 justify">
                        <h2 className="subtitle">
                            <span className="subtitle-icon">
                                <img src="resources/pic/recipients.svg" alt="" />
                            </span>
                            {this.businessGroup.groupName}
                            <span className="p-b2 subtext">
                                ({businessGroupNumbers} <FormattedMessage {...messages.BusinessOffer} />)
                            </span>
                        </h2>
                        {this.sa_status === EDITABLE_STATUS &&
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                this.goToSelectPlan({
                                    groupName: this.businessGroup.groupName,
                                    groupID: this.businessGroup.groupID
                                });
                            }}><FormattedMessage {...messages.createBusinessOffer} /></a>
                        }
                    </div>
                </div>
                {this.sa_status === EDITABLE_STATUS &&
                <div className="row">
                    <div className="col-sm-12">
                        <h4 className="p-b3"><FormattedMessage {...messages.sharedAllowance} /></h4>
                    </div>
                </div>
                }
                <div className="row" id={`sharedAllowanceArea_${this.businessGroup.groupName}`}>
                    <div className="col-sm-12">
                        {this.getRelevantDivForSharedAllowance()}
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <h4 className="p-b3">{this.businessGroup.groupName}</h4>
                    </div>
                </div>
                <div id={`businessGroup_${this.businessGroup.groupID}`} className="row offer-list">
                    { this.businessGroup.isBots && this.businessGroup.bots.map((botItem) => {
                        return (
                            <BotItem
                                key={botItem.orderActionID}
                                botItem={botItem}
                                removeBOT={this.removeBOT}
                                goToConfigurePlan={this.goToConfigurePlan}
                                status={this.sa_status}
                                {...this.props}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default BusinessGroup;
