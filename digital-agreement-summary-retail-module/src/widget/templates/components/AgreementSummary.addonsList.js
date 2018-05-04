import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import DigitalComponents from 'digital-common-components';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';
import Discount from './AgreementSummary.discount';

const {Tooltip} = DigitalComponents.DigitalControllerComponents;

class addOnsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            discountOn: false
        };
    }

    changeDiscountStatus() {
        if (!this.state.discountOn) {
            this.setState({
                discountOn: true
            });
        }
    }

    render() {
        const {addOnsArray, addOnsTotal} = this.props;
        const discountIcon = <img src="resources/pic/discount.svg" alt="" />;

        return (
            <div className="col-sm-12">
                <div className="offer-body">

                    <div className="offer-accordion" id="accordion">
                        <div className="offer-accordion-heading">
                            <div className="row">
                                <div className="col-sm-6 col-md-5 offer-title">
                                    <strong className="b-p3">
                                        <FormattedMessage {...messages.addOnsCount} values={{count: this.props.addOnsArray.length}} />
                                    </strong>
                                    <a className="offer-accordion-btn" ><FormattedMessage {...messages.hideAddons} /> </a>
                                </div>
                                <div className="col-sm-3 col-md-2 col-md-offset-2">
                                    <dl className="description description-small">
                                        <dt><FormattedMessage {...messages.perSubscription} /></dt>
                                        <dd className="align-center">
                                            {this.props.addOnsTotal.addOnsSummaryWithoutTax}
                                            {this.state.discountOn &&
                                            <Tooltip icon={discountIcon} >
                                                <div>
                                                    To see discount details view specific Add Ons
                                                </div>
                                            </Tooltip>
                                            }
                                            <span className="tooltip-wrap">
                                                <span
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    data-original-title="To see discount details view specific Add On's">
                                                    <img src="pic/discount.svg" alt="" />
                                                </span>
                                            </span>
                                        </dd>
                                    </dl>
                                </div>
                                <div className="col-sm-3 col-md-2">
                                    <dl className="description description-small">
                                        <dt><FormattedMessage {...messages.total} /></dt>
                                        <dd>{this.props.addOnsTotal.totalAddOnsSummaryWithoutTax}</dd>
                                    </dl>
                                </div>
                            </div>

                        </div>
                        <div className="offer-accordion-content collapse in" id="collapseOne" aria-expanded="true">
                            {
                                addOnsArray && addOnsArray.length > 0 && addOnsArray.map((addOnsItem) => {
                                    return (
                                        <div className="row">
                                            <div className="col-sm-6 col-md-5">
                                                {addOnsItem.addOnsName}
                                            </div>
                                            { !addOnsItem.isChargeZero &&
                                                <div>
                                                    <div className="col-sm-3 col-md-2 col-md-offset-2">
                                                        {addOnsItem.finalAmountWithoutTax}
                                                        {addOnsItem.discountPercentage &&
                                                        <Tooltip icon={discountIcon} >
                                                            {this.changeDiscountStatus()}
                                                            <Discount
                                                                amoutWithoutTax={addOnsItem.amoutWithoutTax}
                                                                discountPercentage={addOnsItem.discountPercentage}
                                                                discountDuration={addOnsItem.discountDuration}
                                                                discountAmountWithoutTax={addOnsItem.discountAmountWithoutTax}
                                                                finalAmountWithoutTax={addOnsItem.finalAmountWithoutTax}
                                                    />
                                                        </Tooltip>
                                                }

                                                    </div>
                                                    <div className="col-sm-3 col-md-2">
                                                        {addOnsItem.totalFinalAmountWithoutTax}
                                                    </div>
                                                </div>
                                            }

                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default addOnsList;
