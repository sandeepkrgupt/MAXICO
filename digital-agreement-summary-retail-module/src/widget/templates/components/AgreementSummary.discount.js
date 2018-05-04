import React, {Component} from 'react';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import messages from 'digital-agreement-summary-retail-module/src/widget/AgreementSummary.i18n';


class DiscountAgreementSummary extends Component {

    render() {
        const {amoutWithoutTax, discountPercentage, discountDuration, discountAmountWithoutTax, finalAmountWithoutTax} = this.props;
        return (
            <span>
                <div>
                    <span><FormattedMessage {...messages.catalogPrice} /></span>
                    <span>{amoutWithoutTax}</span>
                </div>
                <div>
                    <p><FormattedMessage {...messages.discount} /></p>
                    <p> ({discountPercentage}) -{discountAmountWithoutTax}</p>
                </div>
                <div> For {discountDuration} Months</div>
                <strong>
                    <div>
                        <span> <FormattedMessage {...messages.price} /></span>
                        <span>{finalAmountWithoutTax}</span>
                    </div>
                </strong>
            </span>
        );
    }
}
export default DiscountAgreementSummary;
